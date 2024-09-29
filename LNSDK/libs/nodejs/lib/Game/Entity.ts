import { FMPDefaultDimension, FMPDimension } from "./Dimension";
import { FMPEulerAngles, FMPLocation } from "./Location";
import {FMPGameMode, FMPPlayer} from "./Player"
export class FMPEntity{
    constructor(){

    }
    isPlayer():boolean{
        return false;
    }
    toPlayer():FMPPlayer{
        return new FMPPlayer("0","实体转换玩家目前尚未开发完毕",FMPLocation.new(0,0,0,new FMPDimension(FMPDefaultDimension.Overworld)),FMPGameMode.Survival);
    }
}
export enum FMPDamageCause {
    None = -0x01,
    Override = 0x00,
    Contact = 0x01,
    EntityAttack = 0x02,
    Projectile = 0x03,
    Suffocation = 0x04,
    Fall = 0x05,
    Fire = 0x06,
    FireTick = 0x07,
    Lava = 0x08,
    Drowning = 0x09,
    BlockExplosion = 0x0a,
    EntityExplosion = 0x0b,
    Void = 0x0c,
    Suicide = 0x0d,
    Magic = 0x0e,
    Wither = 0x0f,
    Starve = 0x10,
    Anvil = 0x11,
    Thorns = 0x12,
    FallingBlock = 0x13,
    Piston = 0x14,
    FlyIntoWall = 0x15,
    Magma = 0x16,
    Fireworks = 0x17,
    Lightning = 0x18,
    Charging = 0x19,
    Temperature = 0x1a,
    Freezing = 0x1b,
    Stalactite = 0x1c,
    Stalagmite = 0x1d,
    All = 0x1f,
  }