import {FMPPlayer} from "./Game/Player.js";
export class FMPSimpleForm{
    constructor(title=" ",content="",buttons:FMPSimpleFormButton[]=[],onClose:(player:FMPPlayer)=>void) {
        
    }
    send(player:FMPPlayer){
        
    }
}

export class FMPSimpleFormButton{
    name:string;
    text:string;
    callback:(player:FMPPlayer)=>void
    image:string|undefined;
    constructor(name:string,text:string,callback:(player:FMPPlayer)=>void,image?:string){
        this.name=name;
        this.callback=callback;
        this.image=image;
    }
}