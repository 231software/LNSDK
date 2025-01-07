import { FMPLogger } from "../Logger";
import { FMPLocation } from "./Location";
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
        case 3:return FMPGameMode.Spectator;
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
export enum sendTestType{
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
    getName():string{
        //判断平台并读取相应属性
        return this.rawplayer.name;
    }
    getXuid():string{
        return this.rawplayer.xuid;
    }    
    getUuid():string{
        return this.rawplayer.uuid;
    }    
    getGameMode():FMPGameMode{
        return fromll2gamemode(this.rawplayer.gameMode);
    }
    getLocation():FMPLocation{
        return new FMPLocation(this.rawplayer.pos,false);
    }
    isSneaking():boolean{
        return this.rawplayer.isSneaking;
    }
    tell (msg: string, type?: sendTextType): boolean{
        return this.rawplayer.tell(msg,type);
    }
    setGameMode(gamemode:FMPGameMode){
        return this.rawplayer.setGameMode(toll2gamemode(gamemode));
    }
    toll2Player():Player{
        return mc.getPlayer(this.getXuid())
    }
}