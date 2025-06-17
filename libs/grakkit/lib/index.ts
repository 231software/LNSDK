
//grakkit import >>
import {} from "@grakkit/stdlib-paper"
// import {} from "@grakkit/types-paper"
//编译的时候会出问题，所以编译脚本会在编译时去除这一段
//grakkit import <<
export  {FMPLogger as Logger} from "./Logger.js";
export {
    FMPFile as File,
    FMPDirectory as Directory,
    JsonFile
} from "./File.js"

core
// export { FMPPlayer as Player,FMPGameMode as GameMode} from "./Game/Player.js";
// export { FMPEntity as Entity,FMPDamageCause as DamageCause} from "./Game/Entity.js"; 
// export {
//     FMPItem as Item,
//     FMPToolItem
// } from "./Game/Item.js"
// export {
//     FMPContainer as Container,
//     FMPInventory as Inventory
// } from "./Game/Container.js"
// export {
//     FMPNBTCompound as NBTCompound,
//     FMPNBTBasicType as NBTBasicType,
//     FMPNBTBoolean as NBTBoolean,
//     FMPNBTByte as NBTByte,
//     FMPNBTByteArray as NBTByteArray,
//     FMPNBTDouble as NBTDouble,
//     FMPNBTEnd as NBTEnd,
//     FMPNBTFloat as NBTFloat,
//     FMPNBTInt as NBTInt,
//     FMPNBTList as NBTList,
//     FMPNBTLong as NBTLong,
//     FMPNBTObjectLike as NBTObjectLike,
//     FMPNBTShort as NBTShort,
//     FMPNBTString as NBTString,
//     FMPNBTType as NBTType
// } from "./Game/NBT.js"
export {
    FMPLocation as Location,
    FMPEulerAngles as EulerAngles
} from "./Game/Location.js";
export {
    FMPDimension as Dimension
} from "./Game/Dimension.js"
// export {
//     FMPCommand as Command,
//     FMPCommandEnum as CommandEnum,
//     FMPCommandEnumOptions as CommandEnumOptions,
//     FMPCommandExecutor as CommandExecutor,
//     FMPCommandExecutorType as CommandExecutorType,
//     FMPCommandParam as CommandParam,
//     FMPCommandParamDataType as CommandParamDataType,
//     FMPCommandParamType as CommandParamType,
//     FMPCommandResult as CommandResult,
//     FMPruncmd as runcmd
// } from "./Game/Command.js"

//到时候看看能不能实现箱子ui，实现了再搞这个
// export {
//     FMPSimpleForm as SimpleForm,
//     FMPSimpleFormButton as SimpleFormButton,
//     FMPSimpleFormButtonType as SimpleFormButtonType,
//     FMPSimpleFormSession as SimpleFormSession,
//     FMPCustomForm as CustomForm,
//     FMPCustomFormDropdown as CustomFormDropdown,
//     FMPCustomFormInput as CustomFormInput,
//     FMPCustomFormLabel as CustomFormLabel,
//     FMPCustomFormSlider as CustomFormSlider,
//     FMPCustomFormStepSlider as CustomFormStepSlider,
//     FMPCustomFormSwitch as CustomFormSwitch,
//     FMPCustomFormSession as CustomFormSession,
//     FMPModalForm as ModalForm,
//     FMPModalFormSession as ModalFormSession
// } from "./Form.js"
export {
    FMPInitEvent as InitEvent,
    FMPDisableEvent as DisableEvent
} from "./Events/Process.js"
// export {
//     FMPPlayerToggleSneakEvent as PlayerToggleSneakEvent,
//     FMPPlayerJoinEvent as PlayerJoinEvent,
//     FMPPlayerChatEvent as PlayerChatEvent
// } from "./Events/Player.js"
// export {FMPTickEvent as TickEvent} from "./Events/Server.js"
// export {
//     FMPsetMotd as setMotd
// } from "./Game/Server.js"

// export{
//     SQLite3,
//     SQLDataTypeEnum,
//     SQLDataType,
//     SQLDBDataType,
//     SQLComparisonOperators,
//     SQLSingleArrayTable,
//     SQLite3Column,
//     SQLite3Constraint,
//     SQLite3ConstraintForignKey,
//     YMLFile,
//     WebSocket,
//     OneBot,
//     OneBotConnectionMode,
//     OneBotGroupRole,
//     OneBotMessageOriginType,
//     OneBotMessageType,
//     OneBotMessageAtContent,
//     OneBotMessageData,
//     OneBotMessageFaceContent,
//     OneBotMessageFileContent,
//     OneBotMessageImageContent,
//     OneBotMessageJSONContent,
//     OneBotMessageMFaceContent,
//     OneBotMessageMarkdownContent,
//     OneBotMessageRecordContent,
//     OneBotMessageReplyContent,
//     OneBotMessageTextContent,
//     OneBotMessageVideoContent,
//     OneBotMessageForwardContent,
//     PluginEvent,
//     PluginEventHandler,
//     PluginEventError,
//     regPluginFunc,
//     getPluginFunc
// } from "./FeaturesIndex.js"

//经济系统仍然采用计分板，vault对接让其他第三方库来做
// export {
//     FMPCurrency as Currency
// } from "./Game/Economy.js"
export {
    TwoWayMap,
    newUUID4,
    FMPRegionRectangle as RegionRectangle
} from "./Tools.js"

export {
    HTTPMethod,
    HTTPRequest,
    HTTPOptions,
    HTTPServer,
    HTTPRespond
} from "./http_helper.js"
export {ScriptDone} from "./Events/Process.js"