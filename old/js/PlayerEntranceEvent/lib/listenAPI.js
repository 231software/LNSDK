//
/**  
 * 该注释来自文件listenAPI.js。如果您在其他文件中看到了此注释，证明该文件引用了listenAPI的内容。
 * @author Minimouse  
 * listenAPI - 小鼠同学(Minimouse)版权所有 2023.4.7  
 * 使用文件时，请遵守以下约定：  
 * 
 * >>将本文件包含于插件发行版中，或者作为附件等形式直接上传至发布页  
 * 禁止更改此文档注释的任何内容，或删除此文档注释。  
 * 这种情形下，您可以修改本文件中除上方规定的文档注释部分的内容。  
 * 如果您对于文件有附加说明，请在文件中其他地方另起注释，禁止编辑此注释。  
 * >>直接在其他文件中引用本文件中的内容
 * 您必须将此注释一同包含在引用中。
 * 引用时，禁止更改此文档注释的任何内容，或删除此文档注释。 
 * 这种情形下，您可以修改其他除上方规定的文档注释部分的内容。 
 * 如果您对于文件有附加说明，请在文件中其他地方另起注释，禁止编辑此注释。
 */

/**整个插件中的所有事件，事件名:事件实例 */
let eventCatalog={};
let serverStarted=false;
let tryrereg=[]
/**
 * LLSE插件间监听器类
 */
class Listener{
    /**
     * 
     * @param {string} name 事件名
     */
    constructor(name){
        this.listenerList=[];
        eventCatalog[name]=this;
        //ll.export(this.regListenTest,namespace,name)
    }
    /**
     * 初始化当前插件的所有监听器
     * @param {string} pluginname 本插件的插件名
     * @param {string} listenerGroup 监听器组（可选）（未使用）
     */
    static init(pluginname,listenerGroup="EventListener"){
        /*其实是导出了一个函数，这个函数是用来让其他插件的on静态方法调用来告诉被监听插件自己的回调函数，把那个插件的插件名和要监听的事件名传进来之后
        被监听的插件就会用ll获取插件名和事件名对应的那个函数，把它里面存储的那个事件实例存储的回调里面加上这个传进来的回调函数
        */
        //namespace是要监听的插件的插件名，name是事件名
        ll.export((namespace,name)=>{
            /**从eventCatalog中提取监听插件想要绑定上回调的那个事件实例 */
            let obj=eventCatalog[name]
            //获取回调
            let newlistener=ll.import(namespace,name)
            let i;//因为for i报错i is not defined
            //发现了相同名称的绑定好的回调，此时导出函数相同，证明这个插件已经注册过一次，那就需要把原来的回调删了，然后下面会把它再加上
            for(i in obj.listenerList){
                if(obj.listenerList[i].namespace==namespace&&obj.listenerList[i].name==name){
                    obj.listenerList.splice(i,1);break;
                }
            }
            //将回调、回调对应的插件名和事件名绑定并一同存储，作为一个插件注册的监听器
            obj.listenerList.push({
                callback:newlistener,
                namespace:namespace,
                name:name
            });
            //在全局存储的事件里面
            eventCatalog[name]=obj;
        },pluginname,listenerGroup)
        //因为之前在ll开发群里说了，ll的导出函数是不可以被覆盖的
        //突然发现这个init好像不用最后执行？当时因为什么这么规定的？
        //构造函数是把什么东西，对，事件实例插入了那个eventCatalog
        //试一下，因为eventCatalog只是导出了一个步骤，这个步骤只会在其他插件尝试注册的时候执行
        //我感觉，好像是只要保证插件注册监听器的时候那个事件已经被实例化了就行，不用管它是在初始化的前还是后
        //因为你看，它只是导出了一个函数，没有执行其他任何的操作
        //这个导出的函数也不会有导出的过程中执行，它只有被远程调用的时候才被执行
        //你看，这不就是，这个导出的函数已经在很久之后才执行了吗
        //测试完毕，事实证明init方法执行的地方和实例化事件没有关系，只要都是在其他插件注册监听器之间就可以
    }
    /**
     * 监听事件
     * @param {string} listenedPluginName 要监听的插件名
     * @param {string} pluginName 当前插件的插件名
     * @param {string} eventname 要监听的事件名
     * @param {function} callback 事件触发时执行的回调函数，返回一个布尔可作为判断是否要拦截事件
     * @param {string} listenerGroup 监听器组（可选）（未使用）
     */
    static on(listenedPluginName,pluginName,eventname,callback,listenerGroup="EventListener"){
        if(!serverStarted&&!ll.listPlugins().includes(listenedPluginName)){
            //logger.warn("监听器注册失败，被监听插件可能未加载完毕，服务器开启后将再次尝试注册")
            tryrereg.push({
                listenedPluginName:listenedPluginName,
                pluginName:pluginName,
                eventname:eventname,
                callback:callback
            })
            return;
        }
        ll.import(listenedPluginName,listenerGroup)(pluginName,eventname);
        ll.export(callback,pluginName,eventname) 
    }
    /**
     * 执行监听的插件的回调函数
     * @param {any} arg 回调函数传入的参数，因作者技术有限目前最多支持10个，后面所有变量均可作为可选，如有需要可修改源码此处参数
     * @returns {boolean} 监听此事件的插件是否要拦截此事件（至少一个插件返回了false）
     */
    exec(args,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10){
        //开始执行监听
        let returned=true;
        let i;
        for(i in this.listenerList){
            if(this.listenerList[i].callback!=undefined&&ll.hasExported(this.listenerList[i].namespace,this.listenerList[i].name)){
                if(this.listenerList[i].callback(args,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)==false){returned=false;}
            }        
        }
        return returned;
    }
}
mc.listen("onServerStarted",()=>{
    serverStarted=true;
    tryrereg.forEach((currentValue)=>{
        if(ll.listPlugins().includes(currentValue.listenedPluginName)){
            Listener.on(currentValue.listenedPluginName,currentValue.pluginName,currentValue.eventname,currentValue.callback)            
        }
        else{
            logger.error("监听器注册失败，被监听插件未加载")
        }         
    }) 
})
module.exports=Listener