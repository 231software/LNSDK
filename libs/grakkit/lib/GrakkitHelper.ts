import { FMPLogger } from "./Logger";
const Bukkit=core.type("org.bukkit.Bukkit")
const GrakkitPluginHelper=Bukkit.getPluginManager().getPlugin("GrakkitPluginHelper");
const javaInt=core.type("java.lang.Integer")
const javaString=core.type("java.lang.String")
const Runnable=core.type("java.lang.Runnable");
const Consumer=core.type("java.util.function.Consumer");
const javaClass=core.type("java.lang.Class");
let onHelperEnabled=()=>{};

let GrakkitPluginHelperClazz:any=undefined

//#region HTTPServerAPI
export let httpServerAPI:any=undefined
export let httpServerAPI_create:any=undefined;
export let httpServerAPI_start:any=undefined;
export let httpServerAPI_stop:any=undefined;
export let httpServerAPI_resolveResponse:any=undefined;
export let httpServerAPI_setOnRequest:any=undefined;
export let httpServerAPI_setOnClientUploaded:any=undefined;
//#endregion
//#region HTTPClientAPI
export let httpClientAPI:any=undefined
export let httpClientAPI_create:any=undefined;
export let httpClientAPI_uploadBody:any=undefined;
export let httpClientAPI_uploadBody_reload1:any=undefined;
export let httpClientAPI_send:any=undefined;
export let onEnableProxy:any;
//#endregion
export let global_getByteLength:any=undefined
//这个从grakkit导入的地方需要在服务器启动之后再导入


export function getByteLength(str:string):number{
    return global_getByteLength.invoke(GrakkitPluginHelper,str)
}

if (GrakkitPluginHelper !=null) {
    //这个是整个插件的类
    //这个类是从最开始就有的，所以可以放心加载
    GrakkitPluginHelperClazz = (GrakkitPluginHelper as any).getClass();
    if(GrakkitPluginHelperClazz===undefined)throw new Error("现在无法对GrakkitPluginHelper进行反射！")
    //试试调用一下test方法
    // const manager_test = GrakkitPluginHelperClazz.getDeclaredMethod("test");
    // manager_test.setAccessible(true);
    // manager_test.invoke(GrakkitPluginHelper);
    //注册GrakkitPluginHelper自己提供的监听器
    const managerRegOnEnableListener = GrakkitPluginHelperClazz.getDeclaredMethod("regOnEnableListener",(Runnable as any).class);
    managerRegOnEnableListener.setAccessible(true);
    managerRegOnEnableListener.invoke(GrakkitPluginHelper,new Runnable(importGrakkitHelperAPIs))
    //现在，先尝试获取onEnable方法
    // if(!onEnableProxy){
    //     onEnableProxy=javaProxy.newProxyInstance(
    //         (GrakkitPluginHelper as any).class.getClassLoader(),
    //         GrakkitPluginHelperClazz.getInterfaces(),
    //         ((proxy,method,args)=>{
    //             if(method.getName()==="onEnable"){
    //                 FMPLogger.warn("成功拦截到onEnable");
    //             }
    //             else{
    //                 FMPLogger.warn("拦截到了"+method.getName())
    //             }
    //             return method.invoke(GrakkitPluginHelper,args);
    //         }) as any
    //     );
    //     FMPLogger.info("onEnable拦截代码执行完毕。")
    // }
    importGrakkitHelperAPIs();  
}
else{
    //根本没有helper
    throw new Error("GrakkitPluginHelper未安装，本插件无法运行！");
    //helper未加载，等待200ms
    // setTimeout(()=>importGrakkitHelperAPIs(),200);
}   
function importGrakkitHelperAPIs(){
    if(GrakkitPluginHelperClazz===undefined)throw new Error("无法导入GrakkirHelperAPI，因为它在获取GrakkitPluginHelper主类前调用。");
    try {
        // const methodTest = GrakkitPluginHelperClazz.getDeclaredMethod("test");
        // methodTest.setAccessible(true)
        // methodTest.invoke(GrakkitPluginHelper)
        global_getByteLength=GrakkitPluginHelperClazz.getDeclaredMethod("getByteLength",(javaString as any).class);
        global_getByteLength.setAccessible(true);
        //#region HTTPServerAPI
        const getHTTPServerAPI = GrakkitPluginHelperClazz.getDeclaredMethod("getHTTPServerAPI");
        getHTTPServerAPI.setAccessible(true);
        // 获取 HTTPServerAPI 实例
        httpServerAPI = getHTTPServerAPI.invoke(GrakkitPluginHelper);
        const HTTPServerAPIStaticClazz = javaClass.forName("com.minimouse48.grakkitpluginhelper.HTTPServerAPI");
        const httpServerAPI_test = HTTPServerAPIStaticClazz.getDeclaredMethod("test",(Consumer as any).class); // 获取静态方法
        httpServerAPI_test.setAccessible(true);
        // Bukkit.getLogger().info("静态方法已成功获取！");
        // 调用静态方法时，使用 `null` 作为实例参数
        //Bukkit.getLogger().info((httpServerAPI_test as any).invoke(null, "回调被调用"));
        // (httpServerAPI_test as any).invoke(null, new Consumer((callback)=>Bukkit.getLogger().info("回调被调用")));
        //先导入所有方法
        httpServerAPI_create = HTTPServerAPIStaticClazz.getDeclaredMethod("create",(javaInt as any).class,(javaInt as any).class); // 获取静态方法
        httpServerAPI_create.setAccessible(true);
        httpServerAPI_start = HTTPServerAPIStaticClazz.getDeclaredMethod("start",(javaString as any).class); // 获取静态方法
        httpServerAPI_start.setAccessible(true);
        httpServerAPI_stop = HTTPServerAPIStaticClazz.getDeclaredMethod("stop",(javaString as any).class); // 获取静态方法
        httpServerAPI_stop.setAccessible(true);
        httpServerAPI_resolveResponse = HTTPServerAPIStaticClazz.getDeclaredMethod("resolveResponse",(javaString as any).class,(javaString as any).class,(javaString as any).class); 
        httpServerAPI_resolveResponse.setAccessible(true);
        httpServerAPI_setOnRequest = HTTPServerAPIStaticClazz.getDeclaredMethod("setOnRequest",(javaString as any).class,(Consumer as any).class); // 获取静态方法
        httpServerAPI_setOnRequest.setAccessible(true);
        httpServerAPI_setOnClientUploaded = HTTPServerAPIStaticClazz.getDeclaredMethod("setOnCilentUploaded",(javaString as any).class,(Consumer as any).class); // 获取静态方法
        httpServerAPI_setOnClientUploaded.setAccessible(true);
        //#endregion
        //#region HTTPClientAPI

        const getHTTPClientAPI = GrakkitPluginHelperClazz.getDeclaredMethod("getHTTPClientAPI");
        getHTTPClientAPI.setAccessible(true);
        // 获取 HTTPServerAPI 实例
        httpClientAPI = getHTTPClientAPI.invoke(GrakkitPluginHelper);
        const HTTPClientAPIStaticClazz = javaClass.forName("com.minimouse48.grakkitpluginhelper.HTTPClientAPI");
        //先导入所有方法
        httpClientAPI_create = HTTPClientAPIStaticClazz.getDeclaredMethod("create",(javaString as any).class,(javaString as any).class,(javaString as any).class,(javaInt as any).class); 
        httpClientAPI_create.setAccessible(true);
        httpClientAPI_uploadBody = HTTPClientAPIStaticClazz.getDeclaredMethod("uploadBody",(javaString as any).class,(javaString as any).class,(javaString as any).class); 
        httpClientAPI_uploadBody.setAccessible(true);
        httpClientAPI_uploadBody_reload1=HTTPClientAPIStaticClazz.getDeclaredMethod("uploadBody",(javaString as any).class,(javaString as any).class); 
        httpClientAPI_uploadBody_reload1.setAccessible(true);
        httpClientAPI_send=HTTPClientAPIStaticClazz.getDeclaredMethod("send",(javaString as any).class,(Consumer as any).class,(Consumer as any).class); 
        httpClientAPI_send.setAccessible(true);
        // FMPLogger.info("LNSDK反射方法获取完成")
        //#endregion
        //#region 测试部分
        // 以下就是纯测试部分了
        // const testHTTPServer:string=httpServerAPI_create.invoke(httpServerAPI,new javaInt(45291), new javaInt(5000));
        
        // FMPLogger.info("成功创建服务器实例")
        // httpServerAPI_setOnRequest.invoke(httpServerAPI,testHTTPServer,new Consumer(headers=>{
        //     Bukkit.getLogger().info("headers："+headers);
        // }));
        // httpServerAPI_setOnClientUploaded.invoke(httpServerAPI,testHTTPServer,new Consumer((body)=>{
        //     Bukkit.getLogger().info("外部成功接收到body："+body);
        //     //解析出请求uuid
        //     const bodyContent=JSON.parse(body);
        //     Bukkit.getLogger().info("请求的uuid："+bodyContent.uuid);
        //     httpServerAPI_resolveResponse.invoke(httpServerAPI,testHTTPServer,bodyContent.uuid,
        //     "HTTP/1.1 200 OK\r\n" +
        //             "Content-Type: text/plain; charset=utf-8\r\n\r\n" +
        //             "这些是测试js代码时api时发送的响应内容");
        // }));
        // FMPLogger.info("成功设置回调");
        // //服务器全部配置完毕后，启动服务器
        // httpServerAPI_start.invoke(httpServerAPI,testHTTPServer);
        // //10秒后关闭服务器
        // setTimeout(()=>{
        //         httpServerAPI_stop.invoke(httpServerAPI,testHTTPServer);
        // },10000);
        //#endregion
    } catch (e) {
        if(e.toString()==="java.lang.reflect.InvocationTargetException"){
            FMPLogger.info("立刻反射失败，现在插件将尝试监听GrakkitPlguinManager的onEnable方法")
            //将GrakkitPluginManager onEnable监听的回调中要执行的函数替换成这个函数的引用
            onHelperEnabled=importGrakkitHelperAPIs;
            // setTimeout(()=>importGrakkitHelperAPIs(),100);
        }
        else Bukkit.getLogger().warning("进行反射操作时发生错误："+e);
    }

        
        
}