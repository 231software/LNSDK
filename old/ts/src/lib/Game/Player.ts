import { LNLogger } from "../LNSDKT";
import { LNPlatform, LNSupportedPlatforms } from "../Platform";
import { LNLocation } from "./Location";
export enum LNGameMode{
    Survival=0,
    Creative,
    Adventure,
    Spectator,
    Unknown
}
export function fromll2gamemode(ll2gamemode:number):LNGameMode{
    switch(ll2gamemode){
        case 0:return LNGameMode.Survival;
        case 1:return LNGameMode.Creative;
        case 2:return LNGameMode.Adventure;
        case 3:return LNGameMode.Spectator;
        default:return LNGameMode.Unknown;
    }
}
export function toll2gamemode(gamemode:LNGameMode):number{
    switch(gamemode){
        case LNGameMode.Survival:return 0;
        case LNGameMode.Creative:return 1;
        case LNGameMode.Adventure:return 2;
        default:LNLogger.warn("尝试向LLSE转换其不支持的游戏模式！已自动将玩家转换为观察者模式。");
        case LNGameMode.Spectator:return 6;
    }
}
export enum sendTestType{
    raw = 0,
    chat,
    popup,
    tip,
    json,
}
export class LNPlayer{
    rawplayer:any;
    /*
    name:string;
    xuid:string;
    uuid:string;
    gamemode:Gamemode;
    isSneaking:boolean;
    */
    
    constructor(rawplayer:any){
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
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.name;
            default:return "";
        }
    }
    get xuid():string{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.xuid;
            default:return "";
        }
    }    
    get uuid():string{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.uuid;
            default:return "";
        }
    }    
    get gameMode():LNGameMode{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return fromll2gamemode(this.rawplayer.gameMode);
            default:return LNGameMode.Unknown;
        }
    }
    /**
     * 玩家的腿部坐标
     */
    get location():LNLocation{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return new LNLocation(this.rawplayer.feetPos,false);
            default:return LNLocation.new(0,0,0)
        }
    }
    get isSneaking():boolean{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:break;
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.isSneaking;
        }
    }
    tell (msg: string, type?: sendTextType): boolean{
        //判断平台并调用相应方法
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.tell(msg,type);
            default:return false;
        }
    }
    setGameMode(gamemode:LNGameMode):boolean{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.setGameMode(toll2gamemode(gamemode));
            default:return false;
        }
    }
    teleport(location:LNLocation,rotation=undefined):boolean{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.teleport(location.toll2FloatPos());
            default:return false;
        }
        
    }
    toll2Player():Player{
        return mc.getPlayer(this.xuid)
    }
}