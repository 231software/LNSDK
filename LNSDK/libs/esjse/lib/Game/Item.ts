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
    constructor(type:string,count:number=0,name?:string){
        const item=mc.newItem(type,count)
        if(item==null)throw new Error("物品生成失败！")
        this.rawItem=item
    }
    /**
     * 设置物品的自定义名称
     */
    set setName(name:string){
        this.rawItem.setDisplayName(name)
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
/**
 * 代表游戏角色背包中的一个槽位
 */
export class FMPSlot{
    item:FMPItem
    constructor(){

    }
}