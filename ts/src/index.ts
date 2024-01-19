import {Platform, SupportedPlatforms} from "./lib/Platform";
import { LNLogger } from "./lib/LNSDKT"
import {InitEvent} from "./lib/Events/Process/Init";
InitEvent.on((e)=>{
    LNLogger.info(1,2,3,4,5,6)
});