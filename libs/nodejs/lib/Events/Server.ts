import {startCommandReactor } from "../Game/Command"

export let tickSimulator=(event:FMPTickEvent)=>{

}
//将其导出来让DisableEvent停止它
export let tickSimulatorLoop:NodeJS.Timeout|undefined

export class FMPTickEvent{
    constructor(){

    }
    static on(callback:(event:FMPTickEvent)=>boolean|void){
        //只要代码中监听了TickEvent就开始tick的循环
        tickSimulatorLoop?1:tickSimulatorLoop=setInterval(()=>{
            tickSimulator(new FMPTickEvent())
        },50)
        //开启循环后还要开启commandReactor来提供关闭tick循环的stop命令
        startCommandReactor()
        tickSimulator=callback
    }
}