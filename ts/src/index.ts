import {Platform, SupportedPlatforms} from "./lib/Platform";
import { LNLogger } from "./lib/LNSDKT"
import * as Event from "./lib/Events";
Event.onInit((e)=>{
    LNLogger.info(1,2,3,4,5,6)
});