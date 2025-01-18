export let tickSimulator=(event:FMPTickEvent)=>{

}
//将其导出来让DisableEvent停止它
export const tickSimulatorLoop=setInterval(()=>{
    tickSimulator(new FMPTickEvent())
},50)
export class FMPTickEvent{
    constructor(){

    }
    static on(callback:(event:FMPTickEvent)=>boolean|void){
        tickSimulator=callback
    }
}