import { FMPLogger } from "../Logger";
import { FMPInternalPermission } from "./InternalPermission";
import { FMPItem } from "./Item";
import { FMPEulerAngles, FMPLocation } from "./Location";
export enum FMPGameMode{
    Survival=0,
    Creative=1,
    Adventure=2,
    Spectator=3,
    Unknown
}
export function fromesGamemode(esGamemode:Enums.GameMode):FMPGameMode{
    switch(esGamemode){
        case Enums.GameMode.Survival:return FMPGameMode.Survival;
        case Enums.GameMode.Creative:return FMPGameMode.Creative;
        case Enums.GameMode.Adventure:return FMPGameMode.Adventure;
        case Enums.GameMode.Spectator:return FMPGameMode.Spectator;
        default:return FMPGameMode.Unknown;
    }
}
export function toesGamemode(gamemode:FMPGameMode):number{
    switch(gamemode){
        case FMPGameMode.Survival:return Enums.GameMode.Spectator;
        case FMPGameMode.Creative:return Enums.GameMode.Creative;
        case FMPGameMode.Adventure:return Enums.GameMode.Adventure;
        default:FMPLogger.warn("尝试向Endstone转换其不支持的游戏模式！已自动将玩家转换为观察者模式。");
        case FMPGameMode.Spectator:return Enums.GameMode.Spectator;
    }
}
export enum sendTextType{
    raw = 0,
    chat,
    popup,
    tip,
    json,
}
export class FMPPlayer{
    rawplayer:Player;
    /*
    name:string;
    xuid:string;
    uuid:string;
    gamemode:Gamemode;
    isSneaking:boolean;
    */
    
    constructor(rawplayer:Player){
        this.rawplayer=rawplayer;
    }
    get name():string{
        //判断平台并读取相应属性
        return this.rawplayer.getName();
    }
    get xuid():string{
        return this.rawplayer.getXuid();
    }    
    get uuid():string{
        return this.rawplayer.getUniqueId();
    }    
    get gameMode():FMPGameMode{
        return fromesGamemode(this.rawplayer.getGameMode());
    }
    //返回的是玩家脚部坐标！
    /*get location():FMPLocation{
        return new FMPLocation(this.rawplayer.feetPos,false);
    }*/
    /*get direction():FMPEulerAngles{
        return FMPEulerAngles.new(this.rawplayer.getRotation().x,this.rawplayer.getRotation().y,0);
    }*/
    /**玩家对于游戏内置权限的权限等级 */
    get internalPermission():FMPInternalPermission{
        return this.rawplayer.isOP()?FMPInternalPermission.GameMasters:FMPInternalPermission.Admin
    }
    /*
    get isSneaking():boolean{
        //return this.rawplayer.isSneaking;
    }*/
    /**
     * 给予玩家一个物品
     * @param item 要给予玩家的物品
     * @returns 是否成功给予玩家
     */
    /*giveItem(item:FMPItem):boolean{
        return this.rawplayer.giveItem()
    }*/
    tell (msg: string, type?: sendTextType): boolean{
        try{
            this.rawplayer.sendMessage(msg,type);
            return true;
        }
        catch{
            return false;
        }
    }
    setGameMode(gamemode:FMPGameMode){
        return this.rawplayer.setGameMode(toesGamemode(gamemode));
    }
    /*teleport(location:FMPLocation,direction?:FMPEulerAngles):boolean{
        if(direction===undefined){
            return this.rawplayer.teleport(location.toesLocation());
        }
        return this.rawplayer.teleport(location.toesLocation(),toll2DirectionAngle(direction));
    }*/
    toesPlayer():Player{
        return JSE.getPlugin().getServer().getPlayer(this.uuid)
    }
    /**
     * 调用加载器或插件内数据库通过玩家名查询其UUID
     * @param name 玩家游戏名
     * @returns 玩家UUID
     */
    static name2uuid(name:string):string|undefined{
        throw new Error("LNSDK尚不支持在es上查询玩家名/uuid/xuid")
        // const rawResult=data.name2uuid(name)
        // if(rawResult==null)return undefined
        // else return rawResult
    }
    /**
     * 调用加载器或插件内数据库通过玩家XUID查询其UUID
     * @param xuid 玩家XUID
     * @returns 玩家UUID
     */
    static xuid2uuid(xuid:string):string|undefined{
        throw new Error("LNSDK尚不支持在es上查询玩家名/uuid/xuid")
        // const rawResult=data.xuid2uuid(xuid)
        // if(rawResult==null)return undefined
        // else return rawResult
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家名
     * @param uuid 玩家UUID
     * @returns 玩家名
     */
    static uuid2name(uuid:string):string|undefined{
        throw new Error("LNSDK尚不支持在es上查询玩家名/uuid/xuid")
    //    for(let playerInfo of data.getAllPlayerInfo()){
    //         if(playerInfo.uuid==uuid)return playerInfo.name
    //    }
    //    return undefined
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家XUID
     * @param uuid 玩家UUID
     * @returns 玩家XUID
     */
    static uuid2xuid(uuid:string):string|undefined{
        throw new Error("LNSDK尚不支持在es上查询玩家名/uuid/xuid")
        // for(let playerInfo of data.getAllPlayerInfo()){
        //     if(playerInfo.uuid==uuid)return playerInfo.xuid
        // }
        // return undefined
    }
    /**
     * 通过玩家对应的字段获取玩家
     * @param prividedID 玩家的游戏名/UUID/XUID
     * @returns 玩家在线时返回该玩家对象，不在线或不存在的返回undefined
     */
    static getOnlinePlayer(providedID:string):FMPPlayer|undefined{
        //如果用原生接口能直接获取，就不用搜索
        const originalAPIReuslt=JSE.getPlugin().getServer().getPlayer(providedID) as Player|null
        if(originalAPIReuslt!=null)return new FMPPlayer(originalAPIReuslt)
        //原生接口无法获取，开始使用uuid暴力搜索在线玩家
        const uuidSearchResult=(()=>{
            for(let player of JSE.getPlugin().getServer().getOnlinePlayers()){
                if(player.uuid==providedID){
                    return new FMPPlayer(player)
                }
            }
            //uuid也搜索不到，证明没有任何线索，返回undefined
            return undefined
        })()
        return uuidSearchResult
        
    }
}