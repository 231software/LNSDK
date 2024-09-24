import { FMPLogger } from "../Logger"
import { FMPCommand,CommandList,commandReactor, FMPCommandResult, FMPCommandParam, FMPCommandParamType, FMPCommandParamDataType } from "../Game/Command"
import { FMPInternalPermission } from "../Game/InternalPermission"
import { FMPPlayerJoinEvent, playerJoinEventHandler } from "./Player"
import { FMPGameMode, FMPPlayer } from "../Game/Player"
import { FMPLocation } from "../Game/Location"
import { FMPDefaultDimension, FMPDimension } from "../Game/Dimension"
export let ScriptDone=():boolean|void=>{}
export let status:boolean=false
export let player:FMPPlayer;
export class FMPInitEvent{
    constructor(){

    }
    static on(callback:(event:FMPInitEvent)=>boolean|void){
        ScriptDone=()=>{
            callback(new FMPInitEvent())
            FMPCommand.register(new PlayerCmd())
            FMPCommand.register(new SudoCmd())
            if(CommandList.size>0)commandReactor();
        }
    }
}
class PlayerCmd extends FMPCommand{
    constructor(){
        super("player","","",[
            //new FMPCommandParam(FMPCommandParamType.Mandatory,"switch",FMPCommandParamDataType.String)
        ],[[]],FMPInternalPermission.Any);
    }
    callback(result: FMPCommandResult): void {
        if(result.params.size==0){
            status=!status
            FMPLogger.info("玩家模拟模式已设置为"+(status?"开":"关"))
            
            if(status){
                player=new FMPPlayer("0000000000000000","demo",FMPLocation.new(0,0,0,new FMPDimension(FMPDefaultDimension.Overworld)),FMPGameMode.Survival)
                playerJoinEventHandler(new FMPPlayerJoinEvent(player))
            }
        }
    }
}
class SudoCmd extends FMPCommand{
    constructor(){
        super("sudo","","",[
            //new FMPCommandParam(FMPCommandParamType.Mandatory,"switch",FMPCommandParamDataType.String)
        ],[[]],FMPInternalPermission.Any);
    }
    callback(result: FMPCommandResult): void {
    }
}