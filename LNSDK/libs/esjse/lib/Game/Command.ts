import {Logger} from "../index.js"
import { FMPLogger } from "../Logger"
import { FMPInternalPermission} from "./InternalPermission";
//import { FMPPlayer } from "./Player";
import {INFO} from "../plugin_info.js"
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
export function toESJSEParamStr(type:FMPCommandParamDataType):string{
    switch(type){
        case FMPCommandParamDataType.Boolean:return "bool"
        case FMPCommandParamDataType.Int:return "int"
        case FMPCommandParamDataType.Float:return "float"
        case FMPCommandParamDataType.String:return "str"
        case FMPCommandParamDataType.Actor:return "target"
        case FMPCommandParamDataType.Player:return "player"
        case FMPCommandParamDataType.IntLocation:return "block_pos"
        case FMPCommandParamDataType.FloatLocation:return "pos"
        // case FMPCommandParamDataType.RawText:return "json"
        case FMPCommandParamDataType.Message:return "message"
        case FMPCommandParamDataType.JsonVale:return "json"
        // case FMPCommandParamDataType.Item:return ParamType.Item
        case FMPCommandParamDataType.Block:return "block"
        // case FMPCommandParamDataType.Effect:return ParamType.Effect
        case FMPCommandParamDataType.Enum:return "EnumType"
        // case FMPCommandParamDataType.SoftEnum:return ParamType.SoftEnum
        // case FMPCommandParamDataType.ActorType:return ParamType.ActorType
        // case FMPCommandParamDataType.Command:return ParamType.Command
        // case ? :return "block_status"
        default:throw new Error("不支持的参数类型!")
    }
}
/**
 * 将命令参数转换成es的usage格式。只会转换从参数开始的部分。
 * @param args 命令参数元数据
 */
export function toESJSEUsage(commandName:string,args:Map<string,FMPCommandParam>,overloads:string[][]):string[]{
    const usages:string[]=[]
    for(let overload of overloads){
        let usage=""
        for(let paramName of overload){
            //参数名
            let paramStr=paramName
            //从参数中找到参数对应的元数据
            const paramInfo=args.get(paramName)
            if(paramInfo==undefined)throw new Error("注册命令时无法从参数中找到"+paramName+"参数，但是它存在于重载当中")
            //参数类型
            paramStr=paramStr+": "+toESJSEParamStr(paramInfo.dataType)
            //是否必选
            switch(paramInfo.type){
                case FMPCommandParamType.Mandatory:{
                    paramStr="<"+paramStr+">";
                    break;
                }
                case FMPCommandParamType.Optional:{
                    paramStr="["+paramStr+"]";
                    break;
                }
            }
            usage=usage+paramStr+" "
        }  
        //后面会多出一个空格，去掉
        usage=usage.slice(0,-1)
        usage="/"+commandName+" "+usage
        usages.push(usage)      
    }
    return usages;
}
function paramExtractor(command:string):string[]{
    const params=command.split(" ")
    const newParams:string[]=[]
    for(let param of params){
        newParams.push(param);
    }
    return newParams
}
function paramTypeAnalyzer(param:string):FMPCommandParamDataType{
    if(new RegExp(/^[0-9]+$/).test(param))return FMPCommandParamDataType.Int;
    if(new RegExp(/^[0-9]+\.[0-9]+$/).test(param))return FMPCommandParamDataType.Float;
    if(param=="true"||param=="false")return FMPCommandParamDataType.Boolean;
    return FMPCommandParamDataType.String;
}
function paramParser(param:string):any{
    const type=paramTypeAnalyzer(param);
    switch(type){
        case FMPCommandParamDataType.Int:
        case FMPCommandParamDataType.Float:return Number(param);
        case FMPCommandParamDataType.Boolean:return Boolean(param)
        default:return param;
    }
}
// 匹配并执行命令的重载
function findAndExecuteOverload(command: FMPCommand, paramsString: string[],executor:FMPCommandExecutor): FMPCommandFailReason {
    const params: Map<string, { param: FMPCommandParam; value: any; }>=new Map()
    //遍历命令中所有的重载
    for (let overload of command.overloads) {
        //寻找与当前命令参数列表完全匹配的重载
        if (isMatchingOverload(overload, paramsString, command)) {
            // 构建参数并执行回调
            buildParams(overload, paramsString, command, params);
            command.callback(new FMPCommandResult(executor, params));
            return FMPCommandFailReason.Success;
        }
    }
    return FMPCommandFailReason.WrongTypeOfArgument;
}

// 判断当前重载是否匹配输入的参数
function isMatchingOverload(overload: string[], paramsString: string[], command: FMPCommand): boolean {
    //如果参数长度不符，就已经可以证明不匹配
    if (overload.length !== paramsString.length) return false;
    //遍历当前重载中的每一个参数
    for (let i in overload) {
        /**当前参数在重载中的类型 */
        const expectedType = command.args.get(overload[i])?.dataType;
        /**当前参数在用户输入中的类型 */
        const actualType = paramTypeAnalyzer(paramsString[i]);
        //判断类型是否互相兼容，由于vmce的行为十分抽象，所以很多原版游戏中不同的参数类型在这里都可以勉强兼容
        if (!isCompatibleType(expectedType, actualType)) {
            return false;
        }
    }
    //如果找到了类型不匹配的参数，上文的for将返回false跳过此处，如果来到此处，证明通过了所有检验参数类型的考验，证明完全符合重载
    return true;
}
/** 
 * 判断参数类型是否兼容，使用模糊映射
 * 为了按照建议优化 `isCompatibleType` 函数，可以引入 "模糊映射" 的概念，即将一些类型分组为相似的类型，进行宽松的匹配。我们可以定义几个数组，每个数组内的类型表示可以互相兼容的类型。  
 * 如果输入的 `expectedType` 和 `actualType` 都在同一个数组中，就认为它们兼容。这样可以简化类型判断逻辑。

### 优化后的工作流程：
1. **模糊映射**：我们将相似的类型（如字符串、枚举类型）分组，这样可以宽松地判断它们是否兼容。
- `stringTypes`: 包含 `String` 和 `Enum` 类型，允许这两者互相兼容。
- `numericTypes`: 包含 `Int` 和 `Float` 类型，允许这两者互相兼容。
- `booleanTypes`: 单独处理 `Boolean` 类型。
2. **组内兼容**：使用 `typeGroups` 数组存储所有的类型组，遍历这些组来判断 `expectedType` 和 `actualType` 是否属于同一组。
3. **简化条件判断**：通过在数组中查找类型，可以减少条件判断的复杂性，使代码更易维护和扩展。

这使得类型兼容的判断逻辑更简洁，且更容易扩展，只需在数组中添加新的类型或组即可。
    */
function isCompatibleType(expectedType: FMPCommandParamDataType | undefined, actualType: FMPCommandParamDataType): boolean {
    if (!expectedType) return false;
    
    // 创建映射数组
    const typeGroups = [
        [FMPCommandParamDataType.String, FMPCommandParamDataType.Enum],
        [FMPCommandParamDataType.Int, FMPCommandParamDataType.Float],
        [FMPCommandParamDataType.Boolean]
    ];

    // 判断 expectedType 和 actualType 是否在同一组内
    for (const group of typeGroups) {
        if (group.includes(expectedType) && group.includes(actualType)) {
            return true;
        }
    }

    return false;
}


// 构建参数 Map，用于传给命令回调
function buildParams(overload: string[], paramsString: string[], command: FMPCommand, params: Map<string, { param: FMPCommandParam; value: any; }>) {
    for (let i in paramsString) {
        const paramName = overload[i];
        const param = command.args.get(paramName);
        if (param) {
            params.set(paramName, { param, value: paramParser(paramsString[i]) });
        } else {
            FMPLogger.error("无法读取参数" + paramName);
        }
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
        /**权限节点，由于满月平台尚未支持，所以此处直接常量 */
        const permissionRoot=INFO.permissionRoot;
        FMPLogger.info("指令注册：开始注册")
        FMPLogger.info("指令注册：使用esjse API")
        // 转换flag的值
        // let flag:any=command.flag;
        // if(command.flag===undefined)flag=0x80;
        //转换description（禁止为空）
        let description=command.description;
        if(description===undefined)description=" ";
        //console.log(command.name,description,toll2PermType(command.permission),flag)
        //设置别名还没做
        //需要支持最基本的权限，管理员权限，普通玩家权限
        const esCmdPermission={
            description:"Currently Full Moon Platform does not support permission system. This is a permission automatically generated by Full Moon Platform.",
            default: Enums.PermissionDefault.True,
        }
        FMPLogger.info("指令注册：添加参数和重载")
        const esCmdData={
            description,
            permissions:[permissionRoot+".command"],
            //此处加入重载逻辑，一个重载对应一个字符串
            usages:toESJSEUsage(command.name,command.args,command.overloads)
        }

        commandList.set(command.name,{
            esCmdData,
            esCmdPermission,
            callback:(sender:CommandSender,args:string[])=>{
                //目前不支持直接获取命令执行者的详尽信息
                let executor=new FMPCommandExecutor({name:sender.getName(),tell:sender.sendMessage},FMPCommandExecutorType.Unknown)
                /*const params:Map<string, {
                    param: FMPCommandParam;
                    value: any;
                }>=new Map()*/
                findAndExecuteOverload(command,args,executor)
            }
        })
        //由于llse的命令参数枚举用名字区分，此处就用一个编号转换成字符串作为名字供llse区分 
        //for(let arg of command.args){
            /*
            if(arg[1].bindEnum!==undefined){
                ll2cmd.setEnum(arg[1].bindEnum.name,arg[1].bindEnum.values)
            }
            */
           /*
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
            }*/
        //}
        /*
        FMPLogger.info("指令注册：注册别名")
        for(let alias of command.aliases)ll2cmd.setAlias(alias);
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
        */
       return true
    }
}

export const commandList:Map<string,{
    esCmdPermission:any,
    esCmdData:any,
    callback:(sender:CommandSender,args:string[])=>void
}>=new Map()

/*
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
*/



export function FMPruncmd(cmd:string):{success:boolean,output:string}{
    return {success:false,output:"暂不支持执行命令"}//mc.runcmdEx(cmd)
}