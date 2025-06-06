import { Logger } from "..";
import { TwoWayMap } from "../Tools";
export function fromll2dimid(ll2dimid:number):FMPDimension{
    switch(ll2dimid){
        case 0:return FMPDimension.getDimension("overworld");
        case 1:return FMPDimension.getDimension("nether");
        case 2:return FMPDimension.getDimension("the_end");
        default:throw new Error("LNSDK目前未对More Dimensions进行适配")
    }
}
export function toll2dimid(dim:FMPDimension):-1|0|1|2{
    switch(dim.name){
        case "nether":return 1;
        case "the_end":return 2;
        case "overworld":return 0;
        default:return -1;
    }
}
export class FMPDimension{
    _name:string
    displayName:string
    ll2dimid:number
    static createDimension(name:string){
        throw new Error("LNSDK目前未对More Dimensions进行适配")
    }
    constructor(name:string){
        if(!["overworld","nether","the_end"].includes(name))throw new Error("LNSDK目前未对More Dimensions进行适配")
        this._name=name
        switch(name){
            case "overworld":this.displayName="主世界";break;
            case "nether":this.displayName="下界";break;
            case "the_end":this.displayName="末地";break;
            default:this.displayName="不支持的维度"
        }
        this.ll2dimid=toll2dimid(this)
    }
    get name(){
        return this._name
    }
    static getDimension(name:string):FMPDimension{
        return new FMPDimension(name);
    }
}