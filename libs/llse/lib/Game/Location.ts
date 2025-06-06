import { FMPLogger } from "../Logger";
import { FMPDimension, fromll2dimid, toll2dimid } from "./Dimension";
import {LNSDKInternalError} from "../LNSDKInternalError"

export class FMPManualConstructedLocation{
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
    rawlocation:FloatPos|IntPos;
    constructor(x:number,y:number,z:number,dimension:FMPDimension)
    /**
     * 
     * @param rawlocation 原始坐标对象
     */
    constructor(rawlocation:FloatPos|IntPos)
    constructor(x_rawlocation:number|FloatPos|IntPos,y?:number,z?:number,dimension?:FMPDimension){
        if(typeof x_rawlocation==="number"){
            if(typeof y==="undefined"||typeof z==="undefined"||typeof dimension==="undefined")throw new LNSDKInternalError("Args for Location constructor must be provided with either x, y, z, dimension, or a raw location.")
            this.rawlocation=new FloatPos(x_rawlocation,y,z,dimension.ll2dimid)
        }
        else{
            this.rawlocation=x_rawlocation
        }
    }
    get x():number{
        return this.rawlocation.x;
    }
    get y():number{
        return this.rawlocation.y
    }
    get z():number{
        return this.rawlocation.z
    }
    get dimension():FMPDimension{
        return fromll2dimid(this.rawlocation.dimid);
    }
    toll2FloatPos():any{
        return new FloatPos(this.x,this.y,this.z,toll2dimid(this.dimension));
    }
    // static new(x:number,y:number,z:number,dimension:FMPDimension=FMPDimension.getDimension("overworld")):FMPLocation{
    //     return new FMPLocation(new FloatPos(x,y,z,toll2dimid(dimension)),true);
    // }
}
export class FMPEulerAngles{//yaw就是alpha，pitch就是beta
    rawangle:any;
    constructor(rawangle:any,manualConstructed:boolean){
        if(manualConstructed)this.rawangle=new DirectionAngle(rawangle.pitch,rawangle.yaw)
        else this.rawangle=rawangle;
    }
    get alpha():number{
        return this.rawangle.yaw;
    }
    get beta():number{
        return this.rawangle.pitch;
    }
    get gamma():number{
        return 0;
    }
    static new(alpha:number,beta:number,gamma:number):FMPEulerAngles{
        return new FMPEulerAngles(new DirectionAngle(beta,alpha),true);
    }
}
export function toll2DirectionAngle(angle:FMPEulerAngles):DirectionAngle{
    return new DirectionAngle(angle.beta,angle.alpha);
}