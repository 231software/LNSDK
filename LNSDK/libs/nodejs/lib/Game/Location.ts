import { FMPDefaultDimension, FMPDimension} from "./Dimension";
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
    /**
     * 
     * @param rawlocation 原始坐标对象
     * @param manualConstructed 是否由用户手动生成
     */
    constructor(x:number,y:number,z:number,dimension:FMPDimension){
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
        return new FMPDimension();
    }
    static new(x:number,y:number,z:number,dimension:FMPDimension=FMPDimension.getDefaultDimension(0)):FMPLocation{
        return new FMPLocation(x,y,z,dimension);
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