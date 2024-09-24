import {FMPPlayer} from "./Game/Player.js";
import {FMPLogger} from "./Logger.js"
export class FMPSimpleForm{
    rawform:SimpleForm;
    defaultCallback:(player:FMPPlayer)=>void
    buttons:FMPSimpleFormButton[];
    constructor(title=" ",content="",buttons:FMPSimpleFormButton[]=[],onClose?:(player:FMPPlayer)=>void) {
        this.rawform=mc.newSimpleForm();
        this.rawform.setTitle(title);
        this.rawform.setContent(content);
        this.buttons=buttons;
        for(let button of buttons){
            this.rawform.addButton(button.text)
        }
        this.defaultCallback=(onClose==undefined?()=>{}:onClose)
    }
    send(player:FMPPlayer,lastForm?:FMPSimpleForm){
        player.toll2Player().sendForm(this.rawform,this.buildCallback())
    }

    /**
     * 设置玩家点击关闭时的回调
     * @param {function} callback 回调
     */
    set default(callback:()=>void){
        this.defaultCallback=callback;
    }
    buildCallback():(player:Player,id:number|null)=>void{
        //由于下文callback作用域问题，需要将这两个变量传到方法内部
        let defaultCallback=this.defaultCallback;
        let buttons=this.buttons;
        return callback;
        /**
         * 这个函数里面不能直接调用this！  
         * 因为作用域问题，如果想访问前面实例的成员，必须先方法开始把实例拷贝到方法内部变成方法内的局部变量
         * @param {Player} player 操作表单的玩家
         * @param {number} id 玩家点击的按钮在表单上的次序
         * @returns 
         */
        function callback(player:Player,id:number|null){
            if(id==null){
                //这里得传入this，因为已经脱离原来的类了
                defaultCallback(new FMPPlayer(player));
            }
            else{
                buttons[id].callback(new FMPPlayer(player));
            }
        }
    }
}

export class FMPSimpleFormButton{
    name:string;
    text:string;
    callback:(player:FMPPlayer)=>void
    image:string|undefined;
    constructor(name:string,text:string,callback:(player:FMPPlayer)=>void,image?:string){
        this.name=name;
        this.text=text;
        this.callback=callback;
        this.image=image;
    }
}