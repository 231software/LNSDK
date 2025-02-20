import { FMPItem } from "./Item";

export enum FMPContainerType{
    Chest,
    Inventory
}
export class FMPContainer{
    size:string;
    type:FMPContainer
    put(item:FMPItem,slot?:number):boolean{
        //如果传入了item，
        if(!slot){

        }
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
    clearSlot(slot:number):boolean{
        return false
    }
    removeItem(slot:number,number:number):boolean{
        return false;
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