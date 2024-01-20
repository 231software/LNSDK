import { LNPlatform, LNSupportedPlatforms } from "../Platform";
import { LNLocation } from "./Location";
export enum LNGamemode{
    Survival=0,
    Creative=1,
    Adventure=2,
    Spectator=3,
    Unknown
}
export function fromll2gamemode(ll2gamemode:number):LNGamemode{
    switch(ll2gamemode){
        case 0:return LNGamemode.Survival;
        case 1:return LNGamemode.Creative;
        case 2:return LNGamemode.Adventure;
        case 3:return LNGamemode.Spectator;
        default:return LNGamemode.Unknown;
    }
}
export function toll2gamemode(gamemode:LNGamemode):number{
    switch(gamemode){
        case LNGamemode.Survival:return 0;
        case LNGamemode.Creative:return 1;
        case LNGamemode.Adventure:return 2;
        case LNGamemode.Spectator:return 3;
        default://错误系统没写完
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
    getName():string{
        //判断平台并读取相应属性
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.name;
            default:return "";
        }
    }
    getXuid():string{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.xuid;
            default:return "";
        }
    }    
    getUuid():string{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawplayer.uuid;
            default:return "";
        }
    }    
    getGamemode():LNGamemode{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return fromll2gamemode(this.rawplayer.gameMode);
            default:return LNGamemode.Unknown;
        }
    }
    getLocation():LNLocation{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:return new LNLocation(this.rawplayer.pos,false);
            default:return LNLocation.new(0,0,0)
        }
    }
    isSneaking():boolean{
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:break;
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.isSneaking;
        }
    }
    tell (msg: string, type?: sendTextType): boolean{
        //判断平台并调用相应方法
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:break;
            case LNSupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.tell(msg,type);
        }
    }
    toll2Player():Player{
        return mc.getPlayer(this.getXuid())
    }
}