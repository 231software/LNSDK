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
    /** 获取玩家在游戏世界中的朝向 */
    get direction():FMPEulerAngles{
        return FMPEulerAngles.new(0,0,0)
    }
    teleport(location:FMPLocation):boolean{
        return false;
    }
    setGameMode(gameMode:FMPGameMode):boolean{
        return false;
    }
}