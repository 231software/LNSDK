import { 
    obLocation
 } from "@grakkit/types-paper";
import {FMPDimension} from "./Dimension";
const Bukkit=core.type("org.bukkit.Bukkit")
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
    rawlocation:obLocation;
    manualConstructed:boolean;
    constructor(x:number,y:number,z:number,dimension:FMPDimension)
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(rawlocation:obLocation,manualConstructed:boolean)
    constructor(x_rawlocation:number|obLocation,y_manualConstructed:number|boolean,z?:number,dimension?:FMPDimension){
        //用户手动生成
        if(typeof y_manualConstructed==="number"){
            if(dimension===undefined)throw new Error("Location initialization failed: constructor didn't recieve a dimension argument.")
            if(z===undefined)throw new Error("Location initialization failed: constructor didn't recieve a z argument.")
            if(typeof x_rawlocation!=='number')throw new Error("Location initialization failed: x wasn't given as a number.")
            this.rawlocation=new obLocation(Bukkit.getWorld(dimension.name),x_rawlocation,y_manualConstructed,z)
            this.manualConstructed=false
        }
        //程序内部通过原始坐标直接生成
        else{
            if(typeof x_rawlocation==='number')throw new Error("Location initialization failed: x was given as a number.")
            this.rawlocation=x_rawlocation
            this.manualConstructed=y_manualConstructed

        }
    }
    get x():number{
        return this.x;
    }
    get y():number{
        return this.y;
    }
    get z():number{
        return this.z;
    }
    get dimension():FMPDimension{
        return new FMPDimension(this.rawlocation.getWorld());
    }
    // static new(x:number,y:number,z:number,dimension:FMPDimension=FMPDimension.getDimension("overworld")):FMPLocation{
    //     return new FMPLocation({x,y,z,dimension},true);
    // }
}

//java版没有单独的欧拉角而是集成在location中
export class FMPEulerAngles{
    /**rawangle不一定会绑定到location上，只有从location中获取的对象才会绑定 */
    rawangle:obLocation|undefined;
    private _alpha:number|undefined
    private _beta:number|undefined;
    private _gamma:number|undefined;
    constructor(location:obLocation);
    constructor(alpha:number,beta:number,gamma:number);
    constructor(alpha_location:number|obLocation,beta?:number,gamma?:number){
        if(typeof alpha_location==="number"){
            this._alpha=alpha_location;
            this._beta=beta;
            this._gamma=gamma;
        }
        else{
            this.rawangle=alpha_location
        }
    }
    get alpha():number{
        if(this.rawangle!==undefined)return this.rawangle.getYaw();
        else {
            if(this._alpha===undefined)throw new Error("EulerAngles are wrongly initialized or modified: alpha is undefined")
            return this._alpha;
        }
    }
    get beta():number{
        if(this.rawangle!==undefined)return this.rawangle.getPitch();
        else {
            if(this._beta===undefined)throw new Error("EulerAngles are wrongly initialized or modified: beta is undefined")
            return this._beta;
        }
    }
    get gamma():number{
        //由于mc中不存在gamma角的概念，那么根据所有实体的旋转状态，可以得出这个值在mc中永远是0
        return 0;
    }
}