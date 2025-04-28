import { FMPItem } from "./Item";

export enum FMPContainerType{
    Chest,
    Inventory
}
export class FMPContainer{
    size:string;
    type:FMPContainer
    put(item:FMPItem,slot?:number):boolean{
        return false;
    }
    getItem(slot:number):FMPItem{
        return new FMPItem("minecraft:stone",1)
    }
    replaceItem(slot:number,item:FMPItem):boolean{
        return false
    }
    getAllItems():FMPItem[]{
        return []
    }
    removeItem(slot:number,number:number):boolean{
        return false;
    }
    clearSlot(slot:number):boolean{
        return false
    }
    consumeItem(type:string,number:number,slot?:number):boolean{
        return false
    }
    countItem(type:string):number{
        return 0
    }
    clear(slot:number):boolean{
        return false;
    }
    hasSpaceFor(item:FMPItem):boolean{
        return false;
    }
    isFull():boolean{
        return true;
    }
    isEmpty():boolean{
        return false;
    }
}

//玩家物品栏是一个有盔甲栏和副手栏的特殊窗口
export class FMPInventory extends FMPContainer{
    
}