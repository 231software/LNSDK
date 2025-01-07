/// <reference path="./lib/Types/src/index.d.ts"/>
export const LNCONF=JSON.parse("${JSON.stringify(CONF)}");
import "src/index.ts";
/*
import {Platform, SupportedPlatforms} from "./lib/Platform";
import { Logger } from "./lib/LNSDKT"
import {InitEvent} from "./lib/Events/Process";
import {Command, CommandResult} from "./lib/Game/Command";
import {Player} from "./lib/Game/Player"

class newcmd extends Command{
    constructor(){
        super("test")
    }
    callback(result:CommandResult) {
        Logger.info("abcdefg")
    }
}

InitEvent.on((e)=>{
    Logger.info(1,2,3,4,5,6)
    Command.register(new newcmd())
});
*/