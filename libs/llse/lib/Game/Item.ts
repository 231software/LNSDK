import { Logger, NBTByte } from ".."
import { FMPContainer } from "./Container"
import { FMPNBTByte, FMPNBTCompound } from "./NBT"

/**
 * 代表游戏角色背包中的一件物品（包括物品栈）  
 * 注意物品不是槽位，槽位是单独的Slot类，其中可以容纳一个这个item
 */
export class FMPItem{
    rawItem:Item
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
    get type():string{
        return this.rawItem.type
    }
    set type(type:string){
        throw new Error("LSE/LLSE目前不支持修改物品类型")
    }
    get name():string{
        return this.rawItem.name
    }
    set name(name:string){
        this.rawItem.setDisplayName(name)
    }
    get count():number{
        return this.rawItem.count
    }
    set count(_count:number){
        //获取物品nbt，修改数量，然后再用物品nbt生成新物品
        const oldItemCloned=this.rawItem.clone()
        if(oldItemCloned==null)throw new Error("无法复制原物品，数量修改无法继续。")
        const oldNBT=new FMPItem(oldItemCloned).getNBT();
        //const CountNBT=oldNBT.get("Count") as FMPNBTByte
        (oldNBT.get("Count") as NBTByte).data=_count
        if((oldNBT.get("Count") as NBTByte).data!=_count)throw new Error("物品数量修改失败：物品"+this.type+"的NBT中的Count标签的值"+(oldNBT.get("Count") as NBTByte).data+"无法被修改为新值"+_count)
        const newRawItem=mc.newItem(oldNBT.rawNBT)
        if(newRawItem==null)throw new Error("无法修改物品数量：新物品生成失败！")
        if(newRawItem.count!=_count)throw new Error("物品数量修改失败：创建数量为"+_count+"，的新物品"+this.type+"，请检查是否设置了超过物品最大堆叠的数量。")
        //将原有的物品替换为新物品对象
        if(!this.rawItem.set(newRawItem))throw new Error("无法修改"+this.type+"的数量，调用LSE的Item.set时返回了false")
        //此时若是玩家背包，那么它还没有正式发生变化，不能通过这个判断
        //if((this.rawItem.getNbt().getTag("Count") as NbtByte).get()!=_count)throw new Error("物品数量修改失败：无法将物品原有的数量"+this.rawItem.count+"设置为新的数量"+_count+"，请检查是否设置了超过物品最大堆叠的数量。")
        //if(this.rawItem.count!=_count)throw new Error("物品数量修改失败：无法将物品"+this.type+"原有的数量"+this.rawItem.count+"设置为新的数量"+_count+"，请检查是否设置了超过物品最大堆叠的数量。")
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
    isStackableWith(item:FMPItem):boolean{
        //FMP中空气物品只能获取到一个undefined，所以不需要检查双方是否为空气
        //物品不同类型
        if(this.type!=item.type)return false;
        //物品不同名，物品没有自定义名称的话游戏会给他起一个默认的英文名
        if(this.name!=item.name)return false
        return true;
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