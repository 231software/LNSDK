import "./${CONF.src_dir}/${CONF.main}";export const LNCONF=JSON.parse("${JSON.stringify(CONF)}");
/*import {Platform, SupportedPlatforms} from "./lib/Platform";
import { LNLogger } from "./lib/LNSDKT"
import {InitEvent} from "./lib/Events/Process/Init";
import {Command, CommandResult} from "./lib/Game/Command";
class newcmd extends Command{
    constructor(){
        super("test")
    }
    callback(result:CommandResult) {
        LNLogger.info("abcdefg")
    }
}

InitEvent.on((e)=>{
    LNLogger.info(1,2,3,4,5,6)
    Command.register(new newcmd())
});*/