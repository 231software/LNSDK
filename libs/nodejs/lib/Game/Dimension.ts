export class FMPDimension{
    displayName:string
    name:string;
    constructor(name:string){
        this.name=name
        this.displayName="默认维度"
    }
    static getDimension(name:string):FMPDimension{
        return new FMPDimension(name);
    }
}