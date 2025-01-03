import {Logger} from "../index.js"
import { FMPLogger } from "../Logger"
import { FMPInternalPermission,toll2PermType } from "./InternalPermission";
import { FMPPlayer } from "./Player";
import { earlyRegisteredCommands,pluginInited } from "../Events/Process.js";
export enum FMPCommandParamType{
    Optional=1,
    Mandatory
}
export enum FMPCommandParamDataType{
    Boolean=0,
    Int,
    Float,
    String,
    Actor,
    Player,
    IntLocation,
    FloatLocation,
    RawText,
    Message,
    JsonVale,
    Item,
    Block,
    Effect,
    Enum,
    SoftEnum,
    ActorType,
    Command
}
export function toll2ParamType(type:FMPCommandParamDataType):ParamType{
    switch(type){
        case FMPCommandParamDataType.Boolean:return ParamType.Bool
        case FMPCommandParamDataType.Int:return ParamType.Int
        case FMPCommandParamDataType.Float:return ParamType.Float
        case FMPCommandParamDataType.String:return ParamType.String
        case FMPCommandParamDataType.Actor:return ParamType.Actor
        case FMPCommandParamDataType.Player:return ParamType.Player
        case FMPCommandParamDataType.IntLocation:return ParamType.BlockPos
        case FMPCommandParamDataType.FloatLocation:return ParamType.Vec3
        case FMPCommandParamDataType.RawText:return ParamType.RawText
        case FMPCommandParamDataType.Message:return ParamType.Message
        case FMPCommandParamDataType.JsonVale:return ParamType.JsonValue
        case FMPCommandParamDataType.Item:return ParamType.Item
        case FMPCommandParamDataType.Block:return ParamType.Block
        case FMPCommandParamDataType.Effect:return ParamType.Effect
        case FMPCommandParamDataType.Enum:return ParamType.Enum
        case FMPCommandParamDataType.SoftEnum:return ParamType.SoftEnum
        case FMPCommandParamDataType.ActorType:return ParamType.ActorType
        case FMPCommandParamDataType.Command:return ParamType.Command
    }
}
export class FMPCommandEnum{
    name:string;
    values:Array<string>;
    constructor(name:string,values:Array<string>){
        this.name=name;
        this.values=values;
    }
}
export enum FMPCommandEnumOptions{
    Default=0,
    Unfold
}
export class FMPCommandParam{
    type:FMPCommandParamType;
    /** 参数名，会显示在命令提示中，同一命名中请勿重复 */
    name:string;
    dataType:FMPCommandParamDataType;
    bindEnum:FMPCommandEnum|undefined;
    enumOptions:FMPCommandEnumOptions;
    constructor(
        type:FMPCommandParamType,
        name:string,
        dataType:FMPCommandParamDataType,
        bindEnum:FMPCommandEnum|undefined=undefined,
        enumOptions:FMPCommandEnumOptions=FMPCommandEnumOptions.Default
    ){
        this.type=type;
        this.name=name;
        this.dataType=dataType;
        this.bindEnum=bindEnum;
        this.enumOptions=enumOptions;
    }
}
export enum FMPCommandExecutorType{
    Player=0,
    Entity,
    Console,
    CommandBlock,
    Unknown
}
export function toll2commandExecutorType(type:FMPCommandExecutorType){
    switch(type){
        case FMPCommandExecutorType.Player:
    }
}
export function fromll2commandExecutorType(type:number):FMPCommandExecutorType{
    switch(type){
        case 0:return FMPCommandExecutorType.Player;
        case 7:return FMPCommandExecutorType.Console;
        default:return FMPCommandExecutorType.Unknown;
    }
}
export class FMPCommandExecutor{
    /** 命令执行者原始对象，undefined代表未知 */
    object:any
    type:FMPCommandExecutorType
    constructor(object,type:FMPCommandExecutorType){
        this.object=object;
        this.type=type;
    }
}
export class FMPCommandResult{
    executor:FMPCommandExecutor
    params:Map<string,{param:FMPCommandParam,value:any}>
    constructor(executor:FMPCommandExecutor,params:Map<string,{param:FMPCommandParam,value:any}>){
        this.executor=executor
        this.params=params
    }
}

/**命令执行失败的原因 */
export enum FMPCommandFailReason{
    Success,
    UnknownCommand,
    WrongTypeOfArgument,
    NoTargetMatchedSelector,
    InternalServerError
}
export function FMPCommandFailReasonText(reason:FMPCommandFailReason):string{
    switch(reason){
        case FMPCommandFailReason.Success:return "成功"
        case FMPCommandFailReason.UnknownCommand:return "未知命令"
        case FMPCommandFailReason.WrongTypeOfArgument:return "参数输入有误"
        case FMPCommandFailReason.NoTargetMatchedSelector:return "没有与目标选择器匹配的目标"
        default:
        case FMPCommandFailReason.InternalServerError:return "执行命令时插件因自身错误而无法执行"
    }
}
export abstract class FMPCommand{
    name:string;
    description:string|undefined;
    usageMessage:string|undefined;
    args:Map<string,FMPCommandParam>=new Map();
    overloads:Array<Array<string>>;
    permission:FMPInternalPermission;
    aliases:Array<string>;
    flag:any;
    /**
     * 
     * @param name 命令名称，是要在控制台输入的那个，比如tp，say
     * @param description 命令描述，一般可以通过/help命令显示出来
     * @param usageMessage 如果指令格式有误，游戏会向玩家发送这个消息
     * @param args 所有要用到的命令的参数，有几个就写几个，没有顺序之分，具体如何排列要取决于重载
     * @param overloads 命令的重载，把你的命令参数用数组排列，每个数组是命令的一种用法
     * @param permission 执行命令需要的权限
     * @param aliases 对于LLSE，由于只支持一个别名，所以仅有数组最后一个元素会作为该唯一的别名。
     * @param flag 
     */
    constructor(
        name:string,
        description:string|undefined=undefined,
        usageMessage:string|undefined=undefined,
        args:Array<FMPCommandParam>=[],
        overloads:Array<Array<string>>=[[]],
        permission:FMPInternalPermission=FMPInternalPermission.GameMasters,
        aliases:Array<string>=[],
        flag:any=undefined
    ){
        this.name=name;
        this.description=description;
        this.usageMessage=usageMessage;
        for(let param of args)this.args.set(param.name,param)
        this.overloads=overloads;
        this.permission=permission;
        this.aliases=aliases;
        this.flag=flag;
    }
    abstract callback(result:FMPCommandResult):void
    static register<T extends FMPCommand>(command:T):boolean{
        //先前lse出现过必须在开服后注册命令的情况，此处假设此特性仍然存在，将所有指令注册放在开服后统一注册，以验证满月平台在其他不修改该特性的平台上的可行性
        //具体方案：如果InitEvent前(pluginInited==false)注册，就把指令放入指令列表，在触发InitEvent之后立即挨个注册这些指令
        if(!pluginInited){
            //将指令放入队列
            earlyRegisteredCommands.push(command);
            //不知道该指令会不会注册成功，那就先返回true吧，怕插件那边检测到false之后自己寄了
            return true;
        }
        //正常注册指令的部分，如果InitEvent尚未被触发会被跳过
        FMPLogger.info("指令注册：开始注册")
        FMPLogger.info("指令注册：使用llse API")
        //转换flag的值
        let flag:any=command.flag;
        if(command.flag===undefined)flag=0x80;
        //转换description（LLSE禁止为空）
        let description=command.description;
        if(description===undefined)description=" ";
        //console.log(command.name,description,toll2PermType(command.permission),flag)
        let ll2cmd=mc.newCommand(command.name,description,toll2PermType(command.permission),flag);
        FMPLogger.info("指令注册：注册别名")
        for(let alias of command.aliases)ll2cmd.setAlias(alias);
        FMPLogger.info("指令注册：添加参数")
        /** 由于llse的命令参数枚举用名字区分，此处就用一个编号转换成字符串作为名字供llse区分 */
        for(let arg of command.args){
            if(arg[1].bindEnum!==undefined){
                ll2cmd.setEnum(arg[1].bindEnum.name,arg[1].bindEnum.values)
            }
            switch(arg[1].type){
                case FMPCommandParamType.Mandatory:
                    arg[1].bindEnum===undefined?
                        ll2cmd.mandatory(
                            arg[0],
                            toll2ParamType(arg[1].dataType),
                        )
                        :
                        ll2cmd.mandatory(
                            arg[0],
                            toll2ParamType(arg[1].dataType),
                            arg[1].bindEnum.name,
                            arg[1].bindEnum.name,     
                            arg[1].enumOptions
                        )
                    break;
                case FMPCommandParamType.Optional:
                    arg[1].bindEnum===undefined?
                        ll2cmd.optional(
                            arg[0],
                            toll2ParamType(arg[1].dataType),
                        )
                        :
                        ll2cmd.optional(
                            arg[0],
                            toll2ParamType(arg[1].dataType),
                            arg[1].bindEnum.name,
                            arg[1].bindEnum.name,     
                            arg[1].enumOptions
                        )
                    break;
            }
        }
        FMPLogger.info("指令注册：设置回调");
        ll2cmd.setCallback((cmd,ll2origin,output,ll2results)=>{
            const executor_type=fromll2commandExecutorType(ll2origin.type)
            let origin:any
            switch(executor_type){
                case FMPCommandExecutorType.Player:
                    if(ll2origin.player===undefined)break;
                    origin=new FMPPlayer(ll2origin.player);break;
                case FMPCommandExecutorType.Console:origin=undefined;break;
            }
            const ParamsResult:Map<string,{param:FMPCommandParam,value:any}>=new Map()
            for(let paramString of Object.keys(ll2results)){
                const param=command.args.get(paramString);
                if(param==undefined)throw new Error("无法读取参数"+paramString)
                ParamsResult.set(paramString,{
                    param,
                    value:ll2results[paramString]
                })
            }
            const result=new FMPCommandResult(new FMPCommandExecutor(origin,executor_type),ParamsResult);
            command.callback(result)
        })
        FMPLogger.info("指令注册：设置重载")
        //overload
        for(let overload of command.overloads){
            ll2cmd.overload(overload)
        }
        //如果重载列表是空的，证明传入参数格式错误，因为正常应该至少传一个[[]]，这种情况就给他重载一个空的防止出问题
        if(command.overloads.length<=0){
            ll2cmd.overload([])
            Logger.warn("重载参数没有传入任何参数列表！将默认重载一个空的参数列表。")
            Logger.warn("要解决这条提示，请阅读LNSDK和LLSE的开发文档，传入格式正确的参数列表。")
            Logger.warn("或者如果您本就不想在该命令中使用任何参数，请传入“[[]]”而不是“[]”。")
        }
        FMPLogger.info("指令注册：执行注册")
        return ll2cmd.setup();
    }
}

//创建命令池
class fillerCommand extends FMPCommand{
    constructor(){
        super("fillerCommand");
    }
    callback(result: FMPCommandResult): void {
        
    }
}
export const CommandList=(<T extends FMPCommand>(typeLimiter:Map<string,T>):Map<string,T>=>{return typeLimiter})(new Map([["fillerCommand",new fillerCommand()]]))
CommandList.delete("fillerCommand");

export function FMPruncmd(cmd:string):{success:boolean,output:string}{
    return mc.runcmdEx(cmd)
}