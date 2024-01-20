import { LNPlatform, LNSupportedPlatforms } from "../../Platform";
import { LNPlayer } from "../../Game/Player";
export class LNPlayerToggleSneakEvent{
    player:LNPlayer
    isSneaking:boolean
    constructor(player:LNPlayer,isSneaking:boolean){
        this.player=player;
        this.isSneaking=isSneaking;
    }
    static on(callback:(event:LNPlayerToggleSneakEvent)=>boolean|void){
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:break;
            case LNSupportedPlatforms.LiteLoaderBDS:
                mc.listen("onSneak",(player,isSneaking)=>{
                    callback(new LNPlayerToggleSneakEvent(new LNPlayer(player),isSneaking));
                })
        }
    }
}