import { FMPPlayer } from "../Game/Player";
export class FMPPlayerJoinEvent{
    player:FMPPlayer
    constructor(player:FMPPlayer){
        this.player=player;
    }
    static on(callback:(event:FMPPlayerJoinEvent)=>boolean|void){
        mc.listen("onJoin",(player)=>{
            callback(new FMPPlayerJoinEvent(new FMPPlayer(player)));
        });
    }
}
export class FMPPlayerToggleSneakEvent{
    player:FMPPlayer
    isSneaking:boolean
    constructor(player:FMPPlayer,isSneaking:boolean){
        this.player=player;
        this.isSneaking=isSneaking;
    }
    static on(callback:(event:FMPPlayerToggleSneakEvent)=>boolean|void){
        mc.listen("onSneak",(player,isSneaking)=>{
            callback(new FMPPlayerToggleSneakEvent(new FMPPlayer(player),isSneaking));
        });
    }
}