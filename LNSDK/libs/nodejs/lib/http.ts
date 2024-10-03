import * as http from "http"
import { RequestOptions } from "https"

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

export class HTTPRequest{
    rawRequest:http.ClientRequest
    constructor(options:{
        hostname:string,
        port?:number,
        path?:string,
        method?:HTTPMethod,
        headers?:string,
        agent?:string,
        timeout?:number
    },callback:(result:HTTPIncomingMessage)=>void){
        const NodeJSHTTPOptions:RequestOptions={
            hostname:options.hostname,
            port:options.port,
            path:options.path,
            //headers:options.headers,
            //agent:options.agent,
            timeout:options.timeout
        }
        NodeJSHTTPOptions.method=HTTPMethodTostring(options.method!=undefined?options.method:HTTPMethod.GET)
        this.rawRequest=http.request(NodeJSHTTPOptions,(result)=>{
            callback(new HTTPIncomingMessage(result))
        })
    }
    on(event:"error"|"abort",callback:(e:any)=>void){
        this.rawRequest.on(event,callback)
    }
    end(){
        this.rawRequest.end()
    }
}

export class HTTPIncomingMessage{
    rawIncomingMessage:http.IncomingMessage
    constructor(rawIncomingMessage:http.IncomingMessage){
        this.rawIncomingMessage=rawIncomingMessage
    }
    on(event:"data"|"end",callback:(chunk?:any)=>void){
        this.on(event,callback)
    }
}