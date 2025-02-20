import { Logger } from ".."
import { FMPContainer } from "./Container"
import { FMPNBTByte, FMPNBTCompound } from "./NBT"

/**
 * 代表游戏角色背包中的一件物品（包括物品栈）  
 * 注意物品不是槽位，槽位是单独的Slot类，其中可以容纳一个这个item
 */
export class FMPItem{
    rawItem:Item
    name:string|undefined
    get type():string{
        return this.rawItem.type
    }
    set type(type:string){
        throw new Error("LSE/LLSE目前不支持修改物品类型")
    }
    get count():number{
        return this.rawItem.count
    }
    set count(count:number){
        //获取物品nbt，修改数量，然后再用物品nbt生成新物品
        const oldNBT=this.getNBT();
        (oldNBT.get("Count") as FMPNBTByte).data=count;
        const newRawItem=mc.newItem(oldNBT.rawNBT)
        if(newRawItem==null)throw new Error("无法设置新物品：新物品生成失败！")
        this.rawItem.set(newRawItem)
    }
    constructor(type:string,count?:number,name?:string)
    constructor(NBT:FMPNBTCompound)
    constructor(rawItem:Item)
    constructor(typeOrNBTOrRawItem:string|FMPNBTCompound|Item,count:number=0,name?:string){
        if(typeof typeOrNBTOrRawItem=="string"){
            const item=mc.newItem(typeOrNBTOrRawItem,count)
            if(item==null)throw new Error("物品生成失败！")
            this.rawItem=item
        }
        else if(typeOrNBTOrRawItem instanceof FMPNBTCompound){
            const item=mc.newItem(typeOrNBTOrRawItem.rawNBT)
            if(item==null)throw new Error("物品生成失败！")
            this.rawItem=item
        }
        else{
            this.rawItem=typeOrNBTOrRawItem
        }
    }
    /**
     * 设置物品的自定义名称
     */
    set setName(name:string){
        this.rawItem.setDisplayName(name)
    }
    get maxStack(){
        const cachedStackData=FMPContainer.itemMaxStackCache.get(this.type)
        if(cachedStackData==undefined)throw new Error("目前无法找到容器来测试"+this.type+"的最大容量！")
        return cachedStackData
        /*
        //算法：
        //啥也不会的子沐呀：
        //@小鼠同学(已删库跑路) 有办法
        //你mc.newItem，然后数量输入一个非常大的数字
        //创建后count就是最大数量
        const testItem=mc.newItem(this.type,65535)
        if(testItem==null)throw new Error("物品"+this.type+"无法被用于计算最多堆叠数量（maxStack属性），请联系LNSDK开发者。")
        FMPItem.itemMaxStackCache.set(this.type,testItem.count)
        return testItem.count
        */
    }
    set maxStack(_number:number){
        throw new Error("LSE/LLSE暂不支持修改服务端最大物品堆叠数量限制。")
    }
    getNBT():FMPNBTCompound{
        return new FMPNBTCompound(this.rawItem.getNbt())
    }
}
/**
 * 工具类物品
 */
export class FMPToolItem extends FMPItem{
    /**工具的剩余耐久度 */
    damage:number
    constructor(type:string,count:number=1,name?:string){
        super(type,count,name)
    }
}