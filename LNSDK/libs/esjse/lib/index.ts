/// <reference path="dts/index.d.ts"/>
export  {FMPLogger as Logger} from "./Logger.js";
export {FMPInitEvent as InitEvent,FMPDisableEvent as DisableEvent} from "./Events/Process.js"

export {
    FMPCommand as Command,
    FMPCommandEnum as CommandEnum,
    FMPCommandEnumOptions as CommandEnumOptions,
    FMPCommandExecutor as CommandExecutor,
    FMPCommandExecutorType as CommandExecutorType,
    FMPCommandParam as CommandParam,
    FMPCommandParamDataType as CommandParamDataType,
    FMPCommandParamType as CommandParamType,
    FMPCommandResult as CommandResult,
    FMPruncmd as runcmd
} from "./Game/Command.js"
export {ScriptDone} from "./Events/Process.js"