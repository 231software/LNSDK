import { FMPInternalPermission } from "./InternalPermission";
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
export class FMPCommandExecutor{
    /** 命令执行者原始对象 */
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
        this.name=name;
        this.description=description;
        this.usageMessage=usageMessage;
        this.args=args;
        this.overloads=overloads;
        this.permission=permission;
        this.aliases=aliases;
        this.flag=flag;
    }
    abstract callback(result:FMPCommandResult):void
    /**
     * 注册命令
     * @param command 要注册的命令对象，建议现场new一个传进去
     * @returns 命令是否注册成功
     */
    static register<T extends FMPCommand>(command:T):boolean{
        return false;
    }
}