import { FMPCommandExecutor } from "./Command";
import { FMPInventory } from "./Container";
import { FMPEulerAngles, FMPLocation } from "./Location";

export class FMPActor extends FMPCommandExecutor{
    //uuid:string
    /**实体的uuid */
    //direction:FMPEulerAngles
    //location:FMPLocation
    //inAir:boolean
    /** 在游戏世界中传送实体到指定坐标 */
    teleport(location:FMPLocation,direction?:FMPEulerAngles):boolean{
        return false;
    }
    /**
     * 通过该实体执行一条命令
     * @param cmd 要执行的命令
     * @returns 是否执行成功
     */
    runCmd(cmd:string):boolean{
        return false
    }
}