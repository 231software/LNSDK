import {mc} from "../../../@LLSELib/index.js"
import { LNPlatform, LNSupportedPlatforms } from "../Platform.js";
import { LNPlayer } from "../Game/Player.js";
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
                });
                break;
        }
    }
}