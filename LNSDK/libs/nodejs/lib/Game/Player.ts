import { FMPLogger } from "../Logger";
import { FMPEulerAngles, FMPLocation } from "./Location";
import {FMPInternalPermission} from "../Game/InternalPermission"
import {FMPItem} from "../Game/Item.js"

export enum FMPGameMode{
    Survival=0,
    Creative,
    Adventure,
    Spectator,
    Unknown
}
export class FMPPlayer{
    xuid:string;
    name:string;
    location:FMPLocation
    gameMode:FMPGameMode
    constructor(xuid:string,name:string,location:FMPLocation,gameMode:FMPGameMode){
        this.xuid=xuid;
        this.name=name;
        this.location=location;
        this.gameMode=gameMode
    }
    get uuid():string{
        return ""
    }
    /** 获取玩家在游戏世界中的朝向 */
    get direction():FMPEulerAngles{
        return FMPEulerAngles.new(0,0,0)
    }
    /**玩家对于游戏内置权限的权限等级 */
    get internalPermission():FMPInternalPermission{
        return FMPInternalPermission.Any;
    }
    /**
     * 给予玩家一个物品
     * @param item 要给予玩家的物品
     * @returns 是否成功给予玩家
     */
    giveItem(item:FMPItem):boolean{
        return false
    }
    /**
     * 在游戏内向玩家发送一条消息，没有任何前缀
     * @returns 是否发送成功
     */
    tell(message:string):boolean{
        FMPLogger.info("[FMP插件消息]"+message)
        return true;
    }
    teleport(location:FMPLocation,direction?:FMPEulerAngles):boolean{
        return false;
    }
    setGameMode(gameMode:FMPGameMode):boolean{
        return false;
    }
}