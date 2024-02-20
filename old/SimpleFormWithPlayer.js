const SimpleFormCallback=require(".\\plugins\\lib\\SimpleFormCallback.js");
/**
 * 进一步规范SimpleForm，将表单与玩家绑定
 */
class SimpleFormWithPlayer extends SimpleFormCallback{
    /**
     * 
     * @param {Player} player 表单绑定的玩家
     * @param {string} title 表单标题
     * @param {string} content 表单内容
     * @param {SimpleFormWithPlayer} lastForm 传入上级表单（必须是SimpleFormWithPlayer或其子类），此表单将自动在最上方生成一个返回按钮，点击会发送此传入的表单类
     */
    constructor(player,title=" ",content=" ",lastForm=undefined){
        super(title,content);
        if(lastForm!=undefined){
            super.addButton("<===",()=>{lastForm.send();});
        }
        this.player=player;
    }
    /**向表单绑定的玩家发送表单 */
    send(){
        super.send(this.player)
    }
}
module.exports=SimpleFormWithPlayer;