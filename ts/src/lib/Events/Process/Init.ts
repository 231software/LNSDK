import { LNPlatform, LNSupportedPlatforms } from "../../Platform";
let ScriptDone = ():boolean|void=>{};
export class LNInitEvent{
    constructor(){
    }
    static on(callback:(event:LNInitEvent)=>boolean|void){
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                mc.listen("onServerStarted",()=>{
                    callback(new LNInitEvent());
                });
                break;
            case LNSupportedPlatforms.NodeJS:
                ScriptDone=()=>{
                    callback(new LNInitEvent());
                }
                break;
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
export {ScriptDone};