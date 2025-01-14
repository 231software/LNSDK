export class FMPTickEvent{
    constructor(){

    }
    static on(callback:(event:FMPTickEvent)=>boolean|void){
        mc .listen("onTick",()=>{
            callback(new FMPTickEvent())
        })
    }
}