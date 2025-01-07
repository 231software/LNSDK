import { Logger } from "..";
import { TwoWayMap } from "../Tools";
export enum FMPDefaultDimension{
    NotDefault=-1,
    Overworld=0,
    Nether,
    TheEnd
}
export const DefaultDimensionName=new TwoWayMap(new Map([
    [-1,"非原版维度"],
    [0,"主世界"],
    [1,"下界"],
    [2,"末地"]
]))
export function fromll2dimid(ll2dimid:number):FMPDefaultDimension{
    switch(ll2dimid){
        case 0:return FMPDefaultDimension.Overworld;
        case 1:return FMPDefaultDimension.Nether;
        case 2:return FMPDefaultDimension.TheEnd;
        default:return FMPDefaultDimension.NotDefault;
    }
}
export function toll2dimid(dim:FMPDefaultDimension):-1|0|1|2{
    switch(dim){
        case FMPDefaultDimension.Nether:return 1;
        case FMPDefaultDimension.TheEnd:return 2;
        case FMPDefaultDimension.NotDefault:return -1;
        case FMPDefaultDimension.Overworld:return 0;
        default:return 0;
    }
}
export class FMPDimension{
    defaultDimension:FMPDefaultDimension
    name:string
    constructor(defaultDimensionOrName:FMPDefaultDimension|string){
        //通过默认维度生成fmp维度的方法
        if(typeof defaultDimensionOrName!="string"){
            this.defaultDimension=defaultDimensionOrName;
            const name=DefaultDimensionName.toRight(this.defaultDimension)
            if(name==undefined)throw new TypeError("无法读取维度名称！这可能因为LNSDK出现bug，请联系开发团队寻求帮助")
            this.name=name;
            return;
        }
        this.name=defaultDimensionOrName;
        this.defaultDimension=FMPDefaultDimension.NotDefault;
    }
    static getDefaultDimension(defaultDimension:FMPDefaultDimension):FMPDimension{
        return new FMPDimension(defaultDimension);
    }
}