import { LNPlatform, LNSupportedPlatforms } from "../Platform";
import { LNDefaultDimension, Dimension, toll2dimid } from "./Dimension";
export class LNManualConstructedLocation{
    x:number;
    y:number;
    z:number;
    dimension:Dimension;
    constructor(

        x:number,
        y:number,
        z:number,
        dimension:Dimension
    ){
        this.x=x;
        this.y=y;
        this.z=z;
        this.dimension=dimension;
    }
}
export class LNLocation{
    /** 原始坐标对象 */
    rawlocation:any;
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(rawlocation:any,manualConstructed:boolean){
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                if(manualConstructed)this.rawlocation=mc.newFloatPos(rawlocation.x,rawlocation.y,rawlocation.z,toll2dimid(rawlocation.dimension))
                else this.rawlocation=rawlocation;
            default:this.rawlocation=rawlocation;
        }
    }
    get x():number{
        switch(LNPlatform.getType()){
            default:
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawlocation.x;
        }
    }
    get y():number{
        switch(LNPlatform.getType()){
            default:
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawlocation.y
        }
    }
    get z():number{
        switch(LNPlatform.getType()){
            default:
            case LNSupportedPlatforms.LiteLoaderBDS:return this.rawlocation.z
        }
    }
    static new(x:number,y:number,z:number,dimension:Dimension=new Dimension(LNDefaultDimension.Overworld)):LNLocation{
        return new LNLocation({x:x,y:y,z:z,dimension:dimension},true);
    }
}