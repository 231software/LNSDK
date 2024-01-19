import { Platform, SupportedPlatforms } from "../../Platform";
import { Player } from "../../Game/Player";
export class PlayerToggleSneakEvent{
    player:Player
    isSneaking:boolean
    constructor(player:Player,isSneaking:boolean){
        this.player=player;
        this.isSneaking=isSneaking;
    }
    static on(callback:(event:PlayerToggleSneakEvent)=>boolean|void){
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:
                mc.listen("onSneak",(player,isSneaking)=>{
                    callback(new PlayerToggleSneakEvent(new Player(player),isSneaking));
                })
        }
    }
}