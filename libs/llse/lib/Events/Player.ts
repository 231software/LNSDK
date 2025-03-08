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
export class FMPPlayerChatEvent{
    player:FMPPlayer
    msg:string
    constructor(player:FMPPlayer,msg:string){
        this.player=player,
        this.msg=msg
    }
    static on(callback:(event:FMPPlayerChatEvent)=>boolean|void){
        mc.listen("onChat",(player,msg)=>{
            return callback(new FMPPlayerChatEvent(new FMPPlayer(player),msg))!==false
        })
    }
}