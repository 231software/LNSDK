import * as http from "http"
import { FMPLogger } from "./Logger"
import { resolve } from "path"

export enum HTTPMethod{
    GET,
    POST
}

function HTTPMethodTostring(method:HTTPMethod):string{
    switch(method){
        default:
        case HTTPMethod.GET:return "GET"
        case HTTPMethod.POST:return "POST"
    }
}
function stringToHTTPMethod(method:string):HTTPMethod{
    switch(method){
        default:
        case "GET":return HTTPMethod.GET
        case "POST":return HTTPMethod.POST
    }
}

export interface HTTPOptions{
    hostname:string,
    port?:number,
    path?:string,
    method?:HTTPMethod,
    headers?:any,
    agent?:string,
    timeout?:number,
    body?:string
}

export enum HTTPContentType{
    JSON
}

function contentType2Headers(contentType:HTTPContentType){
    switch(contentType){
        case HTTPContentType.JSON:return "application/json"
    }
}

/**
 * 由于nodejs不支持长期的http客户端，所以请求只能按单次请求创建，不能创建客户端来进行多次请求。  
 * 使用方法：
 * ```typescript
 * //先新建这个请求
 *  如果需要监听错误，那么就这么写
 * req.on("error",(e)=>{ 这里写错误处理的实现 };
 * //向请求写入请求体，如果需要的话
 * req.write( 请求体 );
 * const req=new HTTPRequest(...);
 * //最后发送数据并处理服务器的响应
 * req.send().then((result)=>{
 *     
 * }
 * ```
 */
export class HTTPRequest{
    rawRequest:http.ClientRequest|undefined
    options:HTTPOptions
    otherHTTPOptions:any
    //请求通过end发送之后，会产生一个resolve被存到这里，供nodejs的http请求的回调调用，它被调用之后send才能结束
    private sendResolve:(result:HTTPIncomingMessage)=>void=(result)=>{throw new Error("发送以下数据时，没有执行send就收到了请求结果！\n"+result)}
    constructor(options:HTTPOptions,otherOptions:any={}){
        this.options=options
        this.otherHTTPOptions=otherOptions
        const NodeJSHTTPOptions:http.RequestOptions=this.toRawRequestOptions()
        NodeJSHTTPOptions.method=HTTPMethodTostring(options.method!=undefined?options.method:HTTPMethod.GET)
        //request里面传入的回调只有在end之后才会被调用，所以此处需要取得下面的send方法内部的resolve
        this.rawRequest=http.request(this.toRawRequestOptions(),result=>{
            let downloadFinishResolve:(result:string)=>void
            //在这里立一个promise，resolve扔给下面的数据接收去解决
            this.sendResolve(new HTTPIncomingMessage(result,new Promise<string>(resolve=>downloadFinishResolve=resolve)))
            //开始接收响应体
            //监听器必须在end调用之前放置，否则有可能错过服务器发来的响应数据
            let data=''
            result.on("data",(chunk)=>data+=chunk)
            result.on("end",()=>downloadFinishResolve(data))//响应体接收完成，把数据接收那边resolve
        })
    }
    protected on(event:"error"|"abort",callback:(e:any)=>void){
        if(this.rawRequest===undefined)throw new Error("Please call send method first.")
        this.rawRequest.on(event,callback)
    }
    protected write(data:string){
        if(this.rawRequest===undefined)throw new Error("Please call send method first.")
        this.rawRequest.write(data)
    }
    private toRawRequestOptions():http.RequestOptions{
        return {
            hostname:this.options.hostname,
            port:this.options.port,
            path:this.options.path,
            headers:this.options.headers,
            //agent:options.agent,
            timeout:this.options.timeout,
            ...this.otherHTTPOptions
        }
    }
    get URL():string{
        return `http://${this.options.hostname}:${this.options.port}${this.options.path}`;
    }
    async send():Promise<HTTPIncomingMessage>{
        //end对应的才是真正发送数据，所以send里面执行的是end方法
        if(this.rawRequest===undefined)throw new Error("Please call send method first.")
        this.rawRequest.end()
        return new Promise<HTTPIncomingMessage>(resolve=>this.sendResolve=resolve);
    }
    /**
     * 发送一个简单的http请求  
     * 不能发送https请求，https请求请使用HTTPSRequest  
     * nodejs在实际工作中会分块下载http响应结果，但是为了和java那边兼容，fmp只能一次性接收所有数据
     * @param hostname 服务器主机名（IP地址或域名）
     * @param otherHTTPOptions 传递给nodejs的其他http参数，默认传入{}
     * @param onError 请求失败时的回调
     */
    static async sendSimpleGET(url:string,otherHTTPOptions:any={}){
        const {protocol,hostname,port,path}=parseUrl(url)
        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.GET,
            path
        },otherHTTPOptions)
        return new Promise<HTTPIncomingMessage>((resolve,reject)=>{
            req.on("error",e=>reject(e))
            req.send().then(result=>resolve(result))           
        })

        
    }
    static async sendSimplePOST(url:string,contentType:HTTPContentType,data:string,otherHTTPOptions:any={}){
        const {protocol,hostname,port,path}=parseUrl(url)
        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.POST,
            path,
            headers:{
                'Content-Length': Buffer.byteLength(data),
                'Content-Type':contentType2Headers(contentType)
            }
        },otherHTTPOptions)
        //写入要发送的数据
        req.write(data)
        return new Promise<HTTPIncomingMessage>((resolve,reject)=>{
            req.on("error",e=>reject(e))
            req.send().then(result=>resolve(result))            
        })
    }
}

export class HTTPIncomingMessage{
    private rawIncomingMessage:http.IncomingMessage
    private _body=""
    private downloadFinished:boolean
    private bodyResolve:((body:string)=>void)[]
    /**
     * 
     * @param rawIncomingMessage 原始传入消息对象
     * @param incomingData 消息上传完成时将这个promise resolve
     */
    constructor(rawIncomingMessage:http.IncomingMessage,incomingData:Promise<string>){
        this.rawIncomingMessage=rawIncomingMessage
        this.bodyResolve=[]
        //等待这个传入数据流传输完之后
        this.downloadFinished=false;
        //为了保证downloadFinished的初始化先执行，它必须位于incomingData的前面
        //IncomingMessage的构造方法总是在收到响应时立即被调用，所以它有机会接收服务器发来的所有数据
        incomingData.then(value=>{
            this._body=value;
            this.downloadFinished=true;
            //在数据下载完成时，resolve所有getBody
            this.bodyResolve.forEach(resolve=>resolve(value))            
        })
    }
    get statusCode(){
        return this.rawIncomingMessage.statusCode
    }
    get method(){
        return this.rawIncomingMessage.method?stringToHTTPMethod(this.rawIncomingMessage.method):undefined
    }
    get url(){
        return this.rawIncomingMessage.url
    }
    get headers(){
        return this.rawIncomingMessage.headers
    }
    async getBody(){
        //如果读取时数据已经传输完毕，则立即返回
        if(this.downloadFinished)return this._body
        //否则异步等待数据传输完毕再返回
        //此处用了数组存储resolve，这是因为getBody可能会被调用多次，进而产生多个线程
        return new Promise<string>(resolve=>this.bodyResolve.push(resolve))
    }
    //传入数据的分片下载是自动控制的，不能手动控制
    // on(event:"data"|"end",callback:(chunk?:any)=>void){
    //     this.rawIncomingMessage.on(event,callback)
    // }
}

export interface HTTPRespond{
    //状态码
    statusCode:number
    //响应头
    head:{[key:string]:any}
    //响应体
    body:string
    //编码
    charset:string
}

export class HTTPServer{
    _port:number
    private started:boolean;
    private onRequest:(request:HTTPIncomingMessage)=>HTTPRespond|Promise<HTTPRespond>;
    private server:http.Server|undefined
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>Promise<HTTPRespond>)
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>HTTPRespond)
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>HTTPRespond|Promise<HTTPRespond>){
        this._port=port
        this.started=false
        this.onRequest=onRequest
    }
    get port(){
        return this._port
    }
    set port(port:number){
        if(this.started)throw new Error("HTTP server has already been launched, port is locked and cannot be changed. To change port, disconnect all clients and stop the server first. ");
        this._port=port
    }
    async start(){
        await new Promise<void>(resolve=>{
            this.server=http.createServer((req,res)=>{
                let uploadFinishedResolve:(result:string)=>void
                const response=this.onRequest(new HTTPIncomingMessage(req,new Promise<string>(resolve=>uploadFinishedResolve=resolve)))
                //这里的请求（req）如果是post方法，会带有请求体，在下面接收
                let data=''
                req.on("data",chunk=>data+=chunk)
                //end会在任何情况下响应，所以如果不是post这类带请求体的请求，那么data会是一个空字符串
                req.on("end",()=>uploadFinishedResolve(data))
                //response是不是promise决定了这个流程要不要走异步
                new Promise<HTTPRespond>(resolve=>{
                    if(response instanceof Promise){
                        //把前边的response等到再进行响应
                        response.then(response=>{
                            resolve(response)
                        })
                    }
                    else{
                        resolve(response)
                    }

                }).then(response=>{
                    res.writeHead(response.statusCode,response.head)
                    res.end(response.body)

                })
            })
            this.server.listen(this._port,resolve)

        })
        this.started=true;
    }
    async stop(){
        await new Promise<void>((resolve,reject)=>{
            if(this.server===undefined){
                resolve()
                return;
            }
            this.server.on("close",resolve)
            this.server.on("error",reject)
            this.server.close()
            this.server=undefined
            
        })
        this.started=false
    }
}


/**
 * 拆解URL为四个部分：协议、主机名、端口号和路径。
 * @param url - 待解析的URL字符串。
 * @returns - 包含拆解后部分的JavaScript对象。
 */
function parseUrl(url:string) {
    // 定义结果对象，所有属性都有默认值
    const result:{
        protocol?:string,
        hostname:string,
        port?:number,
        path?:string
    } = {
        hostname: ''
    };

    // 如果URL为空或不是字符串，直接返回默认值
    if (!url || typeof url !== 'string') {
        return result;
    }

    // 1. 拆分协议
    // 检查是否以 "://" 开头
    const protocolMatch = url.match(/^([a-zA-Z]+:)?\/\//);
    if (protocolMatch) {
        result.protocol = protocolMatch[1] ? protocolMatch[1]+"//" : '';
        // 移除协议部分，继续解析剩余部分
        url = url.substring(protocolMatch[0].length);
    }

    // 2. 拆分主机名、端口和路径
    // 查找第一个斜杠 "/"，它通常是主机名和路径的分界线
    const pathIndex = url.indexOf('/');
    let hostAndPort = url;
    if (pathIndex !== -1) {
        // 存在路径，拆分出主机和路径
        hostAndPort = url.substring(0, pathIndex);
        result.path = url.substring(pathIndex);
    }

    // 3. 拆分主机名和端口号
    // 查找冒号 ":"，它通常是主机名和端口的分界线
    const portIndex = hostAndPort.indexOf(':');
    if (portIndex !== -1) {
        // 存在端口号
        result.hostname = hostAndPort.substring(0, portIndex);
        result.port = parseInt(hostAndPort.substring(portIndex + 1));
    } else {
        // 没有端口号，整个部分都是主机名
        result.hostname = hostAndPort;
    }

    return result;
}