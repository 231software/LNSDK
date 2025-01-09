import { FMPCommand } from "../Game/Command";
export let ScriptDone=():boolean|void=>{}
export let serverStarted=false;
export const earlyRegisteredCommands:FMPCommand[]=[]
function processOnServerStart(){
    serverStarted=true;
    //注册那些先注册的命令
    for(let command of earlyRegisteredCommands){
        FMPCommand.register(command);
    }
}
let serverStartHandler=()=>{
    processOnServerStart()
}
//默认会先注册一个不会调用任何插件函数的监听，只会执行开服时必须执行的命令
mc.listen("onServerStarted",()=>{
    serverStartHandler()
})
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        //插件注册监听时，会注册另一个函数，既执行了插件监听，又执行了开服时必须执行的命令
        serverStartHandler=()=>{
            //插件拦截开服事件意味着拦截满月平台的开服事件，造成部分游戏机制未初始化的现象
            if(callback(new FMPInitEvent())===false)return;
            processOnServerStart()
        };
    }
}
export class FMPDisableEvent{
    constructor(){

    }
    static on(callback:(event:FMPDisableEvent)=>boolean|void){
    }
}