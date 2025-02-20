export enum FMPNBTType{
    LIST,
    END,
    BYTE,
    SHORT,
    INT,
    LONG,
    FLOAT,
    DOUBLE,
    BYTEARRAY,
    STRING,
    BOOLEAN
}
export abstract class FMPNBTObjectLike{
    toString(space:number){

    }
}
export class FMPNBTCompound extends FMPNBTObjectLike{
    rawNBT:NbtCompound
    constructor(NbtCompound:NbtCompound)
    constructor(data?:any)
    constructor(data?:any|NbtCompound){
        super()
        if(data instanceof NbtCompound){
            this.rawNBT=data
        }
        else{
            this.rawNBT=new NbtCompound(data)
        }
        
    }
    get(tagName:string):FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean{
        return new FMPNBTEnd()
    }
    set(tagName:string,data:FMPNBTList):void
    set(tagName:string,data:FMPNBTEnd):void
    set(tagName:string,data:FMPNBTByte):void
    set(tagName:string,data:FMPNBTShort):void
    set(tagName:string,data:FMPNBTInt):void
    set(tagName:string,data:FMPNBTLong):void
    set(tagName:string,data:FMPNBTFloat):void
    set(tagName:string,data:FMPNBTDouble):void
    set(tagName:string,data:FMPNBTByteArray):void
    set(tagName:string,data:FMPNBTString):void
    set(tagName:string,data:FMPNBTBoolean):void
    set(tagName:string,data:FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean):void{

    }
    getType(tagName:string):FMPNBTType{
        return FMPNBTType.END
    }
    delete(tagName:string){

    }
    toObject(){

    }
    toSNBT(){
        
    }
}
export abstract class FMPNBTBasicType{
}
export class FMPNBTList extends FMPNBTBasicType{
    get size(){
        return 0;
    }
    getType(index:number):FMPNBTType{
        return FMPNBTType.END
    }
    get(index:number):FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean{
        return new FMPNBTEnd()
    }
    set(index:number,data:FMPNBTList):void
    set(index:number,data:FMPNBTEnd):void
    set(index:number,data:FMPNBTByte):void
    set(index:number,data:FMPNBTShort):void
    set(index:number,data:FMPNBTInt):void
    set(index:number,data:FMPNBTLong):void
    set(index:number,data:FMPNBTFloat):void
    set(index:number,data:FMPNBTDouble):void
    set(index:number,data:FMPNBTByteArray):void
    set(index:number,data:FMPNBTString):void
    set(index:number,data:FMPNBTBoolean):void
    set(index:number,data:FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean){
    }
    push(data:FMPNBTList):void
    push(data:FMPNBTEnd):void
    push(data:FMPNBTByte):void
    push(data:FMPNBTShort):void
    push(data:FMPNBTInt):void
    push(data:FMPNBTLong):void
    push(data:FMPNBTFloat):void
    push(data:FMPNBTDouble):void
    push(data:FMPNBTByteArray):void
    push(data:FMPNBTString):void
    push(data:FMPNBTBoolean):void
    push(data:FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean){
    }
    pop(){

    }
    unshift(data:FMPNBTList):void
    unshift(data:FMPNBTEnd):void
    unshift(data:FMPNBTByte):void
    unshift(data:FMPNBTShort):void
    unshift(data:FMPNBTInt):void
    unshift(data:FMPNBTLong):void
    unshift(data:FMPNBTFloat):void
    unshift(data:FMPNBTDouble):void
    unshift(data:FMPNBTByteArray):void
    unshift(data:FMPNBTString):void
    unshift(data:FMPNBTBoolean):void
    unshift(data:FMPNBTList|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean){
    }
    shift(){

    }
    splice(start:number,deleteCount:number){

    }
    toArray(){

    }
    
}
export class FMPNBTEnd extends FMPNBTBasicType{
    
}
export class FMPNBTByte extends FMPNBTBasicType{
    data:any
}
export class FMPNBTShort extends FMPNBTBasicType{
    data:number
}
export class FMPNBTInt extends FMPNBTBasicType{
    data:number
}
export class FMPNBTLong extends FMPNBTBasicType{
    data:number
}
export class FMPNBTFloat extends FMPNBTBasicType{
    data:number
}
export class FMPNBTDouble extends FMPNBTBasicType{
    data:number
}
export class FMPNBTByteArray extends FMPNBTBasicType{
    data:Buffer
}
export class FMPNBTString extends FMPNBTBasicType{
    data:string
}
export class FMPNBTBoolean extends FMPNBTBasicType{
    data:boolean
}