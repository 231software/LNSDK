import * as http from "http"
import { RequestOptions } from "https"
import { FMPLogger } from "./Logger"

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
    rawRequest:http.ClientRequest
    options:HTTPOptions
    constructor(options:HTTPOptions,callback:(result:HTTPIncomingMessage)=>void){
        const NodeJSHTTPOptions:RequestOptions={
            hostname:options.hostname,
            port:options.port,
            path:options.path,
            headers:options.headers,
            //agent:options.agent,
            timeout:options.timeout
        }
        NodeJSHTTPOptions.method=HTTPMethodTostring(options.method!=undefined?options.method:HTTPMethod.GET)
        this.rawRequest=http.request(NodeJSHTTPOptions,(result)=>{
            callback(new HTTPIncomingMessage(result))
        })

        this.options=options
    }
    on(event:"error"|"abort",callback:(e:any)=>void){
        this.rawRequest.on(event,callback)
    }
    write(data:string){
        this.rawRequest.write(data)
    }
    end(){
        this.rawRequest.end()
    }
    get URL():string{
        return `http://${this.options.hostname}:${this.options.port}${this.options.path}`;
    }
    static sendSimpleGET(hostname:string,onSuccess:(data:string)=>void,path:string="",port:number=80,otherHTTPOptions:any={},onError?:(error:Error)=>void){

        const req=new HTTPRequest({
            hostname,
            port,
            method:HTTPMethod.GET,
            path
        },(result)=>{
            let data=''
            result.on("data",(chunk)=>{
                data+=chunk
            })
            result.on("end",()=>{
                onSuccess(data)
            })
        })
        
        req.on("error",(e)=>{
            if(onError==undefined){
                FMPLogger.error("http请求"+req.URL+"出错，原因：\n"+e)
                return
            }
            onError(e);
        })
        
        req.end();
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
            let data=''
            result.on("data",(chunk)=>{
                data+=chunk
            })
            result.on("end",()=>{
                onSuccess(data)
            })
        })
        
        req.on("error",(e)=>{
            if(onError==undefined){
                FMPLogger.error("http请求"+req.URL+"出错，原因：\n"+e)
                return
            }
            onError(e);
        })
        
        req.write(data)
        req.end();
    }
}

export class HTTPIncomingMessage{
    rawIncomingMessage:http.IncomingMessage
    constructor(rawIncomingMessage:http.IncomingMessage){
        this.rawIncomingMessage=rawIncomingMessage
    }
    on(event:"data"|"end",callback:(chunk?:any)=>void){
        this.rawIncomingMessage.on(event,callback)
    }
}