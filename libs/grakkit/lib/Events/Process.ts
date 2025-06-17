import { FMPLogger } from "../Logger";
const Bukkit=core.type("org.bukkit.Bukkit")

export let ScriptDone=():boolean|void=>{}
export let serverStarted=false;
// export const earlyRegisteredCommands:FMPCommand[]=[]
// export const earlyInitedScoreboards:FMPScoreboard[]=[]
function processOnServerStart(){
    serverStarted=true;
    //初始化所有计分板
    // for(let objective of earlyInitedScoreboards)objective.init()
    // //注册那些先注册的命令
    // for(let command of earlyRegisteredCommands){
    //     //FMPCommand.register(command);
    // }
    FMPLogger.info("指令注册还没做完，到时候需要考虑是否需要延迟注册指令")
    FMPLogger.info("还需要检查是否要在开服的时候初始化所有计分板")
}
let serverStartHandler=()=>{
    processOnServerStart()
}
//默认会先注册一个不会调用任何插件函数的监听，只会执行开服时必须执行的命令
core.event('org.bukkit.event.server.ServerLoadEvent',event=>{
    serverStartHandler();
});
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        // FMPLogger.info("在线人数："+Bukkit.getOnlinePlayers().size())
        const defaultWorld=Bukkit.getWorlds().get(0);
        //如果服务器已经开启了那么就立即执行
        // if(defaultWorld.getChunkAt(defaultWorld.getSpawnLocation()).isLoaded()){
            
        // }
        //插件注册监听时，会注册另一个函数，既执行了插件监听，又执行了开服时必须执行的命令
        // else{
            serverStartHandler=()=>{
                //插件拦截开服事件意味着拦截满月平台的开服事件，造成部分游戏机制未初始化的现象
                if(callback(new FMPInitEvent())===false)return;
                processOnServerStart()
            };

        // }
    }
}
export class FMPDisableEvent{
    constructor(){

    }
    static on(callback:(event:FMPDisableEvent)=>boolean|void){
    }
}