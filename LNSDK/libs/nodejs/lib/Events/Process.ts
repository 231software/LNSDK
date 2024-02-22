export let ScriptDone=():boolean|void=>{}
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        ScriptDone=()=>{
            callback(new FMPInitEvent())
        }
    }
}