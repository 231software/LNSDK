import {FMPDimension} from "./Dimension";
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
    rawlocation:any;
    manualConstructed:boolean
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(rawlocation:any,manualConstructed:boolean){
        this.rawlocation=rawlocation
        this.manualConstructed=manualConstructed
    }
    get x():number{
        return 0;
    }
    get y():number{
        return 0;
    }
    get z():number{
        return 0;
    }
    get dimension():FMPDimension{
        return this.rawlocation.dimension;
    }
    static new(x:number,y:number,z:number,dimension:FMPDimension=FMPDimension.getDimension("overworld")):FMPLocation{
        return new FMPLocation({x,y,z,dimension},true);
    }
}
export class FMPEulerAngles{
    rawangle:any;
    constructor(alpha:number,beta:number,gamma:number){
    }
    get alpha():number{
        return 0;
    }
    get beta():number{
        return 0;
    }
    get gamma():number{
        return 0;
    }
    static new(alpha:number,beta:number,gamma:number):FMPEulerAngles{
        return new FMPEulerAngles(alpha,beta,gamma);
    }
}