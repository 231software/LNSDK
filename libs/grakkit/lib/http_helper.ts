import {} from "@grakkit/stdlib-paper"
import { FMPLogger } from "./Logger.js"
import {
    getByteLength,
    httpClientAPI,
    httpClientAPI_create,
    httpClientAPI_send,
    httpClientAPI_uploadBody,
    httpClientAPI_uploadBody_reload1,
    httpServerAPI,
    httpServerAPI_create,
    httpServerAPI_resolveResponse,
    httpServerAPI_setOnClientUploaded,
    httpServerAPI_setOnRequest,
    httpServerAPI_start,
    httpServerAPI_stop
} from "./GrakkitHelper.js"
const Bukkit=core.type("org.bukkit.Bukkit")
const javaInt=core.type("java.lang.Integer")
const javaObject=core.type("java.lang.Object");
const Consumer=core.type("java.util.function.Consumer");


//由于前面所有的api无法加载错误都会被当作错误抛出，所以后面根本不需要检查这些反射导入的函数的可用性

export enum HTTPMethod{
    GET,
    POST
}

function HTTPMethodTostring(method:HTTPMethod){
    switch(method){
        default:throw new Error("目前还不支持将第"+method+"种请求方法转换成字符串。")
        case HTTPMethod.GET:return "GET"
        case HTTPMethod.POST:return "POST"
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

/**
 * 由于nodejs不支持长期的http客户端，所以请求只能按单次请求创建，不能创建客户端来进行多次请求。  
 * 使用方法：
 * ```typescript
 * //先新建这个请求
 * const req=new HTTPRequest(...);
 * //如果需要监听错误，那么就这么写
 * req.on("error",(e)=>{ 这里写错误处理的实现 };
 * //向请求写入请求体，如果需要的话
 * req.write( 请求体 );
 * //最后发送数据并处理服务器的响应
 * req.send().then((result)=>{
 *     
 * }
 * ```
 */
export class HTTPRequest{
    rawRequest:string
    options:HTTPOptions
    constructor(options:HTTPOptions){
        //FMPLogger.info("新建请求。")
        this.options=options
        const method=HTTPMethodTostring(options.method!=undefined?options.method:HTTPMethod.GET)
        // if(method==="POST")FMPLogger.info("新建了POST请求。 ")
        this.options=options
        const requestProperties:{[key:string]:string}={}
        if(typeof options.agent==="string")requestProperties["User-Agent"]=options.agent
        const url="http://"
                +options.hostname
                +":"
                +(options.port===undefined?80:options.port)
                +(options.path===undefined?"":options.path);
        if(typeof url!=="string")FMPLogger.error("url拼接失败，url为空！");
        // FMPLogger.info(url);
        this.rawRequest=httpClientAPI_create.invoke(
            httpClientAPI,
            url,
            method,
            JSON.stringify(requestProperties),
            options.timeout?options.timeout:5000
        );
        //request里面传入的回调只有在end之后才会被调用，所以此处需要取得下面的send方法内部的resolve
        // this.rawRequest=http.request(this.toRawRequestOptions(),result=>{
        //     let downloadFinishResolve:(result:string)=>void
        //     //在这里立一个promise，resolve扔给下面的数据接收去解决
        //     this.sendResolve(new HTTPIncomingMessage(result,new Promise<string>(resolve=>downloadFinishResolve=resolve)))
        //     //开始接收响应体
        //     //监听器必须在end调用之前放置，否则有可能错过服务器发来的响应数据
        //     let data=''
        //     result.on("data",(chunk)=>data+=chunk)
        //     result.on("end",()=>downloadFinishResolve(data))//响应体接收完成，把数据接收那边resolve
        // })
    }
    //java这边可能不需要写这个方法
    // protected on(event:"error"|"abort",callback:(e:any)=>void){
    //     if(this.rawRequest===undefined)throw new Error("Please call send method first.")
    //     this.rawRequest.on(event,callback)
    // }
    protected write(data:string){
        if(this.rawRequest===undefined)throw new Error("Please call send method first.")
        //由于目前满月平台还不支持charset，所以这里直接指定为utf-8
        httpClientAPI_uploadBody.invoke(httpClientAPI,this.rawRequest,data,"UTF-8");
    }
    get URL():string{
        return `http://${this.options.hostname}:${this.options.port}${this.options.path}`;
    }
    async send():Promise<HTTPIncomingMessage>{
        //end对应的才是真正发送数据，所以send里面执行的是end方法
        if(this.rawRequest===undefined)throw new Error("Please call send method first.")
        let onBodyDownloaded:(value: string | PromiseLike<string>)=>void=body=>{throw new Error("onBodyDownloaded还未初始化！")}
        //调用send并等待
        return new Promise<HTTPIncomingMessage>(resolve=>httpClientAPI_send.invoke(httpClientAPI,this.rawRequest,new Consumer(response=>{
            const responseHead=JSON.parse(response)
            //此时接收到的是响应开始，而此时响应体正在下载，是初始化HTTPIncomingMessage的好时机
            //此处resolve来通知插件服务器响应已经发来
            //在构造incomingmessage的时候，由于body的等待是和incomingmessage绑定的
            //此处创建的promise的resolve意味着body下载完毕
            //所以把这个resolve暂存，并在body下载完毕的回调中调用
            resolve(new HTTPIncomingMessage(
                responseHead,
                new Promise(resolve=>onBodyDownloaded=resolve)
            ));
        }),new Consumer(body=>{
            //第二个回调就是请求体下载完成时触发
            //这个时候需要通知客户端响应体已下载完毕
            onBodyDownloaded(body);
        })));
    }
    /**
     * 发送一个简单的http请求  
     * 不能发送https请求，https请求请使用HTTPSRequest  
     * nodejs在实际工作中会分块下载http响应结果，但是为了和java那边兼容，fmp只能一次性接收所有数据
     * @param hostname 服务器主机名（IP地址或域名）
     * @param onSuccess 请求成功时的回调
     * @param path 请求的http的路径
     * @param port http服务的端口，不填默认80，对于默认端口在443的https协议有另一个类
     * @param otherHTTPOptions 传递给nodejs的其他http参数，默认传入{}
     * @param onError 请求失败时的回调
     */
    static sendSimpleGET(hostname:string,onSuccess:(data:string)=>void,path:string="",port:number=80,otherHTTPOptions:any={},onError?:(error:Error)=>void){

        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.GET,
            path
        })
        // req.on("error",(e)=>{
        //     if(onError==undefined){
        //         FMPLogger.error("http请求"+req.URL+"出错，原因：\n"+e)
        //         return
        //     }
        //     onError(e);
        // })
        req.send().then(result=>result.getBody().then(value=>onSuccess(value)))
        
    }
    static sendJSONSimplePOST(hostname:string,data:string,onSuccess:(data:string)=>void,path:string="",port:number=80,otherHTTPOptions:any={},onError?:(error:Error)=>void){
        //FMPLogger.info("调用sendJSONSimplePOST")
        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.POST,
            path,
            headers:{
                'Content-Length': getByteLength(data),
                'Content-Type':"application/json"
            }
        });
        //FMPLogger.info("下面写入请求体")
        //写入要发送的数据
        req.write(data)
        // req.on("error",(e)=>{
        //     if(onError==undefined){
        //         FMPLogger.error("http请求"+req.URL+"出错，原因：\n"+e)
        //         return
        //     }
        //     onError(e);
        // })
        //FMPLogger.info(getByteLength(data))
        //FMPLogger.info("下一步发送POST。")
        setTimeout(()=>req.send().then(result=>{
            //FMPLogger.info("响应已收到。")
            result.getBody().then(value=>{
                //FMPLogger.info("响应体已下载完毕")
                onSuccess(value)
            })
        }),10);
        
        
    }
}

export class HTTPIncomingMessage{
    private rawIncomingMessage:any
    private _body=""
    private downloadFinished:boolean
    private bodyResolve:((body:string)=>void)[]
    /**
     * 
     * @param rawIncomingMessage 原始传入消息对象，在grakkit这个应该是直接包含了方法和请求头等客户端在请求时就应该包含的信息
     * @param incomingData 消息上传完成时将这个promise resolve
     */
    constructor(rawIncomingMessage:any,incomingData:Promise<string>){
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
        //如果是客户端向服务端发送请求，则没有状态码
        return this.rawIncomingMessage.statusCode
    }
    get method(){
        //如果是服务端向客户端发送请求，则没有请求方法
        return this.rawIncomingMessage.method
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
function HTTPRespondToString(respond:HTTPRespond){
    //先把状态码转换成字符串
    const statusCodeStr=(()=>{
        switch(respond.statusCode){
            case 200:return "200 OK";
            default:throw new Error("状态码"+respond.statusCode+"目前无法被转换成响应头中的字符串。")
        }
    })()
    //转换响应头
    const headersStr=Object.keys(respond.head).map(key=>{
        return key+": "+respond.head[key]+(key==="Content-Type"?(";charset="+respond.charset):"");
    }).join("\n");
    return "HTTP/1.1 "+statusCodeStr+"\r\n"+headersStr+"\r\n\r\n"+respond.body;
        
//body接收完成之后，执行返回响应的方法
// "HTTP/1.1 200 OK\r\n" +
// "Content-Type: text/plain\r\n\r\n" +
// "Hello, Java native HTTP Server!";
}

export class HTTPServer{
    _port:number
    private started:boolean;
    private onRequest:(request:HTTPIncomingMessage)=>HTTPRespond|Promise<HTTPRespond>;
    private server:string
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>Promise<HTTPRespond>)
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>HTTPRespond)
    constructor(port:number,onRequest:(request:HTTPIncomingMessage)=>HTTPRespond|Promise<HTTPRespond>){
        this._port=port
        this.started=false
        this.onRequest=onRequest
        //helper那边也是创建完了不马上启动，所以这边也是直接在初始化的时候把helper那边初始化得了
        //由于满月平台目前还没有超时时间，将java那边的默认超时时间指定为15秒
        const timeout=15000;
        //这里故意初始化了一下，主要是方便后面更精确地定位错误
        let onBodyRecieved:(body:string | PromiseLike<string>)=>void = _body=>{throw new Error("onBodyRecieved未被初始化！")};
        // FMPLogger.info("下面将调用httpServerAPI_create")
        this.server=httpServerAPI_create.invoke(httpServerAPI,new javaInt(this.port),new javaInt(timeout));
        //如果这里使用异步函数传入Consumer，它可能不会被调用
        // FMPLogger.info("下面将调用httpServerAPI_setOnRequest")
        httpServerAPI_setOnRequest.invoke(httpServerAPI,this.server,new Consumer(headersInput=>{
            // FMPLogger.info("现在已收到请求，接下来执行this.onRequest");
            //现在要想办法能hook进helper那边，但是又要把onRequest里面的那个incomingmessage的body分开
            //先把headers和uuid拆出来
            //这个uuid就是这次请求的uuid
            const {uuid,headers,method,url,httpVersion}=JSON.parse(headersInput);
            //传入的数据中已经有我们想要的所有信息
            //误区：客户端在向服务器发送数据时，那个非常重要的属性是请求方法，**而不是状态码**
            //这个request出来的时候就已经有headers了
            //构造一个promise，然后在接收到body的时候调用它的resolve
            //这里的uuid目前还不知道哪里能用上
            //然后这个onRequest还会有一个promise，需要等待resolve了之后让http服务器执行响应
            (async ()=>{
                // FMPLogger.info("自执行异步函数已执行");
                const respond=await this.onRequest(new HTTPIncomingMessage({headers,method,url,httpVersion},new Promise<string>(resolve=>onBodyRecieved=resolve)));
                //所以我在这里把它改成异步，让他至少要等待这个onRequest完成
                //respond被疏通了之后就可以执行resolveResponse了
                //这个body是完全原生的，需要自己把那个httprespond解析成原生的数据然后传入
                httpServerAPI_resolveResponse.invoke(httpServerAPI,this.server,uuid,HTTPRespondToString(respond));
            })()
        }));
        //刚刚设置了onRequest应该什么时候触发，现在要确定onClientUploaded什么时候触发
        httpServerAPI_setOnClientUploaded.invoke(httpServerAPI,this.server,new Consumer(bodyInput=>{
            //这个地方无论如何都会被调用，因为helper那边写的逻辑是把整个执行这个回调的点放在了所有接收body逻辑的外面
            const {uuid,body}=JSON.parse(bodyInput);
            //现在body已经获取到，可以把上面body要用的那个promise给resolve了
            onBodyRecieved(body);
        }));
        // FMPLogger.info("现在正在测试马上启动")
        // httpServerAPI_start.invoke(httpServerAPI,this.server);
    }
    get port(){
        return this._port;
    }
    set port(port:number){
        if(this.started)throw new Error("HTTP server has already been launched, port is locked and cannot be changed. To change port, disconnect all clients and stop the server first. ");
        this._port=port;
    }
    async start(){
        httpServerAPI_start.invoke(httpServerAPI,this.server);
        //FMPLogger.info("服务器已启动。端口"+this.port);
        this.started=true;
    }
    async stop(){
        // FMPLogger.info("服务器将关闭，端口："+this.port)
        if(this.server===undefined){
            return;
        }
        httpServerAPI_stop.invoke(httpServerAPI,this.server);
        this.started=false;
    }
}