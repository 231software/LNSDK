export let ScriptDone=():boolean|void=>{}
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        mc.listen("onServerStarted",()=>{
            callback(new FMPInitEvent());
        });
    }
}