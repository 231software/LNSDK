import { Platform, SupportedPlatforms } from "../Platform";
import { LNLocation } from "./Location";
export enum Gamemode{
    Survival=0,
    Creative=1,
    Adventure=2,
    Spectator=3,
    Unknown
}
export function fromll2gamemode(ll2gamemode:number):Gamemode{
    switch(ll2gamemode){
        case 0:return Gamemode.Survival;
        case 1:return Gamemode.Creative;
        case 2:return Gamemode.Adventure;
        case 3:return Gamemode.Spectator;
        default:return Gamemode.Unknown;
    }
}
export function toll2gamemode(gamemode:Gamemode):number{
    switch(gamemode){
        case Gamemode.Survival:return 0;
        case Gamemode.Creative:return 1;
        case Gamemode.Adventure:return 2;
        case Gamemode.Spectator:return 3;
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
export class Player{
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
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.name;
        }
    }
    getXuid():string{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.xuid;
        }
    }    
    getUuid():string{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.uuid;
        }
    }    
    getGamemode():Gamemode{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return fromll2gamemode(this.rawplayer.gameMode);
        }
    }
    getLocation():LNLocation{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return new LNLocation(this.rawplayer.pos);
        }
    }
    isSneaking():boolean{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.isSneaking;
        }
    }
    tell (msg: string, type?: sendTextType): boolean{
        //判断平台并调用相应方法
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                return this.rawplayer.tell(msg,type);
        }
    }
    toll2Player():ll2Player{
        return mc.getPlayer(this.getXuid())
    }
}