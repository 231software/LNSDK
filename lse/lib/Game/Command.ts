import { FMPLogger } from "../Logger"
import { FMPInternalPermission,toll2PermType } from "./InternalPermission";
import { FMPPlayer } from "./Player";
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
    params:any
    constructor(executor:FMPCommandExecutor,params:any){
        this.executor=executor
        this.params=params
    }
}
export abstract class FMPCommand{
    name:string;
    description:string|undefined;
    usageMessage:string|undefined;
    args:Array<FMPCommandParam>;
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
    }
    abstract callback(result:FMPCommandResult):void
    static register<T extends FMPCommand>(command:T):boolean{
        FMPLogger.info("指令注册：开始注册")
        FMPLogger.info("指令注册：使用llse API")
        //转换flag的值
        let flag:any=command.flag;
        if(command.flag===undefined)flag=0x80;
        //转换description（LLSE禁止为空）
        let description=command.description;
        if(description===undefined)description=" ";
        let ll2cmd=mc.newCommand(command.name,description,toll2PermType(command.permission),flag);
        FMPLogger.info("指令注册：注册别名")
        for(let alias of command.aliases)ll2cmd.setAlias(alias);
        FMPLogger.info("指令注册：添加参数")
        /** 由于llse的命令参数枚举用名字区分，此处就用一个编号转换成字符串作为名字供llse区分 */
        for(let argid in command.args){
            if(command.args[argid].bindEnum!==undefined){
                ll2cmd.setEnum(argid.toString(),command.args[argid].bindEnum.values)
            }
            switch(command.args[argid].type){
                case FMPCommandParamType.Mandatory:
                    command.args[argid].bindEnum===undefined?
                        ll2cmd.optional(
                            command.args[argid].name,
                            toll2ParamType(command.args[argid].dataType),
                        )
                        :
                        ll2cmd.optional(
                            command.args[argid].name,
                            toll2ParamType(command.args[argid].dataType),
                            argid.toString(),
                            argid.toString(),     
                            command.args[argid].enumOptions
                        )
                    break;
                case FMPCommandParamType.Optional:
                    command.args[argid].bindEnum===undefined?
                        ll2cmd.optional(
                            command.args[argid].name,
                            toll2ParamType(command.args[argid].dataType),
                        )
                        :
                        ll2cmd.optional(
                            command.args[argid].name,
                            toll2ParamType(command.args[argid].dataType),
                            argid.toString(),
                            argid.toString(),     
                            command.args[argid].enumOptions
                        )
                    break;
            }
        }
        FMPLogger.info("指令注册：设置回调");
        ll2cmd.setCallback((cmd,ll2origin,output,ll2results)=>{
            let executor_type=fromll2commandExecutorType(ll2origin.type)
            let origin:any
            switch(executor_type){
                case FMPCommandExecutorType.Player:
                    if(ll2origin.player===undefined)break;
                    origin=new FMPPlayer(ll2origin.player);break;
                case FMPCommandExecutorType.Console:origin=undefined;break;
            }
            let result:FMPCommandResult=new FMPCommandResult(new FMPCommandExecutor(origin,executor_type),ll2results);
            command.callback(result)
        })
        FMPLogger.info("指令注册：设置重载")
        //overload
        for(let overload of command.overloads){
            ll2cmd.overload(overload)
        }
        FMPLogger.info("指令注册：执行注册")
        return ll2cmd.setup();
    }
}