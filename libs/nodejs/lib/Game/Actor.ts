import { FMPCommandExecutor } from "./Command";
import { FMPInventory } from "./Container";
import { FMPEulerAngles, FMPLocation } from "./Location";

export class FMPActor extends FMPCommandExecutor{
    //actor在llse中没有对应的类，所以所有被重写的类都被忽略
    //uuid:string
    //direction:FMPEulerAngles
    location:FMPLocation
    inAir:boolean
    /** 在游戏世界中传送实体到指定坐标 */
    teleport(location:FMPLocation,direction?:FMPEulerAngles):boolean{
        return false;
    }
    /**获取实体的物品栏 */
    getInventory():FMPInventory{
        return new FMPInventory()
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