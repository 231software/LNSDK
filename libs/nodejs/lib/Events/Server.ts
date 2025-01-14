export let tickSimulator=(event:FMPTickEvent)=>{

}
const tickSimulatorLoop=setInterval(()=>{
    tickSimulator(new FMPTickEvent())
},50)
export class FMPTickEvent{
    constructor(){

    }
    static on(callback:(event:FMPTickEvent)=>boolean|void){
        tickSimulator=callback
    }
}