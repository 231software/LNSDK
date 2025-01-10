import { FMPLogger } from "../Logger"
import { FMPCommand,CommandList,commandReactor, FMPCommandResult, FMPCommandParam, FMPCommandParamType, FMPCommandParamDataType } from "../Game/Command"
import { FMPInternalPermission } from "../Game/InternalPermission"
import { FMPPlayerJoinEvent, playerJoinEventHandler } from "./Player"
import { FMPGameMode, FMPPlayer } from "../Game/Player"
import { FMPLocation } from "../Game/Location"
import { FMPDefaultDimension, FMPDimension } from "../Game/Dimension"
import { onStopContainer } from "../Game/Command"
export let ScriptDone=():boolean|void=>{}
export let status:boolean=false
export let player:FMPPlayer;
let processOnStart=()=>{
    //FMPCommand.register(new PlayerCmd())
    //FMPCommand.register(new SudoCmd())
    if(CommandList.size>2)commandReactor();
}
ScriptDone=()=>{
    processOnStart()
}
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        ScriptDone=()=>{
            callback(new FMPInitEvent())
            processOnStart()
        }
    }
}


export class FMPDisableEvent{
    constructor(){

    }
    static on(callback:(event:FMPDisableEvent)=>boolean|void){
        onStopContainer.onStop=()=>{
            callback(new FMPDisableEvent())
        }
    }
}


const PlayerCmd = new FMPCommand("player",[
        //new FMPCommandParam(FMPCommandParamType.Mandatory,"switch",FMPCommandParamDataType.String)
    ],[[]],result=>{
        if(result.params.size==0){
            status=!status
            FMPLogger.info("玩家模拟模式已设置为"+(status?"开":"关"))
            
            if(status){
                player=new FMPPlayer("0000000000000000","demo",FMPLocation.new(0,0,0,new FMPDimension(FMPDefaultDimension.Overworld)),FMPGameMode.Survival)
                playerJoinEventHandler(new FMPPlayerJoinEvent(player))
            }
        }
    },FMPInternalPermission.Any
);
const SudoCmd = new FMPCommand("sudo",[
        //new FMPCommandParam(FMPCommandParamType.Mandatory,"switch",FMPCommandParamDataType.String)
    ],[[]],
    result=>{},
    FMPInternalPermission.Any
);
