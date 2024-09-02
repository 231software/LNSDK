import { FMPDefaultDimension, FMPDimension, toll2dimid } from "./Dimension";
export class LNManualConstructedLocation{
    x:number;
    y:number;
    z:number;
    dimension:FMPDimension;
    constructor(

        x:number,
        y:number,
        z:number,
        dimension:FMPDimension
    ){
        this.x=x;
        this.y=y;
        this.z=z;
        this.dimension=dimension;
    }
}
export class FMPLocation{
    /** 原始坐标对象 */
    rawlocation:any;
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(rawlocation:any,manualConstructed:boolean){
        if(manualConstructed)this.rawlocation=mc.newFloatPos(rawlocation.x,rawlocation.y,rawlocation.z,toll2dimid(rawlocation.dimension))
        else this.rawlocation=rawlocation;
    }
    getX():number{
        return this.rawlocation.x;
    }
    getY():number{
        return this.rawlocation.y
    }
    getZ():number{
        return this.rawlocation.z
    }
    static new(x:number,y:number,z:number,dimension:FMPDimension=new FMPDimension(FMPDefaultDimension.Overworld)):FMPLocation{
        return new FMPLocation({x:x,y:y,z:z,dimension:dimension},true);
    }
}