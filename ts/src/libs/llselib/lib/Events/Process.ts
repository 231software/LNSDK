import {mc} from "../../../@LLSELib/index.js"
import { LNPlatform, LNSupportedPlatforms } from "../Platform.js";
//不要动这行import
//import { PowerNukkitX, EventPriority } from ":powernukkitx";
export let ScriptDone = ():boolean|void=>{};
export class LNInitEvent{
    constructor(){
    }
    static on(callback:(event:LNInitEvent)=>boolean|void){
                ScriptDone=()=>{
                    callback(new LNInitEvent());
                }
    }
}
/*
export function onInit(callback:(event:InitEvent)=>boolean|void){
    switch (Platform.getType()){
        case SupportedPlatforms.LiteLoaderBDS:
            mc.listen("onServerStarted",()=>{
                callback(new InitEvent());
            });
            break;
        case SupportedPlatforms.NodeJS:
            ScriptDone=()=>{
                callback(new InitEvent());
            }
            break;
    }
}*/