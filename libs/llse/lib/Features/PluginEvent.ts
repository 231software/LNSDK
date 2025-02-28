import {INFO} from "../plugin_info.js"
import {serverStarted} from "../Events/Process.js"
import { Logger } from "../index.js"
const selfPluginName=INFO.name
interface Listener{
    eventName:string,
    providerPluginName:string,
    registerPluginName:string,
    /**程序在在自己内部处理的时候都是用的rawCallback，只有插件源码传入或返回给插件源码时才生成事件对象 */
    rawCallback:(data:string)=>boolean|void
    priority:number
}
//内置事件库，其中存储着所有事件的处理器
//插件被重载时这个列表会被清空，导致所有插件监听器失效
const localEventHandlers=new Map<string,FMPPluginEventHandler>()
//以提供者名字和事件名连在一直作为索引
const localEventListeners=new Map<string,Listener>()
interface FMPPluginEventData{
    //这个map的值类型不可以是类的对象
    params:Map<string,any>
    eventName:string,
    providerPluginName:string
    //优先级和监听器插件名不用加，因为这两个监听器插件自己都知道
}
export class FMPPluginEvent{
    params:Map<string,any>
    eventName:string
    providerPluginName:string
    constructor(eventName:string,providerPluginName:string,params:Map<string,any>){
        this.eventName=eventName
        this.params=params
        this.providerPluginName=providerPluginName
    }
    static on(rawCallback:(data:string)=>boolean|void,eventName:string,providerPluginName:string,priority,triggeredByEventRegister)
    static on(callback:(event:FMPPluginEvent)=>boolean|void,eventName:string,providerPluginName:string,priority)
    static on(callback:((event:FMPPluginEvent)=>boolean|void)|((data:string)=>boolean|void),eventName:string,providerPluginName:string,priority = 0.5,triggeredByEventRegister=false){
        //虽然判断两种函数类型的方法极其复杂，但是调用两种重载的逻辑却很有规律
        //由插件源码调用时，传入的是包装好的回调函数
        //由自动重新注册调用时，传入的是原始回调函数
        //如果传入的参数是原始回调，那么会在triggeredByEventListener参数传入true
        //所以此处应有类型判断函数，条件是triggeredByEventListener
        function isRawCallback(callback:((event:FMPPluginEvent)=>boolean|void)|((data:string)=>boolean|void)):callback is (data:string)=>boolean|void{
            return triggeredByEventRegister
        }
        const rawCallback=isRawCallback(callback)?
            //因为传入的是原始回调，直接采用传入的callback
            callback
            //在包装好的回调外面加一层解析器作为供外部调用的原始回调
            :(data:string):boolean|void=>{
                Logger.debug("原始回调被调用")
                let dataobj:any
                Logger.debug("data"+JSON.stringify(data))
                try{
                    dataobj=JSON.parse(data)
                }
                catch(e){
                    dataobj=data
                }
                
                //这个函数是用于回调被触发的，需要把收到的字符串数据转换成实际的数据
                const {params,eventName,providerPluginName}=dataobj
                Logger.debug("数据解析完成")
                //将这个对象里面的params转换回map
                return callback(new FMPPluginEvent(eventName,providerPluginName,objToStrMap(params)))
            }
        localEventListeners.set(eventName+providerPluginName,{
            eventName,
            providerPluginName,
            rawCallback,
            priority,
            registerPluginName:selfPluginName
        })
        function canSafeImport(){
            //对方已被加载或主动触发事件注册事件可被视为对方已经可以接受监听器注册
            return ll.listPlugins().includes(providerPluginName)||triggeredByEventRegister
        }
        //插件间监听在llse没有开服后不可注册事件的说法
        //此处应该是插件被加载时执行的，如果此时前置插件还没有加载，那么此次就不加载了，等待对应插件事件注册后再加载
        if(!canSafeImport()){
            Logger.debug("对方还未注册事件，不注册监听器"+eventName)
            //目前llse上如果事件提供方没有被加载，那么自己不会被触发，更不会报错，而是会一直等待事件提供方注册这个事件
            return;
        }
        //插件自己导出的回调是把提供者名字和事件名连在一起的，为的是防止事件名重复
        const callbackName=providerPluginName+eventName
        //目前遇到的问题：由于事件注册是加载完此文件时触发的，但是那个时候插件又未完全加载
        //所以虽然提供方触发了自己注册事件的事件，但是自己处于未被加载的状态
        //然而事实上既然插件已经注册完了事件，那事件就随时可以被监听
        //所以说在因为插件注册事件而触发的注册监听是不应该考虑对方是否被加载的
        Logger.debug("此时提供方是否被加载："+ll.listPlugins().includes(providerPluginName))
        //到此处就是对应插件已经被加载的情况了，那么
        //首先将自己的回调函数导出
        regPluginFunc(callbackName,rawCallback) 
        if(!ll.hasExported(providerPluginName,"regEventListener"))throw new Error("没有在事件提供者"+providerPluginName+"上检测到任何LNSDK事件库系统！\nLNSDK开发者向您给出三个解决办法：\n1. 重载插件"+providerPluginName+"，您可以尝试执行 ll reload "+providerPluginName+"。如果该插件无法重载，您可以尝试重启服务器。\n2. 升级插件"+providerPluginName+"\n3. 检查您安装的"+providerPluginName+"是否是您想要的那款，也就是检查是否安装了一个与它名字相同的插件。")
        //然后通知事件提供者自己已经导出了回调函数，之后提供者便可以适时触发它
        try{
            Logger.debug("通知"+providerPluginName+"监听注册")
            getPluginFunc(providerPluginName,"regEventListener")(selfPluginName,eventName,priority);
        }
        catch(e){
            throw new Error("虽然已经确保事件提供者"+providerPluginName+"加载，但是仍然无法向其注册监听器！详细错误：\n"+e)
        }

        /*
        if(!serverStarted&&!){
            //logger.warn("监听器注册失败，被监听插件可能未加载完毕，服务器开启后将再次尝试注册")
            tryrereg.push({
                listenedPluginName:listenedPluginName,
                pluginName:pluginName,
                eventname:eventname,
                callback:callback
            })
            return;
        }
            */
    }
}

export class FMPPluginEventHandler{
    eventName:string
    //每个事件中存储着每个插件和其提交的回调
    //每个插件只能注册一个回调，重新注册事件将导致原监听器失效
    //此属性不在方法内部修改
    foreignListeners=new Map<string,Listener>()
    //属性是故意削的，防止从这里读取一些不该读取的东西
    foreignListenersPriorities:{
        registerPluginName:string,
        priority:number
    }[]=[]
    /**
     * @param eventName 事件名
     */
    constructor(eventName:string){
        this.eventName=eventName
        //先在内置事件库中加入自己
        //因为一个事件需要有其对应的监听器列表才能建立链接
        //由于重复的事件注册会导致事件注册事件被重新触发，所以不需要担心重复注册，因为重复注册后其他插件会自动重新注册一遍他们的监听器
        //if(localListeners.get(eventName)!=undefined)throw new Error("事件注册存在重复！每个事件仅允许注册一次。")
        Logger.debug("在本体事件处理器中添加")
        localEventHandlers.set(eventName,this)
        //触发当前事件的事件注册事件
        //由于这是面向对象的构造函数，所以无法被拦截
        for(let pluginName of ll.listPlugins()){
            //如果当前插件没有事件注册事件的回调，那么直接跳过
            if(!ll.hasExported(pluginName,"OtherLNSDKPluginRegisterEventCallback"))continue;
            try{
                getPluginFunc(pluginName,"OtherLNSDKPluginRegisterEventCallback")(selfPluginName,eventName)
            }
            catch(e){
                throw new Error("插件"+pluginName+"似乎支持LNSDK的事件库，但是却无法调用它的事件注册事件的回调！")
            }
        }
    }
    trigger(params:Map<string,any>){
        //开始执行监听
        let block=true;
        //用于检查是否有重复执行的监听器
        const triggeredListeners:string[]=[]
        //按优先级遍历自己的监听器库中的所有监听器，挨个触发
        //优先级系统：先把监听器库中所有监听器排序，然后再从1到0触发
        //优先级的排序是在监听器注册时进行排序的，而不是在触发时现排序
        if(Array.from(this.foreignListeners.values()).length!=this.foreignListenersPriorities.length)throw new Error("检测到监听器优先级索引数据异常，优先级数组与监听器索引不一致！")
        for(let foreignListenerPriority of this.foreignListenersPriorities){
            const foreignListener=this.foreignListeners.get(foreignListenerPriority.registerPluginName)
            if(foreignListener==undefined)throw new Error("触发事件"+this.eventName+"时，索引中已经指出了插件名为"+foreignListenerPriority+"注册了监听器，但在本地却找不到它的监听器！")
            if(triggeredListeners.includes(foreignListenerPriority.registerPluginName))throw new Error("插件可能在重复调用"+foreignListenerPriority.registerPluginName+"监听器！")
            Logger.debug("这个监听器的注册者："+foreignListener.registerPluginName)
            Logger.debug("hasexported "+ll.hasExported( foreignListener.registerPluginName , foreignListener.providerPluginName + foreignListener.eventName ).toString())
            //如果对方还没有导出这个函数，证明对方可能未加载，直接跳过
            if(!ll.hasExported( foreignListener.registerPluginName , foreignListener.providerPluginName + foreignListener.eventName ))continue;
            Logger.debug("eventName"+foreignListener.eventName)
            Logger.debug("provider"+foreignListener.providerPluginName)
            Logger.debug("listener"+foreignListener.registerPluginName)
            //将数据打包并解析为字符串用于传输
            //将params的map转换成字符串
            const paramsObj=strMapToObj(params)
            //打包
            const dataStr=JSON.stringify({
                params:paramsObj,
                eventName:this.eventName,
                providerPluginName:selfPluginName
            })
            Logger.debug("dataStr"+dataStr)
            if(foreignListener.rawCallback(dataStr)===false)block=false;
            triggeredListeners.push(foreignListenerPriority.registerPluginName)
        }
        return block;
    }
}

//导出在本插件注册监听器时所需的函数
//只有本文件加载完成后插件才可以开始注册事件，所以插件注册事件触发事件注册事件后其他插件闻讯赶来时，对应的接口已经准备好了
//外部用于注册本插件提供的事件的函数
regPluginFunc("regEventListener",foreignRegisterListener)


/**
 * 注册监听器函数
 * @param registerPluginName 要注册监听器的插件的插件名
 * @param eventName 导出的回调函数的名字
 */
function foreignRegisterListener(registerPluginName:string,eventName:string,priority:number){
    Logger.debug(registerPluginName+"注册了事件"+eventName)
    const callbackName=selfPluginName+eventName
    //获取当前事件的处理器，该列表中存储着所有插件对应的回调
    const eventHandler=localEventHandlers.get(eventName)
    if(eventHandler==undefined)throw new Error("事件"+eventName+"还未初始化！")
    //插件已经给出了它的插件名和事件名，那么根据这两个信息顺藤摸瓜地找到插件导出的回调
    //如果插件没有及时导出它的回调，llse就会报错
    let foreignListener:((...arg: any[]) => boolean|void)|undefined
    if(!ll.hasExported(registerPluginName,callbackName))throw new Error("调用注册监听器函数时相应回调函数还未导出，请先导出回调函数再调用注册监听器函数！")
    try{
        //插件自己导出的回调是把提供者名字和事件名连在一起的，为的是防止事件名重复
        foreignListener=getPluginFunc(registerPluginName,callbackName)
    }
    catch(e){
        throw new Error("插件"+registerPluginName+"向本插件注册监听器时，本插件无法获取它的回调函数！错误详情：\n"+e)
    }
    //if(foreignListener)throw new Error("插件"+registerPluginName+"向本插件注册监听器时，本插件获取到它的回调函数为空！")
    //修改之前先在原索引中找到对应监听器并删除
    //索引的大小只和监听本事件的插件数量有关，所以遍历不存在明显的性能问题
    removeByPredicateInPlace(eventHandler.foreignListenersPriorities,e=>{
        //由于每个eventHandler的监听器都一定是属于该事件和该插件的，所以只需要检测注册者名字即可
        return e.registerPluginName==registerPluginName
    })
    //将监听器加入监听器优先级索引
    eventHandler.foreignListenersPriorities.push({
        registerPluginName,
        priority
    })
    //按照priority进行排序
    //有没有必要用TwoWayMap？没必要，因为优先级是不会被修改的，而且可以直接从获取到的对象中检索到
    //每次对这个map进行set的时候都需要重新排序
    eventHandler.foreignListenersPriorities.sort((left,right)=>{
        //左参数大于右参数为从小到大（升序），左参数小于右参数为从大到小（降序）
        return right.priority-left.priority
    })
    //将监听器存入事件处理器，此处再强调一遍监听器库是以插件名为索引的
    eventHandler.foreignListeners.set(registerPluginName,{
        eventName,
        providerPluginName:selfPluginName,
        rawCallback:foreignListener,
        priority,
        registerPluginName
    })
    if(localEventHandlers.get(eventName)?.foreignListeners.get(registerPluginName)==undefined)throw new Error("监听器添加失败！")
    /*
    for(i in obj.listenerList){
        //这里判断的是如果那个监听器列表里面已经存在一个这种监听器，就把它去掉，实际上直接替换也行
        if(obj.listenerList[i].namespace==pluginName&&obj.listenerList[i].name==eventName){
            obj.listenerList.splice(i,1);break;
        }
    }//相同名称，导出函数相同
    obj.listenerList.push({
        callback:newListener,
        namespace:pluginName,
        name:eventName
    });
    eventCatalog[eventName]=obj;
    //需要测试
    */
}

let pluginRegisterEventEventCallback=(e:FMPPluginRegisterEventEvent):boolean|void=>{}

export class FMPPluginRegisterEventEvent{
    eventName:string
    providerName:string
    constructor(eventName:string,providerName:string){
        this.eventName=eventName
        this.providerName=providerName
    }
    static on(callback:(event:FMPPluginRegisterEventEvent)=>boolean|void){
        pluginRegisterEventEventCallback=callback
    }
}


//其他插件注册事件的回调，从外部调用时一定要ll.hasExported，因为还有很多不是LNSDK的插件没有这个事件回调
regPluginFunc("OtherLNSDKPluginRegisterEventCallback",onOtherLNSDKPluginRegisterEvent)
//这个事件只能拦截自己的回调，不能拦截对方的注册
function onOtherLNSDKPluginRegisterEvent(providerPluginName:string,eventName:string){
    //触发插件源码注册的事件回调
    if(pluginRegisterEventEventCallback(new FMPPluginRegisterEventEvent(eventName,providerPluginName))===false)return;
    Logger.debug(Array.from(localEventListeners.values()))
    //外部有插件的事件被重新注册时，将自己所有对应的监听器全部重新注册一遍
    for(let listener of localEventListeners.values()){
        const {
            rawCallback: callback,
            eventName,
            providerPluginName: currentProviderPluginName,
            priority
        }=listener
        if(currentProviderPluginName!=providerPluginName)continue;
        Logger.debug("重新注册了"+currentProviderPluginName+eventName+"事件")
        FMPPluginEvent.on(callback,eventName,currentProviderPluginName,priority,true)
    }
}

export function regPluginFunc(funcName:string,func:(...params:any[])=>any){
    Logger.debug("插件注册函数"+funcName)
    ll.exports(func,selfPluginName,funcName)
}

export function getPluginFunc(pluginName:string,funcName:string):(...params:any[])=>any{
    Logger.debug("插件导入函数"+funcName)
    return ll.imports(pluginName,funcName)
}

export class FMPPluginEventError extends Error{
    code:string
    name="PluginEventError"
    constructor(msg:string,code:string){
        super(msg)
        this.code=code
    }
}

function strMapToObj(strMap:Map<any,any>) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
}
/**
*map转换为json
*/
function mapToJson(map:Map<any,any>) {
    return JSON.stringify(strMapToObj(map));
}

function objToStrMap(obj:any) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
/**
 *json转换为map
 */
function jsonToMap(jsonStr:string) {
    return objToStrMap(JSON.parse(jsonStr));
}

/**
 * 根据给定的谓词函数原地删除数组中的元素。
 * @param arr 要处理的数组。
 * @param predicate 谓词函数，用于判断元素是否应被删除。
 */
function removeByPredicateInPlace<T>(arr:T[], predicate:(element:T)=>boolean) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) {
            arr.splice(i, 1);
        }
    }
}

/**
 * 根据给定的谓词函数删除数组中的元素。
 * @param arr 要处理的数组。
 * @param predicate 谓词函数，用于判断元素是否应被删除。
 * @return 处理后的新数组。
 */
function removeByPredicate<T>(arr:T[], predicate:(element:T)=>boolean):T[] {
    return arr.filter(item => !predicate(item));
}


//listenAPI - 小鼠同学版权所有 2023.4.7
//let eventCatalog={};
//是用来存储未开服时注册失败，准备在开服时重新注册的事件的
let tryrereg=[]
/*
mc.listen("onServerStarted",()=>{
    tryrereg.forEach((currentValue)=>{
        if(ll.listPlugins().includes(currentValue.listenedPluginName)){
            Listener.on(currentValue.listenedPluginName,currentValue.pluginName,currentValue.eventname,currentValue.callback)            
        }
        else{
            logger.error("监听器注册失败，被监听插件未加载")
        }         
    }) 
})
    */