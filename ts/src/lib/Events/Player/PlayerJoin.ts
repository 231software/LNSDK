import { LNPlatform, LNSupportedPlatforms } from "../../Platform";
import { LNPlayer } from "../../Game/Player";
export class LNPlayerJoinEvent{
    player:LNPlayer
    constructor(player:LNPlayer){
        this.player=player
    }
    static on(callback:(event:LNPlayerJoinEvent)=>boolean|void){
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:break;
            case LNSupportedPlatforms.LiteLoaderBDS:
                mc.listen("onJoin",(player)=>{
                    callback(new LNPlayerJoinEvent(new LNPlayer(player)));
                });
                break;
        }
    }
}