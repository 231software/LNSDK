import {FloatPos} from "../../../@LLSELib/index.js"
import { LNPlatform, LNSupportedPlatforms } from "../Platform.js";
import { LNDefaultDimension, LNDimension, toll2dimid } from "./Dimension.js";
export class LNManualConstructedLocation{
    x:number;
    y:number;
    z:number;
    dimension:LNDimension;
    constructor(

        x:number,
        y:number,
        z:number,
        dimension:LNDimension
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
                if(manualConstructed)this.rawlocation=new FloatPos(rawlocation.x,rawlocation.y,rawlocation.z,toll2dimid(rawlocation.dimension))
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
    /**
     * 维度系统未完成，一律返回主世界
     */
    get defaultDimension():LNDefaultDimension{
        switch(LNPlatform.getType()){
            default:
            case LNSupportedPlatforms.LiteLoaderBDS:return LNDefaultDimension.Overworld;
        }
    }
    toll2FloatPos():FloatPos{
        return new FloatPos(this.x,this.y,this.z,toll2dimid(this.defaultDimension));
    }
    static new(x:number,y:number,z:number,dimension:LNDimension=new LNDimension(LNDefaultDimension.Overworld)):LNLocation{
        return new LNLocation({x:x,y:y,z:z,dimension:dimension},true);
    }
}