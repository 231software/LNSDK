export enum LNDefaultDimension{
    Overworld=0,
    Nether,
    TheEnd,
    NotDefault
}
export function fromll2dimid(ll2dimid:number):LNDefaultDimension{
    switch(ll2dimid){
        case 0:return LNDefaultDimension.Overworld;
        case 1:return LNDefaultDimension.Nether;
        case 2:return LNDefaultDimension.TheEnd;
        default:return LNDefaultDimension.NotDefault;
    }
}
export function toll2dimid(dim:LNDefaultDimension):0|1|2{
    switch(dim){
        case LNDefaultDimension.Nether:return 1;
        case LNDefaultDimension.TheEnd:return 2;
        case LNDefaultDimension.NotDefault:
        case LNDefaultDimension.Overworld:
        default:return 0;
    }
}
export class Dimension{
    defaultdimension:LNDefaultDimension;
    constructor(defaultdimension:LNDefaultDimension){
        this.defaultdimension=defaultdimension;
    }
}