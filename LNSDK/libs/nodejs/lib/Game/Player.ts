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
    /**
     * 在游戏内向玩家发送一条消息，没有任何前缀
     * @returns 是否发送成功
     */
    tell(message:string):boolean{
        return false;
    }
    teleport(location:FMPLocation):boolean{
        return false;
    }
    setGameMode(gameMode:FMPGameMode):boolean{
        return false;
    }
}