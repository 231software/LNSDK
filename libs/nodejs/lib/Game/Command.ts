import {FMPLogger } from "../Logger";
import { FMPInternalPermission } from "./InternalPermission";
import * as readline from "readline";
export const onStopContainer={onStop:()=>{}}
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
export class FMPCommand{
    
    name:string;
    description:string|undefined;
    usageMessage:string|undefined;
    args:Map<string,FMPCommandParam>=new Map();
    overloads:Array<Array<string>>;
    permission:FMPInternalPermission;
    aliases:Array<string>;
    flag:any;
    callback:(result:FMPCommandResult)=>void
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
        args:Array<FMPCommandParam>,
        overloads:Array<Array<string>>,
        callback:(result:FMPCommandResult)=>void,
        permission:FMPInternalPermission=FMPInternalPermission.GameMasters,
        aliases:Array<string>=[],
        description:string|undefined=undefined,
        usageMessage:string|undefined=undefined,
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
        this.callback=callback
        CommandList.set(name,this);
    }
    static register<T extends FMPCommand>(command:T):boolean{
        return true;
    }
}

//创建命令池
let stop=false;
export const CommandList:Map<string,FMPCommand>=new Map();
const fillerCommand = new FMPCommand("fillerCommand",[],[[]],result=>{})
//(<T extends FMPCommand>(typeLimiter:Map<string,T>):Map<string,T>=>{return typeLimiter})(new Map([["fillerCommand",fillerCommand]]))

CommandList.delete("fillerCommand");

/**
 * 负责模拟所有从控制台接收到的命令的行为
 */
export async function commandReactor(){
    // 创建接口实例
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    function readlineCycle() {
        // 提示用户输入
        rl.question('', (answer) => {
            // 判断是否为退出命令，退出命令优先级高于一切，所以直接放到最外面单独处理
            if (handleStopCommand(answer)) return;
    
            // 提取命令名和参数
            const paramsString = paramExtractor(answer);
            const commandName = paramsString.shift();
            const params: Map<string, { param: FMPCommandParam; value: any; }> = new Map();
    
            // 查找并执行命令
            const commandResult:FMPCommandFailReason = executeCommand(commandName, paramsString, params);
    
            if (commandResult!=FMPCommandFailReason.Success) {
                FMPLogger.error(FMPCommandFailReasonText(commandResult));
            }
    
            // 继续下一轮输入处理
            readlineCycle();
        });
    }

    readlineCycle();//开始命令输入循环
    
    // 处理退出命令
    function handleStopCommand(answer: string): boolean {
        if (answer === "stop") {
            //标记停服标志，以便后续停止
            stop = true;
            //执行关服触发
            onStopContainer.onStop()
            //关闭命令行的输入流
            rl.close();
            return true;  // 提前返回，避免继续处理
        }
        return false;
    }
    
    // 执行命令的核心逻辑
    function executeCommand(commandName: string | undefined, paramsString: string[], params: Map<string, { param: FMPCommandParam; value: any; }>): FMPCommandFailReason {
        //在整个原始命令列表（命令名称+参数列表）为空时，由于没有提供任何命令名称所以为异常情况，此处将是undefined类型，返回false表示执行失败
        if (!commandName) return FMPCommandFailReason.UnknownCommand;
    
        //从命令池中遍历
        for (let [name, command] of CommandList) {
            //寻找与当前命令名称完全匹配的一条命令
            if (commandName === name) {
                //找到匹配的命令后，开始用用户输入的参数中寻找合适的匹配。找不到或执行失败时此处返回值为false，如果执行成功证明整个命令都成功执行，返回true顺便跳过下面的返回false
                if (findAndExecuteOverload(command, paramsString, params)==FMPCommandFailReason.Success) {
                    return FMPCommandFailReason.Success
                }else{
                    return FMPCommandFailReason.WrongTypeOfArgument
                }
            }
        }
        //如果上文已经找到了那条命令，则会直接return，不会经过此处。既然经过此处，证明一定没有找到命令，则证明执行失败
        return FMPCommandFailReason.UnknownCommand;
    }
    
    // 匹配并执行命令的重载
    function findAndExecuteOverload(command: FMPCommand, paramsString: string[], params: Map<string, { param: FMPCommandParam; value: any; }>): FMPCommandFailReason {
        //遍历命令中所有的重载
        for (let overload of command.overloads) {
            //寻找与当前命令参数列表完全匹配的重载
            if (isMatchingOverload(overload, paramsString, command)) {
                // 构建参数并执行回调
                buildParams(overload, paramsString, command, params);
                command.callback(new FMPCommandResult(new FMPCommandExecutor(undefined, FMPCommandExecutorType.Console), params));
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
            if (!isCompatibleType(expectedType, actualType)) return false;
            //上文已经判断过是否兼容，此处已经是兼容的，所以直接取用重载中的类型——expectedType
            //处理枚举
            if(expectedType==FMPCommandParamDataType.Enum){   
                //检查是否是当前枚举参数中可选的值        
                if(!command.args.get(overload[i])?.bindEnum?.values?.includes(paramsString[i])){
                    //不是的话证明不符合当前重载
                    return false
                }
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

    /*
    function readlineCycle(){
        // 提示用户输入
        rl.question('', (answer) => {
        //stop命令退出程序
        if(answer=="stop"){
            stop=true;
            rl.close();
            return;
        }
        const paramsString=paramExtractor(answer)
        const commandName=paramsString.shift();
        const params:Map<string,{param: FMPCommandParam;value: any;}>=new Map();
        //下面是处理answer的代码
        let commandFound=false;
        for(let command of CommandList){
            if(commandName==command[0]){//从已注册的命令中找到了当前命令
                for(let overload of command[1].overloads){//找到符合当前参数格式的重载
                    FMPLogger.info("输入的参数长度:",paramsString.length)
                    FMPLogger.info("当前重载的参数长度:",overload.length)
                    FMPLogger.info("当前重载为",overload)
                    if(overload.length!=paramsString.length)continue;//如果当前参数数量不符就不是这个重载，但是后面考虑message类型的时候必须在后面加上直到最后都找不到任何匹配的重载的时候，把最后一些参数当成message类型再重新判断
                    let overloadTypeMatches=true;
                    for(let overloadParamIndex in overload){//遍历当前重载的所有参数的类型，将其与当前命令指定位置的参数判断出的类型进行对比，如果发现有不匹配的就证明不是当前重载
                        FMPLogger.info("正在比对"+overloadParamIndex+"位的参数类型 ",command[1].args.get(overload[overloadParamIndex])?.dataType,paramTypeAnalyzer(paramsString[overloadParamIndex]))
                        // if(command[1].args.get(overload[overloadParamIndex])?.dataType!=paramTypeAnalyzer(paramsString[overloadParamIndex])){
                        //     overloadTypeMatches=false;
                        //     break;
                        // }
                        switch(command[1].args.get(overload[overloadParamIndex])?.dataType){
                            case FMPCommandParamDataType.String:
                            case FMPCommandParamDataType.Enum:{
                                switch(paramTypeAnalyzer(paramsString[overloadParamIndex])){
                                    case FMPCommandParamDataType.String:
                                    case FMPCommandParamDataType.Enum:break;
                                    default:overloadTypeMatches=false;
                                }
                                break;
                            }
                            case FMPCommandParamDataType.Int:
                            case FMPCommandParamDataType.Float:
                                switch(paramTypeAnalyzer(paramsString[overloadParamIndex])){
                                    case FMPCommandParamDataType.Int:
                                    case FMPCommandParamDataType.Float:break;
                                    default:overloadTypeMatches=false;
                                }
                                break;
                            default:overloadTypeMatches=false;
                        }
                    }
                    if(!overloadTypeMatches)continue;
                    FMPLogger.info("已找到匹配重载")
                    for(let paramIndex in paramsString){//依次处理参数并构建params以传给回调
                        FMPLogger.info(overload[paramIndex])
                        const param=command[1].args.get(overload[paramIndex]);
                        if(param==undefined){
                            FMPLogger.error("无法读取参数"+overload[paramIndex])
                            continue;
                        }
                        params.set(overload[paramIndex],{
                            param,
                            value:paramParser(paramsString[paramIndex])
                        })
                    }
                    //既然已经找到了匹配的重载，就直接跳出循环
                    break;
                }
                command[1].callback(new FMPCommandResult(new FMPCommandExecutor(undefined,FMPCommandExecutorType.Console),params));
                commandFound=true;
                break;
            }
        }
        if(!commandFound)FMPLogger.error("未知命令："+commandName)
        
        //进行下一轮，如果退出上面的stop会跳过这里
        readlineCycle();
        });
    }readlineCycle();
    */


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
}
export function FMPruncmd(cmd:string){
    return {
        success:false,
        output:"nodejs平台暂不支持执行特定命令"
    }
}