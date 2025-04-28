import { callbackify } from "util";
import {FMPPlayer} from "./Game/Player.js";
import { Logger, SimpleFormSession } from "./index.js";
import {FMPLogger} from "./Logger.js"

/**
 * 这个any还没搞明白为什么，等后面实际编程的时候遇到了再说
 */
export abstract class FMPForm{
    title:string
    content:string
    //onClose:(session:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession)=>void
    //这里传入的any证明表单回调接收到的表单会话参数中上个会话可以是任何类型
    abstract send(formSession:FMPFormSession):boolean
    constructor(
        title:string,
        content:string,
        //onClose:(session:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession)=>void=()=>{}
    ){
        this.title=title
        this.content=content
        //this.onClose=onClose
    }
}
/**
 * 关于这个表单会话类的泛型，我需要知道的信息如下：  
 * - 当前表单的类型
 * - 上个表单的会话的类型
 * 
 * 上个表单会话的表单需要用到吗？用不到一点。  
 * 我们回到当前这个类的泛型来看，它已经包含了当前对应的表单的类型  
 * 如果代码中我需要用到上个表单的属性方法，我可以直接从上个表单会话中获取  
 * 但是泛型中的上个表单会话又朝我要这个上个表单会话的表单类型怎么办？  
 * 这个时候就需要我们的`any`了，由于我们不需要提供上个表单的类型，直接给他any把他打发走就可以了  
 * 但是这里我如果填入any的话，后面开发的时候这里再传入其他错误的类型怎么办？  
 * 由于FMPFormSession这个类已经规定了第一个泛型参数的类型  
 * 任何会话的第一个泛型参数都是指定好的，已经被统一了  
 * 那这个时候使用any也没有关系了，因为他这里即使要求any，上面传入的类型也永远是会话类的子类  
 * 以后遇到这种递归的泛型，到第三层就全给他any  
 * 反正前面的泛型已经被规定好了  
 * 到这里传入的类型全是固定的  
 */
export abstract class FMPFormSession{
    /**会话对应的表单 */
    form:FMPSimpleForm|FMPCustomForm|FMPModalForm
    /**会话绑定的玩家 */
    player:FMPPlayer
    /**跳转到该会话的表单会话，如果该会话不是从表单跳转过来的，那么此属性为undefined */
    lastSession:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession|undefined
    /**
     * 
     * @param form 表单会话对应的表单
     * @param player 表单会话绑定的玩家
     * @param lastSession 跳转到当前表单会话的表单，如果不是由表单跳转到的就不传
     */
    constructor(form:FMPSimpleForm|FMPCustomForm|FMPModalForm,player:FMPPlayer,lastSession?:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession){
        this.form=form
        this.player=player
        this.lastSession=lastSession
    }
    /**
     * 判断是否为会话类的子类 
     * @param mayBeSession 要用于判断的会话
     * @returns 该会话是否真的是会话
     */
    static isSession(mayBeSession:any): mayBeSession is FMPFormSession {
        return mayBeSession instanceof FMPFormSession;
    }
    abstract send():boolean
}

export class FMPSimpleForm{
    title:string
    content:string
    buttons:FMPSimpleFormButton[]=[]
    onClose:(session:FMPSimpleFormSession)=>void
    rawform:SimpleForm;
    defaultCallback:(session:FMPSimpleFormSession)=>void
    constructor(title=" ",content="",buttons:FMPSimpleFormButton[]=[],onClose?:(session:FMPSimpleFormSession)=>void) {
        this.title=title
        this.content=content
        this.buttons=buttons;
        this.onClose=onClose!=undefined?onClose:()=>{};
        this.build();
    }
    send(formSession:FMPSimpleFormSession){
        if(formSession.player==undefined){
            FMPLogger.warn("当前会话中无玩家，表单无法被发送");
            return false;
        }
        formSession.player.toll2Player().sendForm(this.rawform,this.buildCallback(formSession))
    }

    /**
     * 设置玩家点击关闭时的回调
     * @param {function} callback 回调
     */
    set default(callback:()=>void){
        this.defaultCallback=callback;
    }
    buildCallback(formSession:SimpleFormSession):(player:Player,id:number|null)=>void{
        //由于下文callback作用域问题，需要将这两个变量传到方法内部
        const defaultCallback=this.defaultCallback;
        const buttons=this.buttons;
        const form=this
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
                defaultCallback(formSession);
            }
            else{
                buttons[id].callback(formSession);
            }
        }
    }
    build(){
        this.rawform=mc.newSimpleForm();
        this.rawform.setTitle(this.title);
        this.rawform.setContent(this.content);
        for(let button of this.buttons){
            this.rawform.addButton(button.text)
        }
        this.defaultCallback=this.onClose
    }
}

export class FMPSimpleFormButton{
    name:string;
    text:string;
    callback:(formSession:FMPSimpleFormSession)=>void
    image:string|undefined;
    type:FMPSimpleFormButtonType
    /**
     * 
     * @param name 按钮名字
     * @param text 按钮上显示的内容
     * @param callback 按钮的回调
     * @param image 按钮左侧要显示的图片的网络或本地路径，可空
     */
    constructor(name:string,text:string,callback:(formSession:FMPSimpleFormSession)=>void,image?:string,type:FMPSimpleFormButtonType=FMPSimpleFormButtonType.Common){
        this.name=name;
        this.text=text;
        this.callback=callback;
        this.image=image;
        this.type=type;
    }
}
export enum FMPSimpleFormButtonType{
    Common,
    Back,
    Minimize,
    MultiTask
}
export class FMPSimpleFormSession extends FMPFormSession{
    declare form:FMPSimpleForm
    /**
     * 
     * @param form 当前会话对应的表单
     * @param lastSessionOrPlayer 如果当前会话是由其他表单跳转过来的，就传入跳转的源头  
     * 否则就传入当前会话对应的玩家  
     * 如果是跳转过来的但是不想返回，直接传入玩家即可。通常从跳转过来的会话中取出玩家传入即可
     */
    constructor(form:FMPSimpleForm,lastSessionOrPlayer:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession|FMPPlayer){
        /**为了防止后续对原始表单的修改导致全局的表彰发生变化，就在这里把原表单的按钮列表拷贝一份*/
        const originalFormButtons:FMPSimpleFormButton[]=[];
        for(let button of form.buttons){
            originalFormButtons.push(button);
        }
        //传入了表单会话，指明了跳转来源，就可以使用这个跳转来源进行后退操作了。
        if(FMPFormSession.isSession(lastSessionOrPlayer)){
            /**
             * 专门用于跳转返回上个表单的按钮  
             * 如果是从上一个表单跳转过来，证明玩家不变，直接取用上一个会话的玩家即可，这个会话不强制传入玩家也是这个原因
             */
            const backButton=new FMPSimpleFormButton(
                "返回","<===",(session)=>{
                    //这里接收到的会话是后退的来源，可以用来前进
                    lastSessionOrPlayer.send()
                },undefined,FMPSimpleFormButtonType.Back
            );
            //表单按钮列表的第一个是返回键
            if(originalFormButtons[0]?.type==FMPSimpleFormButtonType.Back){
                originalFormButtons[0]=backButton;
            }
            else{
                originalFormButtons.unshift(backButton)
            }
            //使用修改后的按钮重新生成一个新表单传入
            super(new FMPSimpleForm(form.title,form.content,originalFormButtons,form.onClose),lastSessionOrPlayer.player,lastSessionOrPlayer)
        }
        //只传入了玩家却不传入表单，证明没有上个表单
        if(lastSessionOrPlayer instanceof FMPPlayer){
            //这里直接传入原表单，是因为form
            super(form,lastSessionOrPlayer)
        }
        
    }
    send():boolean{
        if(this.lastSession!=undefined){
            this.form.send(this);
            return true;
        }
        if(this.player!=undefined){
            this.form.send(this)
            return true;
        }
        FMPLogger.warn("表单发送失败，没有提供任何应该收到表单的玩家，因为无法从上级表单或传入参数指定发送者中的任何一个方式获取当前表单会话所属玩家")
        return false;
    }
    
}



////////////////自定义表单////////////////

export class FMPCustomForm extends FMPForm{
    elements:(FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch)[];
    onClose:(session:FMPCustomFormSession)=>void
    onSubmit:(
        elementValues:FMPCustomFormResult,
        session:FMPCustomFormSession
    )=>void
    constructor(
        title:string,
        elements:(FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch)[],
        onSubmit:(
            elementValues:FMPCustomFormResult,
            session:FMPCustomFormSession
        )=>void,
        onClose:(session:FMPCustomFormSession)=>void=(session)=>{}
    ){
        super(title,"")
        this.onClose=onClose
        this.elements=elements
        this.onSubmit=onSubmit
    }
    send(formSession:FMPCustomFormSession):boolean{
        const form=this
        const rawForm=mc.newCustomForm()
        /**当前表单是否添加了label作为其content，如果已添加这里就是true，后续需要将所有元素向后位移一个 */
        let hasContent=false
        rawForm.setTitle(this.title)
        const resultSubmitted:(FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch)[]=[]
        //如果content不是空字符串，那么就添加一个label作为说明文字
        if(this.content.length>0){
            rawForm.addLabel(this.content)
            //将这个额外加入的标签加入最终结果
            resultSubmitted.push(new FMPCustomFormLabel("FMP添加的表单说明",this.content))
            hasContent=true
        }
        for(let elementIndex in this.elements){
            const element=this.elements[elementIndex]
            if(element instanceof FMPCustomFormLabel){
                rawForm.addLabel(element.title)                
                resultSubmitted.push(new FMPCustomFormLabel(element.name,element.title))
            }
            if(element instanceof FMPCustomFormInput){
                //如果placeholder为undefined，就传入空字符串
                const placeholder=element.placeholder!=undefined?element.placeholder:""
                //LLSE不支持通过undefined识别参数重载，所以只能手动写上所有重载
                if(element.defaultValue==undefined){
                    rawForm.addInput(element.title,placeholder)
                }
                else{
                    rawForm.addInput(element.title,placeholder,element.defaultValue)
                }               
                resultSubmitted.push(new FMPCustomFormInput(element.name,element.title,element.placeholder,element.defaultValue))
            }
            if(element instanceof FMPCustomFormDropdown){
                if(element.defaultValue==undefined){
                    rawForm.addDropdown(element.title,element.items)
                }
                else{
                    rawForm.addDropdown(element.title,element.items,element.defaultValue)
                }
                resultSubmitted.push(new FMPCustomFormDropdown(element.name,element.title,element.items,element.defaultValue))
            }
            if(element instanceof FMPCustomFormSwitch){
                if(element.defaultValue==undefined){
                    rawForm.addSwitch(element.title)
                }
                else{
                    rawForm.addSwitch(element.title,element.defaultValue)
                }
                
                resultSubmitted.push(new FMPCustomFormSwitch(element.name,element.title,element.defaultValue))
            }
            if(element instanceof FMPCustomFormSlider){
                //step忘加上可以为undefined了，后面加上
                const step=element.step!=undefined?element.step:1
                if(element.defaultValue==undefined){
                    rawForm.addSlider(element.title,element.min,element.max,step)
                }else{
                    rawForm.addSlider(element.title,element.min,element.max,step,element.defaultValue)
                }
                
                resultSubmitted.push(new FMPCustomFormSlider(element.name,element.title,element.min,element.max,element.step,element.defaultValue))
            }
            if(element instanceof FMPCustomFormStepSlider){
                if(element.defaultValue==undefined){
                    rawForm.addStepSlider(element.title,element.items)
                }
                else{
                    rawForm.addStepSlider(element.title,element.items,element.defaultValue)
                }
                
                resultSubmitted.push(new FMPCustomFormStepSlider(element.name,element.title,element.items,element.defaultValue))
            }
        }
        return Boolean(formSession.player.rawObject.sendForm(rawForm,(player,data)=>{
            if(data==null){
                form.onClose(formSession)
                return
            }
            //rawDataIndex与上文中resultSubmitted中的索引一一对应
            for(let rawDataIndex in data){
                const MappedElement=resultSubmitted[rawDataIndex]
                //先检查类型是否一致
                if(MappedElement instanceof FMPCustomFormInput&&typeof data[rawDataIndex]=="string"){
                    //两边都是同一个类型之后就可以进行赋值了
                    resultSubmitted[rawDataIndex].value=data[rawDataIndex]
                }
                if(MappedElement instanceof FMPCustomFormDropdown&&typeof data[rawDataIndex]=="number"){
                    resultSubmitted[rawDataIndex].value=data[rawDataIndex]
                }
                if(MappedElement instanceof FMPCustomFormSwitch&&typeof data[rawDataIndex]=="boolean"){
                    resultSubmitted[rawDataIndex].value=data[rawDataIndex]
                }
                if(MappedElement instanceof FMPCustomFormSlider&&typeof data[rawDataIndex]=="number"){
                    resultSubmitted[rawDataIndex].value=data[rawDataIndex]
                }
                if(MappedElement instanceof FMPCustomFormStepSlider&&typeof data[rawDataIndex]=="number"){
                    resultSubmitted[rawDataIndex].value=data[rawDataIndex]
                }
                //如果没有找到能与当前元素匹配的类型，证明当前元素不需要进行赋值，比如说label
            }
            form.onSubmit(new FMPCustomFormResult(resultSubmitted),formSession)
        }))
    }
}
/**和简单表单一样，自定义表单也需要一个会话才能发送 */
export class FMPCustomFormSession extends FMPFormSession{
    declare form:FMPCustomForm
    /**
     * 
     * @param form 当前表单会话绑定的对象绑定的表单
     * @param lastSessionOrPlayer 跳转到当前表单的表单会话，如果不是由其他表单跳转过来的就写undefined
     */
    constructor(form:FMPCustomForm,lastSessionOrPlayer:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession|FMPPlayer){
        
        //传入了表单会话，指明了跳转来源，就可以使用这个跳转来源进行后退操作了。
        if(FMPFormSession.isSession(lastSessionOrPlayer)){
            super(
                //为了防止后续对于返回目标的修改对原表单造成影响，这里会重新生成一个表单
                new FMPCustomForm(
                    form.title,
                    form.elements,
                    (elementValues,session)=>{
                        //先执行原表单的处理提交按钮的方法
                        form.onSubmit(elementValues,session)
                        //再向玩家发送跳转回去的表单
                        lastSessionOrPlayer.send()
                    },
                    form.onClose
                ),
                //如果是从上一个表单跳转过来，证明玩家不变，直接取用上一个会话的玩家即可，这个会话不强制传入玩家也是这个原因
                lastSessionOrPlayer.player,
                lastSessionOrPlayer
            )
        }
        //只传入了玩家却不传入表单，证明没有上个表单
        if(lastSessionOrPlayer instanceof FMPPlayer){
            super(form,lastSessionOrPlayer)
        }
    }
    send():boolean{
        if(this.lastSession!=undefined){
            this.form.send(this);
            return true;
        }
        if(this.player!=undefined){
            this.form.send(this)
            return true;
        }
        FMPLogger.warn("表单发送失败，没有提供任何应该收到表单的玩家，因为无法从上级表单或传入参数指定发送者中的任何一个方式获取当前表单会话所属玩家")
        return false;
    }
}
export class FMPCustomFormElements{
    name:string
    title:string
    value:string|number|boolean|undefined
    constructor(name:string,title:string){
        this.name=name
        this.title=title
    }
}
export class FMPCustomFormInput extends FMPCustomFormElements{
    placeholder:string|undefined
    defaultValue:string|undefined
    declare value:string
    constructor(name:string,title:string,placeholder?:string,defaultValue?:string){
        super(name,title);
        this.placeholder=placeholder
        this.defaultValue=defaultValue
    }
}
export class FMPCustomFormLabel extends FMPCustomFormElements{
    constructor(name:string,title:string){
        super(name,title)
    }
}
export class FMPCustomFormSwitch extends FMPCustomFormElements{
    defaultValue:boolean|undefined
    declare value:boolean
    constructor(name:string,title:string,defaultValue?:boolean){
        super(name,title)
        this.defaultValue=defaultValue
    }
}
export class FMPCustomFormDropdown extends FMPCustomFormElements{
    defaultValue:number|undefined
    items:string[]
    declare value:number
    constructor(name:string,title:string,items:string[],defaultValue?:number){
        super(name,title)
        this.items=items
        this.defaultValue=defaultValue
    }
}
export class FMPCustomFormSlider extends FMPCustomFormElements{
    defaultValue:number|undefined
    min:number
    max:number
    step:number
    declare value:number
    constructor(name:string,title:string,min:number,max:number,step:number=1,defaultValue?:number){
        super(name,title)
        this.min=min
        this.max=max
        this.step=step
        this.defaultValue=defaultValue
    }
}
export class FMPCustomFormStepSlider extends FMPCustomFormElements{
    defaultValue:number|undefined
    items:string[]
    declare value:number
    constructor(name:string,title:string,items:string[],defaultValue?:number){
        super(name,title)
        this.items=items
        this.defaultValue=defaultValue
    }
}
/**
 * 自定义表单被玩家提交后的结果表  
 */
export class FMPCustomFormResult{
    map:Map<string,FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch>
    constructor(elements:(FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch)[]){
        this.map=new Map()
        //ts继承map时似乎不允许直接向父类构造方法传入数据，只能挨个set了
        //如果元素名和元素本体错位
        for(let element of elements){
            this.map.set(element.name,element)
        }
    }
    getInput(name:string):FMPCustomFormInput{
        const element=this.map.get(name)
        if(element==undefined)throw new Error("未找到名为"+name+"的元素")
        if(!(element instanceof FMPCustomFormInput))throw new Error("无法从表单中以CustomFormInput类型（输入框）获取名为"+name+"的元素！该元素的实际类型为："+element.constructor.name)
        return element
    }
    getDropdown(name:string):FMPCustomFormDropdown{
        const element=this.map.get(name)
        if(element==undefined)throw new Error("未找到名为"+name+"的元素")
        if(!(element instanceof FMPCustomFormDropdown))throw new Error("无法从表单中以CustomFormDropDown类型（下拉菜单）获取名为"+name+"的元素！该元素的实际类型为："+element.constructor.name)
        return element
    }
    getSlider(name:string):FMPCustomFormSlider{
        const element=this.map.get(name)
        if(element==undefined)throw new Error("未找到名为"+name+"的元素")
        if(!(element instanceof FMPCustomFormSlider))throw new Error("无法从表单中以CustomFormSlider类型（滑块）获取名为"+name+"的元素！该元素的实际类型为："+element.constructor.name)
        return element
    }
    getStepSlider(name:string):FMPCustomFormStepSlider{
        const element=this.map.get(name)
        if(element==undefined)throw new Error("未找到名为"+name+"的元素")
        if(!(element instanceof FMPCustomFormStepSlider))throw new Error("无法从表单中以CustomFormStepSlider类型（步进滑块）获取名为"+name+"的元素！该元素的实际类型为："+element.constructor.name)
        return element
    }
    getSwitch(name:string):FMPCustomFormSwitch{
        const element=this.get(name)
        if(element==undefined)throw new Error("未找到名为"+name+"的元素")
        if(!(element instanceof FMPCustomFormSwitch))throw new Error("无法从表单中以CustomFormSwitch（开关）类型获取名为"+name+"的元素！该元素的实际类型为："+element.constructor.name)
        return element
    }
    get(key:string):FMPCustomFormInput|FMPCustomFormDropdown|FMPCustomFormLabel|FMPCustomFormSlider|FMPCustomFormStepSlider|FMPCustomFormSwitch|undefined{
        return this.map.get(key)
    }
    keys():string[]{
        return [...this.map.keys()]
    }
}

///////////////////////模式表单（选择是否）//////////////////

export class FMPModalForm extends FMPForm{
    onConfirm:(session:FMPModalFormSession)=>void
    backOnConfirm:boolean
    confirmButtonText:string
    onCancel:(session:FMPModalFormSession)=>void
    backOnCancel:boolean
    cancelButtonText:string
    constructor(
        title:string,
        content:string,
        onConfirm:(session:FMPModalFormSession)=>void,
        backOnConfirm:boolean=false,
        confirmButtonText:string="确定",
        cancelButtonText:string="取消",
        onCancel:(session:FMPModalFormSession)=>void=(session)=>{},
        backOnCancel:boolean=false
    ){
        super(title,content)
        this.confirmButtonText=confirmButtonText
        this.cancelButtonText=cancelButtonText
        this.onConfirm=onConfirm
        this.backOnConfirm=backOnConfirm
        this.backOnCancel=backOnCancel
        this.onCancel=onCancel
    }
    send(session:FMPModalFormSession):boolean{
        session.player.rawObject.sendModalForm(
            this.title,
            this.content,
            this.confirmButtonText,
            this.cancelButtonText,
            (player,result)=>{
                //返回上级的逻辑在会话里已经处理过，这里只需要和原表单对接即可
                if(result==true){
                    this.onConfirm(session)
                }
                else{
                    this.onCancel(session)
                }
            }
        )
        return true
    }
}

/**
 * 这个表单会话写的非常乱，不能借鉴
 */
export class FMPModalFormSession extends FMPFormSession{
    declare form:FMPModalForm
    constructor(form:FMPModalForm,lastSessionOrPlayer:FMPSimpleFormSession|FMPCustomFormSession|FMPModalFormSession|FMPPlayer){
        //传入了会话，证明可以进行返回上级表单
        if(FMPFormSession.isSession(lastSessionOrPlayer)){
            const onConfirm:(session: FMPModalFormSession)=>void=form.backOnConfirm?
            (session: FMPModalFormSession) =>{
                //先执行原表单的处理提交按钮的方法
                form.onConfirm(session)
                //再向玩家发送跳转回去的表单
                lastSessionOrPlayer.send()
            }
            :
            form.onConfirm
            const onCancel:(session: FMPModalFormSession)=>void=form.backOnCancel?
            (session: FMPModalFormSession) =>{
                //先执行原表单的处理提交按钮的方法
                form.onCancel(session)
                //再向玩家发送跳转回去的表单
                lastSessionOrPlayer.send()
            }
            :
            form.onCancel
            super(new FMPModalForm(
                form.title,
                form.content,
                onConfirm,
                form.backOnConfirm,
                form.confirmButtonText,
                form.cancelButtonText,
                onCancel,
                form.backOnCancel
            ),lastSessionOrPlayer.player,lastSessionOrPlayer)
        }
        //只传入了玩家，代表本不需要返回的情况
        if(lastSessionOrPlayer instanceof FMPPlayer){
            //如果只传入了玩家没有传入会话，但是又指定了有的按钮需要返回，那他想返回也返回不了，毕竟没有返回的目标，所以直接就什么也不做了
            if(form.backOnCancel||form.backOnConfirm)FMPLogger.warn("当前只指定了会话的玩家而未指定需要返回到的会话，因此表单"+form.title+"将不会返回到任何会话")
            super(form,lastSessionOrPlayer)
        }
    }
    send():boolean{
        if(this.lastSession!=undefined){
            this.form.send(this);
            return true;
        }
        if(this.player!=undefined){
            this.form.send(this)
            return true;
        }
        FMPLogger.warn("表单发送失败，没有提供任何应该收到表单的玩家，因为无法从上级表单或传入参数指定发送者中的任何一个方式获取当前表单会话所属玩家")
        return false;
    }
}