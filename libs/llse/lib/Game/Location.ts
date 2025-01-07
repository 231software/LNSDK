import { FMPLogger } from "../Logger";
import { FMPDefaultDimension, FMPDimension, fromll2dimid, toll2dimid } from "./Dimension";
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
    rawlocation:IntPos|FloatPos;
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(rawlocation:any,manualConstructed:boolean){
        let ll2dimid=rawlocation.dimid
        if(ll2dimid==-1)ll2dimid=0;
        if(manualConstructed)this.rawlocation=mc.newFloatPos(rawlocation.x,rawlocation.y,rawlocation.z,ll2dimid)
        else this.rawlocation=rawlocation;
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
        return new FMPDimension(fromll2dimid(this.rawlocation.dimid));
    }
    get defaultDimension():FMPDefaultDimension{
        return this.rawlocation.dimid;
    }
    toll2FloatPos():any{
        return new FloatPos(this.x,this.y,this.z,toll2dimid(this.defaultDimension));
    }
    static new(x:number,y:number,z:number,dimension:FMPDimension=new FMPDimension(FMPDefaultDimension.Overworld)):FMPLocation{
        return new FMPLocation(new FloatPos(x,y,z,toll2dimid(dimension.defaultDimension)),true);
    }
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