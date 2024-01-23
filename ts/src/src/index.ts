import { LNLogger } from "../lib/LNSDKT.js";
import { LNInitEvent } from "../lib/Events/Process.js";
LNInitEvent.on((e)=>{
    LNLogger.info("My first LNSDK plugin successfully loaded.")
})
