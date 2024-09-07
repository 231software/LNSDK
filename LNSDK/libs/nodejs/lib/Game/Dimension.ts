export enum FMPDefaultDimension{
    NotDefault=-1,
    Overworld=0,
    Nether,
    TheEnd
}
export class FMPDimension{
    dimid:number;
    static getDefaultDimension(dimid:number):FMPDimension{
        return new FMPDimension();
    }
}