import { obWorld, obWorldCreator} from "@grakkit/types-paper";
import { Logger } from "..";

const Bukkit=core.type("org.bukkit.Bukkit")
const Environment=core.type("org.bukkit.World.Environment")
export class FMPDimension{
    displayName:string
    name:string;
    rawDimension:obWorld
    constructor(bukkitWorld:obWorld)
    constructor(name:string)
    constructor(arg1:string|obWorld){
        if(typeof arg1==="string"){
            const creator = new obWorldCreator(arg1); // 指定新世界的名称
            creator.environment(Environment.NORMAL); // 选择维度（NORMAL, NETHER, THE_END）
            creator.generateStructures(true); // 是否生成结构（例如村庄、要塞）
            //creator.seed(123456L); // 可选：设置世界种子
            this.rawDimension = creator.createWorld(); // 创建世界
        }
        else{
            this.rawDimension=arg1
        }

    }
    static getDimension(name:string):FMPDimension{
        return new FMPDimension(Bukkit.getWorld(name));
    }
}