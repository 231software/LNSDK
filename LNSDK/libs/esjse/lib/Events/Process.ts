import {INFO} from "../plugin_info.js"
import {Logger} from "../index.js"
import {commandList} from "../Game/Command.js"
let initCallback=(event:FMPInitEvent)=>{}
let disableCallback=(event:FMPDisableEvent)=>{}
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        initCallback=callback
    }
}
export class FMPDisableEvent{
    constructor(){

    }
    static on(callback:(event:FMPDisableEvent)=>boolean|void){
        disableCallback=callback
    }
}
function formatPluginName(name: string): string {
    // 正则匹配非法字符
    const illegalCharPattern = /[^a-zA-Z0-9_]/g;
    // 正则匹配合法字符
    const validCharPattern = /[a-zA-Z0-9_]/g;

    // 检测是否有非法字符
    const illegalChars = name.match(illegalCharPattern);
    const validChars = name.match(validCharPattern);

    if (illegalChars) {
        if (validChars) {
            // 去掉非法字符并记录错误日志
            name = name.replace(illegalCharPattern, "");
            Logger.error("EndStone JS_Engine插件名不允许出现除了小写英文字母、下划线、数字之外的字符，请检查您的插件名。您的插件名实际是：", name);
        } else {
            // 如果没有合法字符，则直接抛出错误
            throw new Error("EndStone JS_Engine插件名只允许出现小写英文字母、下划线和数字");
        }
    }

    // 将空格替换为下划线，但如果空格后面有大写字母，则不替换下划线，由后续逻辑处理
    name = name.replace(/ (\w)/g, (match, p1) => {
        return p1 === p1.toUpperCase() ? match : `_${p1}`;
    }).replace(/ /g, '_');

    // 转换大写字母并添加下划线
    name = name.replace(/([A-Z])/g, (match, p1, offset) => {
        return (offset > 0 && name[offset - 1] !== '_') ? `_${p1.toLowerCase()}` : p1.toLowerCase();
    });

    return name;
}
export let ScriptDone=():boolean|void=>{
    const permissions:any={}
    const commands:any={}
    for(let command of commandList){
        permissions[command[1].esCmdData.permissions]=command[1].esCmdPermission
        commands[command[0]]=command[1].esCmdData
    }
    console.log(commands)
    //插件的所有命令都必须在其主线程中注册，不得在任何事件监听中注册，至于其他有些要求在开服后才能注册命令的平台，fmp会保留命令的全部信息，等待对应监听器触发后再注册
    //esjse的所有加载、卸载、命令注册都统一在JSE.registerPlugin中执行，lnsdk的实现会收集脚本中出现的所有此类事件，并在脚本主线程执行完成时统一执行相应代码
    //无需担心插件在服务器正常运行时还在注册事件，截至目前满月平台已经规定了开关服事件必须在脚本主线程中注册，至于主线程，运行完之前服务器都会等待该线程，其他插件的加载都不会进行，核心也不会继续运行
    JSE.registerPlugin({
        name: formatPluginName(INFO.name),
        version: INFO.name?INFO.name:"1.0.0",
        load: Enums.PluginLoadOrder.PostWorld,
        permissions,
        commands,
        onLoad: () => {
            //满月平台不需要也暂不支持形如onLoad的事件
        },
        onEnable: () => {
            initCallback(new FMPInitEvent())
        },
        onDisable: () => {
            disableCallback(new FMPDisableEvent())
        },
        onCommand: (sender,command:Command,args:string[]) => {
            //根据被执行的命令从命令列表里寻找命令，然后执行其回调
            commandList.get(command.getName())?.callback(sender,args)
            return true;
        },
    });
}