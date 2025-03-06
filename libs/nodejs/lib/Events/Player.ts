import { FMPPlayer } from "../Game/Player";
export let playerJoinEventHandler=(event:FMPPlayerJoinEvent):boolean|void=>{}
export class FMPPlayerJoinEvent{
    player:FMPPlayer
    constructor(player:FMPPlayer){
        this.player=player
    }
    static on(callback:(event:FMPPlayerJoinEvent)=>boolean|void){
        playerJoinEventHandler=callback
    }
}
export class FMPPlayerToggleSneakEvent{
    player:FMPPlayer
    isSneaking:boolean
    constructor(player:FMPPlayer,isSneaking:boolean){
        this.player=player
        this.isSneaking=isSneaking
    }
    static on(callback:(event:FMPPlayerToggleSneakEvent)=>boolean|void){
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
    }
}