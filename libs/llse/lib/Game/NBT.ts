export enum FMPNBTType{
    LIST,
    COMPOUND,
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
    rawNBT:NbtList|NbtCompound
    abstract getRawTag(tagName:string|number):NbtType|null
    abstract getRawTagType(tagName:string|number):NBT
    abstract setRawTag(tagName:string|number,data:NbtType):void
    get(tagName:string|number):FMPNBTList|FMPNBTCompound|FMPNBTEnd|FMPNBTByte|FMPNBTShort|FMPNBTInt|FMPNBTLong|FMPNBTFloat|FMPNBTDouble|FMPNBTByteArray|FMPNBTString|FMPNBTBoolean|undefined{
        const rawTag=this.getRawTag(tagName)
        if(rawTag instanceof NbtList)return new FMPNBTList(rawTag)
        if(rawTag instanceof NbtByte)return new FMPNBTByte(rawTag)
        if(rawTag instanceof NbtByteArray)return new FMPNBTByteArray(rawTag)
        if(rawTag instanceof NbtCompound)return new FMPNBTCompound(rawTag)
        if(rawTag instanceof NbtDouble)return new FMPNBTDouble(rawTag)
        if(rawTag instanceof NbtEnd)return new FMPNBTEnd(rawTag)
        if(rawTag instanceof NbtFloat)return new FMPNBTFloat(rawTag)
        if(rawTag instanceof NbtInt)return new FMPNBTInt(rawTag)
        if(rawTag instanceof NbtLong)return new FMPNBTLong(rawTag)
        if(rawTag instanceof NbtShort)return new FMPNBTShort(rawTag)
        if(rawTag==null)return undefined
        throw new Error("当前无法处理LSE的NBT类型"+rawTag.constructor.name)
    }
    getType(tagName:string|number):FMPNBTType{
        const type=this.getRawTagType(tagName)
        switch(type){
            case NBT.Byte:return FMPNBTType.BYTE
            case NBT.ByteArray:return FMPNBTType.BYTEARRAY
            case NBT.Compound:return FMPNBTType.COMPOUND
            case NBT.Double:return FMPNBTType.DOUBLE
            case NBT.End:return FMPNBTType.END
            case NBT.Float:return FMPNBTType.FLOAT
            case NBT.Int:return FMPNBTType.INT
            case NBT.List:return FMPNBTType.LIST
            case NBT.Long:return FMPNBTType.LONG
            case NBT.Short:return FMPNBTType.SHORT
            case NBT.String:return FMPNBTType.STRING
            default:throw new Error("有LNSDK无法处理的NBT类型："+type)
        }
    }
    set<T extends FMPNBTBasicType>(tagName:string|number,data:T):void{
        const rawNBTData=data.rawNBT as NbtType
        this.setRawTag(tagName,rawNBTData)
    }
    toString(space:number){
        throw new Error("目前类Object的NBT对象的toString方法还未完成")
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
    getRawTag(tagName:string){
        return this.rawNBT.getTag(tagName)
    }
    getRawTagType(tagName:string){
        return this.rawNBT.getTypeOf(tagName)
    }
    setRawTag(tagName:string, data: NbtType) {
        return this.rawNBT.setTag(tagName,data)
    }
    delete(tagName:string){
        throw new Error("delete方法暂未完成")
    }
    toObject(){
        throw new Error("toObject方法暂未完成")
    }
    toSNBT(){
        throw new Error("toSNBT方法暂未完成")
    }
}
export class FMPNBTList extends FMPNBTObjectLike{
    rawNBT:NbtList
    constructor(rawNBT:NbtList){
        super()
        this.rawNBT=rawNBT
    }
    get size(){
        return 0;
    }
    getType(index:number):FMPNBTType{
        return FMPNBTType.END
    }
    getRawTag(tagName: number): NbtType | null {
        return this.rawNBT.getTag(tagName)
    }
    getRawTagType(tagName:number){
        return this.rawNBT.getTypeOf(tagName)
    }
    setRawTag(tagName:number, data: NbtType) {
        return this.rawNBT.setTag(tagName,data)
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
        throw new Error("push方法暂未完成")
    }
    pop(){
        throw new Error("pop方法暂未完成")
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
        throw new Error("unshift方法暂未完成")
    }
    shift(){
        throw new Error("shift方法暂未完成")
    }
    splice(start:number,deleteCount:number){
        throw new Error("splice方法暂未完成")
    }
    toArray(){
        throw new Error("toArray方法暂未完成")
    }
    
}
export abstract class FMPNBTBasicType{
    rawNBT:NbtByte|NbtByteArray|NbtDouble|NbtEnd|NbtEnum|NbtFloat|NbtInt|NbtLong|NbtShort|NbtString|NbtType
    constructor(rawNBT:NbtByte|NbtByteArray|NbtDouble|NbtEnd|NbtEnum|NbtFloat|NbtInt|NbtLong|NbtShort|NbtString){
        this.rawNBT=rawNBT
    }
}
export class FMPNBTEnd extends FMPNBTBasicType{
    declare rawNBT:NbtEnd
    constructor(rawNBTTag:NbtEnd){
        super(rawNBTTag)
    }
}
export class FMPNBTByte extends FMPNBTBasicType{
    declare rawNBT:NbtByte
    constructor(rawNBTTag:NbtByte){
        super(rawNBTTag)
    }
    get data():any{
        return this.rawNBT.get()
    }
    set data(data:any){
        this.rawNBT.set(data)
    }
}
export abstract class FMPNBTNumberType extends FMPNBTBasicType{
    declare rawNBT: any
    get data():number{
        return this.rawNBT.get()
    }
}
export class FMPNBTShort extends FMPNBTNumberType{
    declare rawNBT:NbtShort
    constructor(rawNBTTag:NbtShort){
        super(rawNBTTag)
    }
    set data(data:number){
        if(data>127||data<-128||data%1!=0)throw new Error("无法向Short类型的NBT标签中写入值为"+data+"的数据，因为这超出了它的范围。")
        this.rawNBT.set(data)
    }
}
export class FMPNBTInt extends FMPNBTNumberType{
    declare rawNBT:NbtInt
    constructor(rawNBTTag:NbtInt){
        super(rawNBTTag)
    }
    set data(data:number){
        if(data>2147483647||data<-2147483648||data%1!=0)throw new Error("无法向Int类型的NBT标签中写入值为"+data+"的数据，因为这超出了它的范围。")
        this.rawNBT.set(data)
    }
}
export class FMPNBTLong extends FMPNBTNumberType{
    declare rawNBT:NbtLong
    constructor(rawNBTTag:NbtLong){
        super(rawNBTTag)
    }
    set data(data:number){
        this.rawNBT.set(data)
    }
}
export class FMPNBTFloat extends FMPNBTNumberType{
    declare rawNBT:NbtFloat
    constructor(rawNBTTag:NbtFloat){
        super(rawNBTTag)
    }
    set data(data:number){
        this.rawNBT.set(data)
    }
}
export class FMPNBTDouble extends FMPNBTNumberType{
    declare rawNBT:NbtDouble
    constructor(rawNBTTag:NbtDouble){
        super(rawNBTTag)
    }
    set data(data:number){
        this.rawNBT.set(data)
    }
}
export class FMPNBTByteArray extends FMPNBTBasicType{
    declare rawNBT:NbtByteArray
    constructor(rawNBTTag:NbtByteArray){
        super(rawNBTTag)
    }
    get data():any{
        return this.rawNBT.get()
    }
    set data(data:any){
        this.rawNBT.set(data)
    }
}
export class FMPNBTString extends FMPNBTBasicType{
    declare rawNBT:NbtString
    constructor(rawNBTTag:NbtString){
        super(rawNBTTag)
    }
    get data():any{
        return this.rawNBT.get()
    }
    set data(data:any){
        this.rawNBT.set(data)
    }
}
export class FMPNBTBoolean extends FMPNBTBasicType{
    constructor(){
        super(new NbtEnd())
        throw new Error("LSE上暂不支持设置布尔类型的NBT标签")
    }
    get data():boolean{
        throw new Error("LSE上暂不支持设置布尔类型的NBT标签")
    }
    set data(data:boolean){
        throw new Error("LSE上暂不支持设置布尔类型的NBT标签")
    }
}