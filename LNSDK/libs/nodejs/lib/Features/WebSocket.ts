//import WebSocket, { WebSocketServer } from 'ws';
const WebSocket=require("ws")
const WebSocketServer=WebSocket.Server
import {FMPLogger} from "../Logger"
import * as net from "net"

interface FMPWSOptions{
    reconnect?:boolean
    enableMessageQueue?:boolean
    path?:string,
    params?:Map<string,any>
}

export class FMPWS{
    connection:any
    host:string
    port:number
    heartbeat:any
    sendQueue:string[]=[]
    options:FMPWSOptions
    onMessageCallback:(data:Buffer)=>void|undefined
    onOpenCallback:()=>void|undefined
    onCloseCallback:()=>void|undefined
    onErrorCallback:(error)=>(boolean|void)
    constructor(host:string,port:number,options:FMPWSOptions={}){
        // 使用 Object.assign 为 options 设置默认值
        const defaultOptions = {
            reconnect: true,
            enableMessageQueue: true,
            path:"",
            params:new Map<string,any>()
        };
        this.options = Object.assign({}, defaultOptions, options);
        this.host=host
        this.port=port
        //首次连接
        this.refreshConnection()
        this.heartbeat=this.startHeartbeat()
    }
    set onMessage(callback:(stream:Buffer)=>void){
        this.onMessageCallback=callback
        this.connection.on('message', this.onMessageCallback);  
    }
    set onOpen(callback:()=>void){
        this.onOpenCallback=callback
        this.connection.on('open', this.onOpenCallback); 
    }
    set onClose(callback:()=>void){
        this.onCloseCallback=callback
        this.connection.on('close', this.onCloseCallback); 
    }
    set onError(callback:(error)=>(boolean|void)){
        this.onErrorCallback=callback
        this.connection.on('error', this.onErrorCallback); 
    }
    send(data:string){
        if(this.options.enableMessageQueue==false){
            //如果消息队列功能被手动关闭，则直接发送消息，不对消息队列进行任何操作
            //这种情况下，符合发送消息条件时再发送消息，不符合条件则直接丢弃
            if(this.connection?.readyState==1)this.connection.send(data)
            return
        }
        //需要发送的消息进入一个队列，如果ws不满足发送条件这个队列要做到被阻塞
        //将新需要发送的消息添加到队列尾部
        this.sendQueue.push(data)
        //满足发送消息条件时，将队列中积压的所有消息全部发送
        if(this.connection?.readyState==1){
            this.sendAllMessageFromQueue()
        }
    }
    sendAllMessageFromQueue(){
        //队列长度为0时所有消息都发送完毕，直接结束
        if(this.sendQueue.length==0)return;
        //在回调中发送下一条消息，一条一条发
        this.connection.send(this.sendQueue[0],()=>{
            this.sendQueue.shift()
            this.sendAllMessageFromQueue()
        })
    }
    refreshConnection(){
        //如果以前有一个连接，刷新时需要将其关闭
        this.connection?.close()
        this.connection=undefined
        //新建连接
        this.connection=new WebSocket(this.generateURL())
        //刷新好连接后，需要重新监听各种事件
        if(this.onMessageCallback!=undefined)this.connection.on('message', this.onMessageCallback);  
        if(this.onOpenCallback!=undefined)this.connection.on('open',this.onOpenCallback)
        if(this.onCloseCallback!=undefined)this.connection.on('close',this.onCloseCallback)
        this.connection.on('error',(e)=>{
            if(this.onErrorCallback?.call(this,e)===false){
                FMPLogger.info("拦截了连接出错时的处理逻辑")
                return;
            }
            //出错了，开启重连
            /*setTimeout(()=>{
                FMPLogger.info("重连")
                this.refreshConnection()
            },1000)*/
            
        })   
    }
    generateURL(){
        //判断host是否为IPv6地址，如果是就需要套上方括号
        const address=(net.isIPv6(this.host))?"["+this.host+"]":this.host

        const path=(()=>{
            if(this.options?.path?.length!=0&&this.options?.path?.startsWith("/")){
                return "/"+this.options.path
            }
            return this.options.path
        })()

        const params=(()=>{
            if(this.options.params==undefined)return ""
            let paramsString="?"
            for(let paramKV of this.options.params){
                paramsString=paramsString+paramKV[0]+"="+paramKV[1]+"&"
            }
            //去掉最后一个&，如果没有参数，则会恰好去掉问号
            paramsString=paramsString.slice(0,-1)
            return paramsString
        })()

        return `ws://${address}:${this.port}${path}${params}`
    }
    /**
    * 来自WS协调服务端
    */
    startHeartbeat(){
        //创建心跳包循环发送定时器
        return setInterval(() => {
            //let wsconnected:WebSocket|undefined = ws;
            //发现断开后开始重连
            /*
            if (wsconnected == undefined){
                reconnect(wsconnected);
                return;
            }*/
            //发现websocket连接异常符合重连触发条件后开始重连
            //ws自己发现断开了连接
            if(this.connection.readyState == 3){
                //重建新连接
                this.refreshConnection();
            }
            
            //可以检测网线是否插好，但是不需要
            //可以检测服务器是否能ping通，但是不需要
            //创建tcp连接检测服务端是否正常
            /*
            const net = require('net');

            // 远程服务器的 IP 和端口
            const host = 'example.com';  // 可以换成目标服务器的IP或域名
            const port = 80;             // 目标端口号

            const client = net.createConnection({ host, port }, () => {
            console.log(`端口 ${port} 在 ${host} 上是开启的`);
            client.end(); // 连接成功后立即结束
            });

            client.on('error', () => {
            console.log(`端口 ${port} 在 ${host} 上是关闭的`);
            });
            */

            
        },1500);
    }
}

export enum OneBotConnectionMode{
    WS,
    WSR,
    HTTP
}

export enum OneBotMessageOriginType{
    GROUP,
    PRIVATE
}

export function toOneBotMessageOriginType(type:string):OneBotMessageOriginType{
    switch(type){
        case "group":return OneBotMessageOriginType.GROUP
        case "private":return OneBotMessageOriginType.PRIVATE
        default:throw new Error(type+"无法被转换为onebot消息来源类型")
    }
}

export enum OneBotGroupRole{
    ADMIN,
    MEMBER
}

export enum OneBotMessageType{
    TEXT,
    IMAGE,
    REPLY,
    RECORD,
    AT,
    MARKDOWN,
    FILE,
    JSON,
    FACE,
    MFACE,
    VIDEO
}
export function toOneBotMessageType(type:string):OneBotMessageType{
    switch(type){
        case "text":return OneBotMessageType.TEXT
        case "image":return OneBotMessageType.IMAGE
        case "reply":return OneBotMessageType.REPLY
        case "record":return OneBotMessageType.RECORD
        case "at":return OneBotMessageType.AT
        case "markdown":return OneBotMessageType.MARKDOWN
        case "file":return OneBotMessageType.FILE
        case "json":return OneBotMessageType.JSON
        case "face":return OneBotMessageType.FACE
        case "mface":return OneBotMessageType.MFACE
        case "video":return OneBotMessageType.VIDEO
        default:throw new Error(type+"无法被转换为onebot消息类型")
    }
}

interface OneBotSender{
    user_id:number,
    /**用户的昵称。**不是用户的群昵称** */
    nickname:string,
    card:string,
    /**群成员权限，是普通成员、管理员还是群主，只有群里发消息时sender才会带role */
    role?:OneBotGroupRole
}

interface OneBotMessage{
    data:OneBotMessageTextContent
        |OneBotMessageReplyContent
        |OneBotMessageImageContent
        |OneBotMessageRecordContent
        |OneBotMessageAtContent
        |OneBotMessageMarkdownContent
        |OneBotMessageJSONContent
        |OneBotMessageFaceContent
        |OneBotMessageMFaceContent
        |OneBotMessageFileContent
        |OneBotMessageVideoContent,
    type:OneBotMessageType
}


interface OneBotHeartbeatData{
    self_id:number,
    time:Date,
    status:{
        online:boolean,
        good:boolean
    }
}

interface OneBotLifecycleData{
    time:Date,
    self_id:number
}

interface OneBotMessageData{
    self_id:number,
    time:Date,
    messagse_id:number,
    real_id:number,
    message_seq:number
    message_type:OneBotMessageOriginType,
    sender:OneBotSender,
    message:OneBotMessage[],
    raw_message:string,
    font:number,
    sub_type,//poke,normal,lift_ban
    group_id?:number
}

interface OneBotMessageTextContent{
    text:string
}
interface OneBotMessageReplyContent{
}
interface OneBotMessageImageContent{
    /**图片的文件名 */
    file:string,
    subType:number,
    /**图片在聊天软件图床中的下载链接 */
    url:string,
    file_size:string
}
interface OneBotMessageRecordContent{
}
interface OneBotMessageAtContent{
}
interface OneBotMessageMarkdownContent{
    /**该消息的markdown代码 */
    data:string
}
interface OneBotMessageJSONContent{
    /**该消息的json代码**解析好的**对象 */
    data:any
}
interface OneBotMessageFaceContent{
    /**大表情消息的表情id */
    id:string
}
interface OneBotMessageFileContent{
    file:string,
    path:string,
    file_id:string
    file_size:string
}
/**平台提供的表情包 */
interface OneBotMessageMFaceContent{
    /**表情的标题 */
    summary:string,
    /**表情的下载链接 */
    url:string,
    /**表情的id */
    emoji_id:string
    /**表情包的id */
    emoji_packageid:string,
    key:string
}
interface OneBotMessageVideoContent{
    file:string,
    /**文件在**OneBot所在服务器中**的文件目录 */
    path:string,
    file_id:string
    file_size:string,
    url:string

}

export class OneBot{
    host:string
    port:number
    access_token:string|undefined
    mode:OneBotConnectionMode
    connection:FMPWS
    onHeartbeatCallback=(data:OneBotHeartbeatData)=>{
        return true;
    }
    onOpenCallback=(data:OneBotLifecycleData)=>{
        return true;
    }
    onMessageCallback=(data:OneBotMessageData)=>{
        for(let message of data.message){
            if(message.type==OneBotMessageType.TEXT){
                const textmsg=message.data as OneBotMessageTextContent
                FMPLogger.info(textmsg.text)
            }
        }
        
        return true;
    }
    onNotifyCallback=(target_id:number,user_id:number,group_id?:number)=>{

    }
    onNotifiedCallback=(user_id:number,group_id?:number)=>{

    }
    constructor(host:string,port:number,mode:OneBotConnectionMode,access_token?:string,options?){
        this.host=host
        this.port=port
        this.access_token=access_token
        this.mode=mode
        this.connection=new FMPWS(host,port,{
            params:new Map<string,any>([
                ["access_token",access_token]
            ])
        })
        //接受消息部分对接ws的基础回调
        this.connection.onMessage=(data)=>{
            this.onRawMessageCallback(data)
        }
        //在还没有设置消息监听的时候，先设置那些最基础的监听
        this.connection.onMessage=(data)=>{
            this.check_access_token(JSON.parse(data.toString()))
        }
    }
    set onHeartbeat(callback:(data:OneBotHeartbeatData)=>boolean){
        this.onHeartbeatCallback=callback;
    }
    set onOpen(callback:(data:OneBotLifecycleData)=>boolean){
        this.onOpenCallback=callback
    }
    set onMessage(callback:(message:OneBotMessageData)=>boolean){
        this.onMessageCallback=callback
    }
    set onNotify(callback:(target_id:number,user_id:number,group_id?:number)=>boolean){
        this.onNotifyCallback=callback
    }
    set onNotified(callback:(user_id:number,group_id?:number)=>boolean){
        this.onNotifiedCallback=callback
    }
    
    set onRawMessage(callback:(data:Buffer)=>boolean){
        this.onRawMessageCallback=(data)=>{
            if(!callback(data))return
            this.trigger_message_callback(JSON.parse(data.toString()))
        }
        
    }
    onRawMessageCallback=(data:any)=>{
        this.check_access_token(JSON.parse(data.toString()))
    }
    set onRawOpen(callback:()=>void){
        this.connection.onOpen=()=>{
            callback()
        }
    }
    set onClose(callback:()=>void){
        this.connection.onClose=()=>{
            callback()
        }
    }
    set onError(callback:(error)=>(boolean|void)){
        this.connection.onError=(error)=>{
            callback(error)
        }
    }
    /**
     * 向群内发送消息
     * @param groupID 群号
     * @param message 消息内容
     */
    sendTextMessage2Group(groupID:number,message:string){
        this.act("send_group_msg",{
            group_id:groupID,
            message
        })
    }
    check_access_token(data:any){
        const parsedData=data
        //检测access token错误的情况，这里需要看一下onebot文档
        if(parsedData.retcode==1403){
            FMPLogger.error("access token错误")
            //如果access token错误，需要直接抛出错误让fmp项目自行捕获，否则会反复重连
            //这部分可能在异步里面，所以报错需要合到后面的onError监听里
        }
    }
    trigger_message_callback(dataObj:any){
        this.check_access_token(dataObj)
        switch(dataObj.post_type){
            case "meta_event":{
                switch(dataObj.meta_event_type){
                    case "heartbeat":{
                        this.onHeartbeatCallback({
                            time:new Date(dataObj.time),
                            self_id:dataObj.self_id,
                            status:dataObj.status
                        })}
                        break;
                    case "lifecycle":{
                        this.onOpenCallback({
                            time:new Date(dataObj.time),
                            self_id:dataObj.self_id
                        })
                        break;
                    }
                }
                break;
            }
            case "message":{
                this.onMessageCallback({
                    self_id: dataObj.self_id,
                    time: new Date(dataObj.time),
                    messagse_id: dataObj.message_id,
                    real_id: dataObj.real_id,
                    message_seq: dataObj.message_seq,
                    message_type: toOneBotMessageOriginType(dataObj.message_type),
                    sender: dataObj.sender,
                    message: (()=>{
                        //消息可能不是数组类型
                        const messageList:OneBotMessage[]=[]
                        for(let message of dataObj.message){
                            messageList.push({
                                data: message.data,
                                type: toOneBotMessageType(message.type)
                            })
                        }
                        
                        return messageList;
                    })(),
                    raw_message: dataObj.raw_message,
                    group_id:dataObj.group_id,
                    font: dataObj.font,
                    sub_type: dataObj.sub_type
                })
                break;
            }
            //戳一戳等
            case "notice":{
                switch(dataObj.notice_type){
                    //戳一戳
                    case "notify":{
                        //target_id,user_id,group_id
                        this.onNotifyCallback(dataObj.target_id,dataObj.user_id,dataObj.group_id)
                        //自己被戳
                        if(dataObj.target_id==dataObj.self_id)this.onNotifiedCallback(dataObj.user_id,dataObj.group_id)
                    }
                }
                break;
            }

        }
    }
    act(action:string,params:any,echo=""){
        this.connection.send(JSON.stringify({
            action,
            params,
            echo
        }));
    }
}

//connect()

//////////////////////网络部分，有空再研究/////////////////////
//此部分代码在chatwss网络控制部分基础上修改
let online_status=false;
/**当前正在进行的websocket连接 */
let ws:any;
let heartbeatInterval:NodeJS.Timeout|undefined
//setTimeout(wsctrl,3000);
//开启一次新的websocket连接
function connect(){
    ws=new WebSocket('ws://[::1]:6848');
    //log("连接中")
    ws.on("error",()=>{
        //log("无法连接")
    });//?
    ws.on('open', ()=>{
        online_status=true;
        FMPLogger.info("成功连接至OneBDS节点")
    });
    //连接成功后收到任何数据都会触发这个
    ws.on('message', (stream)=>{
        FMPLogger.info(stream.toString())
    });
    ws.on('close',()=>{
        FMPLogger.info("关闭")
    })
}


/**
 * 重连
 * @param wsc 
 */
function reconnect(){
    FMPLogger.info("正在重连")
    connect()
}

function closeConnection(){
    ws.close();
    clearInterval(heartbeatInterval)
}
