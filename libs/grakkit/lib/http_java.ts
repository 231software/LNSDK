import { hjnhHttpClient, hjnhHttpRequest,
    csnhHttpServer,
    csnhHttpHandler,
    csnhHttpExchange
} from "@grakkit/types-paper"


const URI=core.type("java.net.URI")
const HttpClient=core.type("http.java.net.http.HttpClient")
const HttpRequest=core.type("http.java.net.http.HttpRequest")
const HttpResponse=core.type("http.java.net.http.HttpResponse")
const BodyHandlers=core.type("http.java.net.http.HttpResponse.BodyHandlers")
const Duration=core.type("java.time.Duration")
const javaHTTPServer=core.type("com.sun.net.httpserver.HttpServer")
const HTTPHandler=core.type("com.sun.net.httpserver.HttpHandler");
const HTTPExchange=core.type("com.sun.net.httpserver.HttpExchange");
const IOException=core.type("java.io.IOException");
const OutputStream=core.type("java.io.OutputStream");
const InetSocketAddress=core.type("java.net.InetSocketAddress");

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
    timeout?:number
}
export class HTTPRequest{
    rawClient:any//type
    rawRequest:any//type
    options:HTTPOptions
    //目前暂时只支持字符串
    constructor(options:HTTPOptions,callback:(result:string)=>void){
        //新建临时客户端
        this.rawClient=options.timeout?
            HttpClient.newBuilder().connectionTimeout(Duration.ofSeconds(options.timeout)).build()
            :HttpClient.newHttpClient()
        //构建这个请求
        const httpRequestBuilder1=HttpRequest.newBuilder().uri(
            //未传入端口时则不加端口号，让graalvm决定端口
            URI.create(options.hostname+(options.port!==undefined?":"+options.port:"")+"/"+options.path)
        )
        const httpRequestBuilder2=(()=>{
            switch(options.method){
                case HTTPMethod.GET:return httpRequestBuilder1.GET()
                case HTTPMethod.POST:return httpRequestBuilder1.POST()
                default:throw new Error("不支持的http请求方法"+options.method)
            }
        })()
        //构建header和agent
        const httpRequestBuilder3=typeof options.headers!=="undefined"?
            (()=>{
                for(const headerKey of Object.keys(options.headers)){
                    httpRequestBuilder2.header(headerKey,options.headers[headerKey])
                }
            })()
            :httpRequestBuilder2
        this.rawRequest=httpRequestBuilder3.build()
        (async ()=>{
            const rawResponse=this.rawClient.send(this.rawRequest,BodyHandlers.ofString());
            callback(rawResponse.body().toString())
        })()

        this.options=options
    }
    // on(event:"error"|"abort",callback:(e:any)=>void){
    //     this.rawRequest.on(event,callback)
    // }
    // write(data:string){
    //     this.rawRequest.write(data)
    // }
    // end(){
    //     this.rawRequest.end()
    // }
    get URL():string{
        return `http://${this.options.hostname}:${this.options.port}${this.options.path}`;
    }
    static sendSimpleGET(hostname:string,onSuccess:(data:string)=>void,path:string="",port:number=80,otherHTTPOptions:any={},onError?:(error:Error)=>void){

        new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.GET,
            path
        },result=>{
            //需要通过http状态码判断是否成功
            onSuccess(result)
            console.warn("目前尚未实现http状态码判断是否成功！")
        })
        
        // req.on("error",(e)=>{
        //     if(onError==undefined){
        //         FMPLogger.error("http请求"+req.URL+"出错，原因：\n"+e)
        //         return
        //     }
        //     onError(e);
        // })
        
        // req.end();
    }
    static sendJSONSimplePOST(hostname:string,data:string,onSuccess:(data:string)=>void,path:string="",port:number=80,otherHTTPOptions:any={},onError?:(error:Error)=>void){

        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.POST,
            path,
            headers:{
                'Content-Length': Buffer.byteLength(data),
                'Content-Type':"application/json"
            }
        },(result)=>{
            onSuccess(result)
            console.warn("目前尚未实现http状态码判断是否成功！")
        })
    }
}


export class HTTPIncomingMessage{
    private rawIncomingMessage:csnhHttpExchange
    private _body=""
    private downloadFinished:boolean
    private bodyResolve:((body:string)=>void)[]
    constructor(rawIncomingMessage:csnhHttpExchange,incomingData:Promise<string>){
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
        throw new Error("此时不应该读取状态码。")
    }
    get method(){
        return stringToHTTPMethod(this.rawIncomingMessage.getRequestMethod())
    }
    get url(){
        return this.rawIncomingMessage.getRequestURI().getPath(); 
    }
    get headers(){
        return this.rawIncomingMessage.getRequestHeaders();
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
        const fmpServer=this
        const server=javaHTTPServer.create(new InetSocketAddress(fmpServer._port),0)
        server.createContext("/",{handle(exchange){
            let uploadFinishedResolve:(result:string)=>void
            const path=exchange.getRequestURI().getPath()
            console.log("收到请求"+path)
            //解析好之后，执行真正的回调onRequest
            //exchange由于类型检查时无限递归，此处强制声明为any，反正我知道就行
            const response=fmpServer.onRequest(new HTTPIncomingMessage(exchange as any,new Promise<string>(resolve=>uploadFinishedResolve=resolve)))
            let data=''
            const os=exchange.getResponseBody()
            os.write([])
        }})
        server.setExecutor(null)
        server.start()
        console.log("http服务器启动")
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