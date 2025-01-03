import { FMPCommand } from "../Game/Command";
export let ScriptDone=():boolean|void=>{}
export let pluginInited=false;
export const earlyRegisteredCommands:FMPCommand[]=[]
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        mc.listen("onServerStarted",()=>{
            pluginInited=true;
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