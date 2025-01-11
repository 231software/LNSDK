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
     * 判断当前玩家是否在线。  
     * 在很多插件加载器中，尝试对已下线的玩家读取属性或执行方法都会导致报错。在需要对一个长期保存的玩家进行操作时，建议在操作前检查其是否在线，并对其不在线的情况采取措施。  
     * @returns 玩家是否在线
     */
    isOnline():boolean{
        return true
    }
    isSimulated():boolean{
        return false
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
    runCmd(cmd:string){
        return false
    }
    /**
     * 调用加载器或插件内数据库通过玩家名查询其UUID
     * @param name 玩家游戏名
     * @returns 玩家UUID
     */
    static name2uuid(name:string):string|undefined{
        return undefined
    }
    /**
     * 调用加载器或插件内数据库通过玩家XUID查询其UUID
     * @param xuid 玩家XUID
     * @returns 玩家UUID
     */
    static xuid2uuid(xuid:string):string|undefined{
        return undefined
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家名
     * @param uuid 玩家UUID
     * @returns 玩家名
     */
    static uuid2name(uuid:string):string|undefined{
        return undefined
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家XUID
     * @param uuid 玩家UUID
     * @returns 玩家XUID
     */
    static uuid2xuid(uuid:string):string|undefined{
        return undefined
    }
    /**
     * 通过玩家对应的字段获取玩家
     * @param prividedID 玩家的游戏名/UUID/XUID
     * @returns 玩家在线时返回该玩家对象，不在线的返回undefined
     */
    static getOnlinePlayer(providedID:string):FMPPlayer|undefined{
        return undefined
    }
    /**
     * 获取服务器中所有在线玩家
     * @returns 所有玩家
     */
    static getAllOnline():FMPPlayer[]{
        return [new FMPPlayer("","",new FMPLocation(undefined,true),FMPGameMode.Survival)]
    }    
}