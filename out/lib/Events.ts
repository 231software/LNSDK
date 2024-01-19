import { Platform, SupportedPlatforms } from "./Platform";
let ScriptDone = ():boolean|void=>{};
class InitEvent{
    constructor(){

    }
}
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
}
export {ScriptDone};