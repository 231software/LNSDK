import { FMPLogger } from "../Logger";
import { FMPEulerAngles, FMPLocation } from "./Location";

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
    /** 获取玩家在游戏世界中的朝向 */
    get direction():FMPEulerAngles{
        return FMPEulerAngles.new(0,0,0)
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