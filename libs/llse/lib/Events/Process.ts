import { FMPCommand } from "../Game/Command";
import { FMPScoreboard } from "../Game/Scoreboard";
export let ScriptDone=():boolean|void=>{}
export let serverStarted=false;
export const earlyRegisteredCommands:FMPCommand[]=[]
export const earlyInitedScoreboards:FMPScoreboard[]=[]
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        //初始化所有计分板
        for(let objective of earlyInitedScoreboards)objective.init()
        mc.listen("onServerStarted",()=>{
            serverStarted=true;
            //注册那些先注册的命令
            for(let command of earlyRegisteredCommands){
                FMPCommand.register(command);
            }
            callback(new FMPInitEvent());
        });
    }
}
export class FMPDisableEvent{
    constructor(){

    }
    static on(callback:(event:FMPDisableEvent)=>boolean|void){
    }
}