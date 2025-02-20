import { FMPItem } from "./Item";
import { FMPPlayer } from "./Player";

export enum FMPContainerType{
    CHEST,
    INVENTORY
}
export class FMPContainer{
    size:number;
    rawContainer:Container
    static itemMaxStackCache=new Map<string,number>()
    constructor(rawContainer:Container){
        this.rawContainer=rawContainer
    }
    get type():FMPContainerType{
        switch(this.rawContainer.type){
            case "INVENTORY":return FMPContainerType.INVENTORY;
            default:throw new Error("不支持的容器类型："+this.rawContainer.type)
        }
    }
    put(item:FMPItem,slot?:number):boolean{
        //如果传入了槽位，代表要放入指定位置，那么搜索物品栏确认是否能够放入
        if(slot!=undefined){
            //检查当前槽位是否还能放入
            const oldItem=this.getItem(slot)
            const oldCount=oldItem==undefined?0:oldItem.count
            //如果当前槽位已经有物品了再检查能不能放入
            if(oldItem){
                if(!this.canPut(oldItem,slot))throw new Error("由于当前槽位已满或存在其他物品，无法向其中放入物品"+oldItem.type)
                oldItem.count=oldCount+item.count
            }
            //如果没有物品就二话不说直接放入，收纳袋不用考虑
            else{
                this.rawContainer.setItem(slot,item.rawItem)
            }
            //  设置完物品后，还要检测当前物品是否设置成功，如果为空，则证明有可能是63、15个物品的情况
            if(!this.getItem(slot))throw new Error("设置物品"+item.type+"后，物品丢失！")
            return true;
        }
        else{
            if(!this.hasSpaceFor(item))return false
            let countLeft=item.count
            //寻找同类槽位或空位
            //第一圈：寻找同类槽位
            for(let currentSlot=0;currentSlot<this.size;currentSlot++){
                const currentItem=this.getItem(currentSlot)
                if(currentItem==undefined)continue;
                if(currentItem.type!=item.type)continue;
                //向当前槽位中尝试放入物品，直到无法放入，然后剩余物品到下一个槽位中继续放入
                //如果当前槽位放进剩余数量之后没有溢出，则证明已经全部放入，直接跳过
                if(item.maxStack>=countLeft+currentItem.count){
                    currentItem.count+=countLeft
                    return true;
                }
                //如果检测到可能的溢出，则先计算出一个可放入物品的数量
                //从countLeft中去掉可放入物品的数量
                //然后向当前物品中放入可放入物品的数量
                else{
                    const countCanPut=countLeft+currentItem.count-item.maxStack
                    countLeft-=countCanPut
                    currentItem.count+=countCanPut
                    //既然未放完，则不干涉流程控制，继续循环寻找新的空槽位
                }
                
            }
            //第二圈：寻找空槽位
            
            for(let currentSlot=0;currentSlot<this.size;currentSlot++){
                const currentItem=this.getItem(currentSlot)
                if(currentItem!=undefined)continue;
                //既然是空槽位，直接放入即可
                this.replaceItem(currentSlot,item)
                return true;
            }
            return false
        }
    }
    getItem(slot:number):FMPItem|undefined{
        const rawItem=this.rawContainer.getItem(slot)
        //如果原版获取到空的物品，则直接返回空。
        if(rawItem.isNull())return undefined
        //生成fmp物品
        const item=new FMPItem(rawItem.type,rawItem.count)//通过nbt读取物品自定义名称
        //获取当前物品时，会顺便检查这个物品的最大堆叠数量是否已经计算
        if(FMPContainer.itemMaxStackCache.get(item.type)==undefined){
            FMPContainer.itemMaxStackCache.set(item.type,getMaxStack(this.rawContainer,slot))
        }
        return item
    }
    replaceItem(slot:number,item:FMPItem):boolean{
        return this.rawContainer.setItem(slot,item.rawItem)
    }
    getAllItems():FMPItem[]{
        const rawItems=this.rawContainer.getAllItems()
        const items:FMPItem[]=[]
        for(let rawItem of rawItems){
            items.push(new FMPItem(rawItem))
        }
        return items;
    }
    clearSlot(slot:number):boolean{
        return this.rawContainer.getItem(slot).setNull()
    }
    removeItem(slot:number,number:number):boolean{
        return this.rawContainer.removeItem(slot,number);
    }
    clear(slot:number):boolean{
        return false;
    }
    hasSpaceFor(item:FMPItem):boolean{
        return this.rawContainer.hasRoomFor(item.rawItem);
    }
    isFull():boolean{
        for(let currentSlot=0;currentSlot<this.size;currentSlot++){
            const currentItem=this.getItem(currentSlot)
            if(currentItem==undefined)return false;
            if(currentItem.count<currentItem.maxStack) return false;
        }
        return true;
    }
    isEmpty():boolean{
        return this.rawContainer.isEmpty();
    }
    //检查物品能否被放进当前位置
    canPut(item:FMPItem,slot:number):boolean{
        const oldItem=this.getItem(slot)
        //空槽位一定能放进物品
        if(oldItem==undefined)return true;
        if(oldItem?.type!=item.type)return false;
        //物品种类相同的情况下，计算物品放入后能否达到最大数量
        return oldItem.count+item.count<=item.maxStack
    }
}
//目前在LLSE/LSE上无法检测63、15这两种堆叠
function getMaxStack(container:Container,slot:number,player?:Player):number{
    const oldItem=container.getItem(slot).clone()
    if(oldItem==null)throw new Error("检测"+container.getItem(slot).type+"时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
    const oldCount=oldItem.count
    let result=0
    if(testStackNumberAvailable(64)){
        result=64;
        return end();
    }
    if(testStackNumberAvailable(16)){
        result=16
        return end()
    }
    if(testStackNumberAvailable(1)){
        result=1
        return end()
    }
    end()
    throw new Error("检测到"+oldItem.type+"不是常规的堆叠数量。")
    function testStackNumberAvailable(number:number){
        if(oldItem==null)throw new Error("检测"+container.getItem(slot).type+"最大堆叠数量时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
        const testItemForCreate=mc.newItem(oldItem.type,number)
        if(testItemForCreate==null)throw new Error("检测"+container.getItem(slot).type+"最大堆叠数量时出错：无法根据原物品创建新的测试用物品！")
        container.setItem(slot,testItemForCreate)
        let testItem=container.getItem(slot)
        //如果设置后直接就为null了，证明这个数量对于客户端是不合法的
        if(testItem.isNull())return false;
        //由于物品数量太大会引发短暂的数据异常，故此处减一定数量以强制levilamina进行刷新
        container.removeItem(slot,1)
        //移除物品后，可能需要刷新一次玩家物品栏
        if(container.type=="INVENTORY"){
            if(player)player.refreshItems()
            else logger.error("检测物品最大数量时，操作在玩家物品栏进行，然而却没有传入该玩家。")
        }
        //由于改变物品后可能导致物品空指针，此处重新获取了物品
        testItem=container.getItem(slot)
        //如果减一之后物品为空，那么证明没有任何异常，物品的最大堆叠数量就是1
        if(testItem.isNull()){
            if(number==1)return true;
            else throw new Error("创建了一个数量超过1的物品，然后减去了1，却直接清空了整组物品")
        }
        //如果减1之后物品发生的数量变化不是1，证明刚刚的数量不正确
        logger.info("testItem.count"+testItem.count)
        if(testItem.count!=number-1)return false
        return true
    }
    function end(){
        //由于直接将原物品设置回来会导致设置完仍然为空，所以此处重新生成一个新的
        if(oldItem==null)throw new Error("检测"+container.getItem(slot).type+"最大堆叠数量时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
        container.setItem(slot,oldItem)
        if(container.type=="INVENTORY"){
            if(player)player.refreshItems()
            else logger.error("检测物品最大数量时，操作在玩家物品栏进行，然而却没有传入该玩家。")
        }
        return result
    }
}

export class FMPInventory extends FMPContainer{
    owner:FMPPlayer
    constructor(rawContainer:Container,owner:FMPPlayer){
        super(rawContainer)
        this.owner=owner
    }
}