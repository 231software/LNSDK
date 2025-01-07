export enum FMPDefaultDimension{
    Overworld=0,
    Nether,
    TheEnd,
    NotDefault
}
export function fromll2dimid(ll2dimid:number):FMPDefaultDimension{
    switch(ll2dimid){
        case 0:return FMPDefaultDimension.Overworld;
        case 1:return FMPDefaultDimension.Nether;
        case 2:return FMPDefaultDimension.TheEnd;
        default:return FMPDefaultDimension.NotDefault;
    }
}
export function toll2dimid(dim:FMPDefaultDimension):0|1|2{
    switch(dim){
        case FMPDefaultDimension.Nether:return 1;
        case FMPDefaultDimension.TheEnd:return 2;
        case FMPDefaultDimension.NotDefault:
        case FMPDefaultDimension.Overworld:
        default:return 0;
    }
}
export class FMPDimension{
    defaultdimension:FMPDefaultDimension;
    constructor(defaultdimension:FMPDefaultDimension){
        this.defaultdimension=defaultdimension;
    }
}