import { FMPLogger } from "../Logger";
import { FMPActor } from "./Actor";
import { FMPItem } from "./Item";
import { FMPPlayer } from "./Player";

export enum FMPContainerType{
    CHEST,
    INVENTORY
}
export class FMPContainer{
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
    get size():number{
        return this.rawContainer.size
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
            let vars={
                countLeft:item.count
            }
            let didSomePut=false
            //寻找同类槽位或空位
            //第一圈：寻找同类槽位
            for(let currentSlot=0;currentSlot<this.size;currentSlot++){
                const currentItem=this.getItem(currentSlot)
                if(currentItem==undefined)continue;
                if(!currentItem.isStackableWith(item))continue;
                this.putInSlot(currentSlot,item,vars)
                didSomePut=true;
                if(vars.countLeft==0)return true;
            }
            //第二圈：寻找空气
            
            for(let currentSlot=0;currentSlot<this.size;currentSlot++){
                const currentItem=this.getItem(currentSlot)
                if(currentItem!=undefined)continue;
                //空槽位也要一样遵循上面同类槽位的逻辑
                this.putInSlot(currentSlot,item,vars)
                didSomePut=true;
                if(vars.countLeft==0)return true;
            }
            if(vars.countLeft<0)throw new Error("可能给予了多余的物品。")
            return false
        }
    }
    private putInSlot(slot:number,item:FMPItem,vars:{countLeft:number}){
        const currentItem=this.getItem(slot)
        if(currentItem!=undefined)if(!currentItem.isStackableWith(item))throw new Error("程序正在尝试向无法进行物品堆叠的槽位放置物品！这很可能是判断逻辑中有一部分缺少了对物品是否可堆叠的判断。将要被错误地堆叠的物品分别为："+currentItem.type+"、"+item.type)
        this.checkAndCalculateItemMaxStack(item,slot)
        const oldCount=currentItem?currentItem.count:0
        const vars1={
            currentItem,
            item,
            slot
        }
        //向当前槽位中尝试放入物品，直到无法放入，然后剩余物品到下一个槽位中继续放入
        //如果当前槽位放进剩余数量之后没有溢出，则证明已经全部放入，直接跳过
        if(item.maxStack>=vars.countLeft+oldCount){
            this.setItemCount(oldCount+vars.countLeft,vars1)
            //oldCount+vars.countLeft-oldCount-vars.countLeft==0
            vars.countLeft=0
        }
        //如果检测到可能的溢出，则先计算出一个可放入物品的数量
        //从countLeft中去掉可放入物品的数量
        //然后向当前物品中放入可放入物品的数量
        else{
            const countExceeded=vars.countLeft+oldCount-item.maxStack
            const countCanPut=vars.countLeft-countExceeded
            vars.countLeft-=countCanPut
            this.setItemCount(oldCount+countCanPut,vars1)
            //既然未放完，则不干涉流程控制，继续循环寻找新的空槽位
        }
    }
    private setItemCount(count:number,vars1:{currentItem:FMPItem|undefined,item:FMPItem,slot:number}){
        if(vars1.currentItem){
            vars1.currentItem.count=count
        }
        else{
            const newRawItem=vars1.item.rawItem.clone()
            if(newRawItem==null)throw new Error("由于无法复制要给予的物品，无法为容器的"+vars1.slot+"放置物品。")
            const newItem=new FMPItem(newRawItem)
            newItem.count=count;
            this.replaceItem(vars1.slot,newItem)
        }
    }
    getItem(slot:number):FMPItem|undefined{
        const rawItem=this.rawContainer.getItem(slot)
        //如果原版获取到空的物品，则直接返回空。
        if(rawItem.isNull())return undefined
        //生成fmp物品
        const item=new FMPItem(rawItem)//通过nbt读取物品自定义名称
        this.checkAndCalculateItemMaxStack(item,slot)
        return item
    }
    checkAndCalculateItemMaxStack(item:FMPItem,slot:number){
        //获取当前物品时，会顺便检查这个物品的最大堆叠数量是否已经计算
        if(FMPContainer.itemMaxStackCache.get(item.type)==undefined){
            FMPContainer.itemMaxStackCache.set(item.type,getMaxStack(this,slot,item.type))
        }
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
    consumeItem(type:string,number:number,slot?:number):boolean{
        //剩余物品不足这么多则直接返回false
        if(this.countItem(type)<number)return false
        for(let currentSlot=0;currentSlot<this.size;currentSlot++){
            const currentItem=this.getItem(currentSlot)
            if(!currentItem)continue;
            if(currentItem.type!=type)continue;
            //剩余数量为0视为扣除完毕
            if(number==0)break;
            //如果剩余要消耗数量小于等于当前格子堆叠数，则消耗数量直接计为本次消耗量，格子堆叠数直接减掉消耗数量，然后剩余数量减掉消耗数量
            if(number<=currentItem.count){
                currentItem.count-=number
                number-=number
            }
            //否则（消耗数量大于堆叠数），消耗数量为堆叠数，当前格子清空，剩余消耗数量为消耗数量减堆叠数
            else{
                number-=currentItem.count
                this.clearSlot(currentSlot)
            }
        }
        return true;
    }
    countItem(type:string):number{
        let count=0
        for(let currentSlot=0;currentSlot<this.size;currentSlot++){
            const currentItem=this.getItem(currentSlot)
            if(!currentItem)continue;
            if(currentItem.type!=type)continue;
            count+=currentItem.count
        }
        return count
    }
    clear(slot:number):boolean{
        return false;
    }
    hasSpaceFor(item:FMPItem):boolean{
        //整体思路：遍历整个容器，累加每个格子能放入的物品
        //遇到空气就直接累加最大堆叠，遇到可堆叠就累加最大堆叠减去该堆叠
        let rest=0
        for(let currentSlot=0;currentSlot<this.size;currentSlot++){
            const currentItem=this.getItem(currentSlot)
            if(currentItem==undefined){
                //由于遇到了空气，需要先检查最大堆叠数量
                this.checkAndCalculateItemMaxStack(item,currentSlot)
                //遇到空气就直接累加最大堆叠
                rest+=item.maxStack
                continue;
            }
            if(currentItem.isStackableWith(item)){
                //遇到可堆叠就累加最大堆叠减去该堆叠
                rest+=item.maxStack-currentItem.count;
            }
        }
        //累加结果小于物品数量就false，大于等于就true
        return rest>=item.count

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
function getMaxStack<T extends FMPContainer>(container:T,slot:number,itemType:string,player?:Player):number{
    const oldItem=container.rawContainer.getItem(slot).clone()
    if(oldItem==null)throw new Error("检测"+container.rawContainer.getItem(slot)?.type+"时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
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
    throw new Error("检测到"+itemType+"不是常规的堆叠数量。")
    function testStackNumberAvailable(number:number){
        if(oldItem==null)throw new Error("检测"+container.rawContainer.getItem(slot)?.type+"最大堆叠数量时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
        const testItemForCreate=mc.newItem(itemType,number)
        if(testItemForCreate==null)throw new Error("检测"+container.rawContainer.getItem(slot)?.type+"最大堆叠数量时出错：无法根据原物品创建新的测试用物品！")
        container.replaceItem(slot,new FMPItem(testItemForCreate))
        let testItem=container.rawContainer.getItem(slot)
        //如果设置后直接就为null了，证明这个数量对于客户端是不合法的
        if(testItem.isNull())return false;
        //由于物品数量太大会引发短暂的数据异常，故此处减一定数量以强制levilamina进行刷新
        container.removeItem(slot,1)
        //移除物品后，可能需要刷新一次玩家物品栏
        if(container.type==FMPContainerType.INVENTORY){
            if(player)player.refreshItems()
            else throw new Error("检测物品最大数量时，操作在玩家物品栏进行，然而却没有传入该玩家。")
        }
        //由于改变物品后可能导致物品空指针，此处重新获取了物品
        testItem=container.rawContainer.getItem(slot)
        //如果减一之后物品为空，那么证明没有任何异常，物品的最大堆叠数量就是1
        if(testItem.isNull()){
            if(number==1)return true;
            else throw new Error("创建了一个数量超过1的物品，然后减去了1，却直接清空了整组物品")
        }
        //如果减1之后物品发生的数量变化不是1，证明刚刚的数量不正确
        if(testItem.count!=number-1)return false
        return true
    }
    function end(){
        //由于直接将原物品设置回来会导致设置完仍然为空，所以此处重新生成一个新的
        if(oldItem==null)throw new Error("检测"+container.getItem(slot)?.type+"最大堆叠数量时出错：原物品无法被复制！为了防止损坏游戏内容，操作已中断。")
        container.replaceItem(slot,new FMPItem(oldItem))
        if(container.type==FMPContainerType.INVENTORY){
            if(player)player.refreshItems()
            else logger.error("检测物品最大数量时，操作在玩家物品栏进行，然而却没有传入该玩家。")
        }
        return result
    }
}

export class FMPInventory extends FMPContainer{
}


//玩家物品栏是一个有盔甲栏和副手栏的特殊窗口
export class FMPPlayerInventory extends FMPInventory{

    owner:FMPPlayer
    constructor(rawContainer:Container,owner:FMPPlayer){
        super(rawContainer)
        this.owner=owner
    }
    //修改玩家物品栏后要给玩家刷新物品栏显示
    put(item:FMPItem,slot?:number):boolean{
        const result=super.put(item,slot)
        if(!this.owner.rawObject.refreshItems()){
            FMPLogger.error("刷新玩家物品栏失败！")
            return false
        }
        return result
    }
    replaceItem(slot:number,item:FMPItem):boolean{
        const result=super.replaceItem(slot,item)
        this.owner.rawObject.refreshItems()
        return result
    }
    removeItem(slot:number,number:number):boolean{
        const result=super.removeItem(slot,number)
        this.owner.rawObject.refreshItems()
        return result
    }
    clearSlot(slot:number):boolean{
        const result=super.clearSlot(slot)
        this.owner.rawObject.refreshItems()
        return result
    }
    consumeItem(type:string,number:number,slot?:number):boolean{
        const result=super.consumeItem(type,number,slot)
        this.owner.rawObject.refreshItems()
        return result
    }
    //对于物品栏则是重载该方法，让getMaxStack传入的参数带玩家
    checkAndCalculateItemMaxStack(item:FMPItem,slot:number){
        //获取当前物品时，会顺便检查这个物品的最大堆叠数量是否已经计算
        if(FMPContainer.itemMaxStackCache.get(item.type)==undefined){
            FMPContainer.itemMaxStackCache.set(item.type,getMaxStack(this,slot,item.type,this.owner.rawObject))
        }
    }
}

export class FMPMobInventory extends FMPInventory{

}