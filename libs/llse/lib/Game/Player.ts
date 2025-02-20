import { FMPLogger } from "../Logger";
import { FMPInternalPermission } from "./InternalPermission";
import { FMPItem } from "./Item";
import { FMPEulerAngles, FMPLocation, toll2DirectionAngle } from "./Location";
export enum FMPGameMode{
    Survival=0,
    Creative=1,
    Adventure=2,
    Spectator=3,
    Unknown
}
export function fromll2gamemode(ll2gamemode:number):FMPGameMode{
    switch(ll2gamemode){
        case 0:return FMPGameMode.Survival;
        case 1:return FMPGameMode.Creative;
        case 2:return FMPGameMode.Adventure;
        case 6:return FMPGameMode.Spectator;
        default:return FMPGameMode.Unknown;
    }
}
export function toll2gamemode(gamemode:FMPGameMode):number{
    switch(gamemode){
        case FMPGameMode.Survival:return 0;
        case FMPGameMode.Creative:return 1;
        case FMPGameMode.Adventure:return 2;
        default:FMPLogger.warn("尝试向LLSE转换其不支持的游戏模式！已自动将玩家转换为观察者模式。");
        case FMPGameMode.Spectator:return 6;
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
        //用于执行方法
        this.rawplayer=rawplayer;
        /*
        //判断平台并转换属性
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:return;
            case SupportedPlatforms.LiteLoaderBDS:
                this.name=rawplayer.name;
                this.xuid=rawplayer.xuid;
                this.uuid=rawplayer.uuid;
                this.gamemode=rawplayer.gameMode;
                this.isSneaking=rawplayer.isSneaking;
                break;
            case SupportedPlatforms.LeviLamina:
                this.name=rawplayer.name;
                break;
        }
        */
    }
    get name():string{
        //判断平台并读取相应属性
        return this.rawplayer.name;
    }
    get xuid():string{
        return this.rawplayer.xuid;
    }    
    get uuid():string{
        return this.rawplayer.uuid;
    }    
    get gameMode():FMPGameMode{
        return fromll2gamemode(this.rawplayer.gameMode);
    }
    //返回的是玩家脚部坐标！
    get location():FMPLocation{
        return new FMPLocation(this.rawplayer.feetPos,false);
    }
    get direction():FMPEulerAngles{
        return FMPEulerAngles.new(this.rawplayer.direction.yaw,this.rawplayer.direction.pitch,0);
    }
    /**玩家对于游戏内置权限的权限等级 */
    get internalPermission():FMPInternalPermission{
        return this.rawplayer.isOP()?FMPInternalPermission.GameMasters:FMPInternalPermission.Admin
    }
    get isSneaking():boolean{
        return this.rawplayer.isSneaking;
    }
    get inAir():boolean{
        return this.rawplayer.inAir
    }
    /**
     * 判断当前玩家是否在线。  
     * 在很多插件加载器中，尝试对已下线的玩家读取属性或执行方法都会导致报错。在需要对一个长期保存的玩家进行操作时，建议在操作前检查其是否在线，并对其不在线的情况采取措施。  
     * @returns 玩家是否在线
     */
    isOnline():boolean{
        return !(this.rawplayer.uuid==undefined)
    }
    isSimulated():boolean{
        return this.rawplayer.isSimulatedPlayer()
    }
    /**
     * 给予玩家一个物品
     * @param item 要给予玩家的物品
     * @returns 是否成功给予玩家
     */
    giveItem(item:FMPItem):boolean{
        return this.rawplayer.giveItem(item.rawItem)
    }
    tell (msg: string, type?: sendTextType): boolean{
        return this.rawplayer.tell(msg,type);
    }
    setGameMode(gamemode:FMPGameMode){
        return this.rawplayer.setGameMode(toll2gamemode(gamemode));
    }
    teleport(location:FMPLocation,direction?:FMPEulerAngles):boolean{
        if(direction===undefined){
            return this.rawplayer.teleport(location.toll2FloatPos());
        }
        return this.rawplayer.teleport(location.toll2FloatPos(),toll2DirectionAngle(direction));
    }
    runCmd(cmd:string):boolean{
        return this.rawplayer.runcmd(cmd)
    }
    toll2Player():Player{
        return mc.getPlayer(this.xuid)
    }
    /**
     * 调用加载器或插件内数据库通过玩家名查询其UUID
     * @param name 玩家游戏名
     * @returns 玩家UUID
     */
    static name2uuid(name:string):string|undefined{
        const rawResult=data.name2uuid(name)
        if(rawResult==null)return undefined
        else return rawResult
    }
    /**
     * 调用加载器或插件内数据库通过玩家XUID查询其UUID
     * @param xuid 玩家XUID
     * @returns 玩家UUID
     */
    static xuid2uuid(xuid:string):string|undefined{
        const rawResult=data.xuid2uuid(xuid)
        if(rawResult==null)return undefined
        else return rawResult
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家名
     * @param uuid 玩家UUID
     * @returns 玩家名
     */
    static uuid2name(uuid:string):string|undefined{
        //data.uuid2name()
        /*
        const rawResult=mc.getP(xuid)
        if(rawResult==null)return undefined
        else return rawResult
        */
       for(let playerInfo of data.getAllPlayerInfo()){
            if(playerInfo.uuid==uuid)return playerInfo.name
       }
       return undefined
    }
    /**
     * 调用加载器或插件内数据库通过玩家UUID查询玩家XUID
     * @param uuid 玩家UUID
     * @returns 玩家XUID
     */
    static uuid2xuid(uuid:string):string|undefined{
        for(let playerInfo of data.getAllPlayerInfo()){
            if(playerInfo.uuid==uuid)return playerInfo.xuid
        }
        return undefined
    }
    /**
     * 通过玩家对应的字段获取玩家
     * @param prividedID 玩家的游戏名/UUID/XUID
     * @returns 玩家在线时返回该玩家对象，不在线或不存在的返回undefined
     */
    static getOnlinePlayer(providedID:string):FMPPlayer|undefined{
        //如果用原生接口能直接获取，就不用搜索
        const originalAPIReuslt=mc.getPlayer(providedID) as Player|null
        if(originalAPIReuslt!=null)return new FMPPlayer(originalAPIReuslt)
        //原生接口无法获取，开始使用uuid暴力搜索在线玩家
        const uuidSearchResult=(()=>{
            for(let player of mc.getOnlinePlayers()){
                if(player.uuid==providedID){
                    return new FMPPlayer(player)
                }
            }
            //uuid也搜索不到，证明没有任何线索，返回undefined
            return undefined
        })()
        return uuidSearchResult
        
    }
    /**
    * 获取服务器中所有在线玩家
    * @returns 所有玩家
    */
    static getAllOnline():FMPPlayer[]{
        const result:FMPPlayer[]=[]
        for(let rawPlayer of mc.getOnlinePlayers())result.push(new FMPPlayer(rawPlayer))
        return result
    }
}