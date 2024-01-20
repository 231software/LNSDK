import { LNLogger } from "../LNSDKT";
import { LNPlatform, LNSupportedPlatforms } from "../Platform";
import { LNInternalPermission,toll2PermType } from "./InternalPermission";
import { LNPlayer } from "./Player";
export enum LNCommandParamType{
    Optional=1,
    Mandatory
}
export enum LNCommandParamDataType{
    Boolean=0,
    Int,
    Float,
    String,
    Actor,
    Player,
    IntPos,
    FloatPos,
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
export function toll2ParamType(type:LNCommandParamDataType):ParamType{
    switch(type){
        case LNCommandParamDataType.Boolean:return ParamType.Bool
        case LNCommandParamDataType.Int:return ParamType.Int
        case LNCommandParamDataType.Float:return ParamType.Float
        case LNCommandParamDataType.String:return ParamType.String
        case LNCommandParamDataType.Actor:return ParamType.Actor
        case LNCommandParamDataType.Player:return ParamType.Player
        case LNCommandParamDataType.IntPos:return ParamType.BlockPos
        case LNCommandParamDataType.FloatPos:return ParamType.Vec3
        case LNCommandParamDataType.RawText:return ParamType.RawText
        case LNCommandParamDataType.Message:return ParamType.Message
        case LNCommandParamDataType.JsonVale:return ParamType.JsonValue
        case LNCommandParamDataType.Item:return ParamType.Item
        case LNCommandParamDataType.Block:return ParamType.Block
        case LNCommandParamDataType.Effect:return ParamType.Effect
        case LNCommandParamDataType.Enum:return ParamType.Enum
        case LNCommandParamDataType.SoftEnum:return ParamType.SoftEnum
        case LNCommandParamDataType.ActorType:return ParamType.ActorType
        case LNCommandParamDataType.Command:return ParamType.Command
    }
}
export class LNCommandEnum{
    name:string;
    values:Array<string>;
    constructor(name:string,values:Array<string>){
        this.name=name;
        this.values=values;
    }
}
export enum LNCommandEnumOptions{
    Default=0,
    Unfold
}
export function toll2enumOptions(option:LNCommandEnumOptions):number{
    switch(option){
        case LNCommandEnumOptions.Default:return 0
        case LNCommandEnumOptions.Unfold:return 1
    }
}
export class LNCommandParam{
    type:LNCommandParamType;
    /** 参数名，会显示在命令提示中，同一命名中请勿重复 */
    name:string;
    dataType:LNCommandParamDataType;
    bindEnum:LNCommandEnum|undefined;
    enumOptions:LNCommandEnumOptions;
    constructor(
        type:LNCommandParamType,
        name:string,
        dataType:LNCommandParamDataType,
        bindEnum:LNCommandEnum=undefined,
        enumOptions:LNCommandEnumOptions=LNCommandEnumOptions.Default
    ){
        this.type=type,
        this.name=name,
        this.dataType=dataType,
        this.bindEnum=bindEnum,
        this.enumOptions=enumOptions
    }
}
export enum LNCommandExecutorType{
    Player=0,
    Entity,
    Console,
    CommandBlock,
    Unknown
}
export function toll2commandExecutorType(type:LNCommandExecutorType){
    switch(type){
        case LNCommandExecutorType.Player:
    }
}
export function fromll2commandExecutorType(type:number):LNCommandExecutorType{
    switch(type){
        case 0:return LNCommandExecutorType.Player;
        case 7:return LNCommandExecutorType.Console;
        default:return LNCommandExecutorType.Unknown;
    }
}
export class LNCommandExecutor{
    /** 命令执行者原始对象 */
    object:any
    type:LNCommandExecutorType
    constructor(object,type:LNCommandExecutorType){
        this.object=object;
        this.type=type;
    }
}
export class LNCommandResult{
    executor:LNCommandExecutor
    params:any
    constructor(executor:LNCommandExecutor,params:any){
        this.executor=executor
        this.params=params
    }
}
export abstract class LNCommand{
    name:string;
    description:string|undefined;
    usageMessage:string|undefined;
    args:Array<LNCommandParam>;
    overloads:Array<Array<string>>;
    permission:LNInternalPermission;
    aliases:Array<string>;
    flag:any;
    /**
     * 
     * @param name 
     * @param description 
     * @param usageMessage 
     * @param args 
     * @param overloads 
     * @param permission 
     * @param aliases 对于LLSE，由于只支持一个别名，所以仅有数组最后一个元素会作为该唯一的别名。
     * @param flag 
     */
    constructor(
        name:string,
        description:string|undefined=undefined,
        usageMessage:string|undefined=undefined,
        args:Array<LNCommandParam>=[],
        overloads:Array<Array<string>>=[[]],
        permission:LNInternalPermission=LNInternalPermission.GameMasters,
        aliases:Array<string>=[],
        flag:any=undefined
    ){
        this.name=name;
        this.description=description;
        this.usageMessage=usageMessage;
        this.args=args;
        this.overloads=overloads;
        this.permission=permission;
        this.aliases=aliases;
        this.flag=flag
    }
    abstract callback(result:LNCommandResult):void
    static register(command:LNCommand):boolean{
        LNLogger.info("指令注册：开始注册")
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.NodeJS:return false;
            case LNSupportedPlatforms.LiteLoaderBDS:
                LNLogger.info("指令注册：使用llse API")
                //转换flag的值
                let flag:any=command.flag;
                if(command.flag===undefined)flag=0x80;
                //转换description（LLSE禁止为空）
                let description=command.description;
                if(description===undefined)description=" ";
                let ll2cmd=mc.newCommand(command.name,description,toll2PermType(command.permission),flag);
                LNLogger.info("指令注册：注册别名")
                for(let alias of command.aliases)ll2cmd.setAlias(alias);
                LNLogger.info("指令注册：添加参数")
                /** 由于llse的命令参数枚举用名字区分，此处就用一个编号转换成字符串作为名字供llse区分 */
                for(let argid in command.args){
                    if(command.args[argid].bindEnum!==undefined){
                        ll2cmd.setEnum(argid.toString(),command.args[argid].bindEnum.values)
                    }
                    switch(command.args[argid].type){
                        case LNCommandParamType.Mandatory:
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
                        case LNCommandParamType.Optional:
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
                LNLogger.info("指令注册：设置回调");
                ll2cmd.setCallback((cmd,ll2origin,output,ll2results)=>{
                    let executor_type=fromll2commandExecutorType(ll2origin.type)
                    let origin:any
                    switch(executor_type){
                        case LNCommandExecutorType.Player:origin=new LNPlayer(ll2origin.player);break;
                        case LNCommandExecutorType.Console:origin=undefined;break;
                    }
                    let result:LNCommandResult=new LNCommandResult(new LNCommandExecutor(origin,executor_type),ll2results);
                    command.callback(result)
                })
                LNLogger.info("指令注册：设置重载")
                //overload
                for(let overload of command.overloads){
                    ll2cmd.overload(overload)
                }
                LNLogger.info("指令注册：执行注册")
                return ll2cmd.setup()
        }
    }
}