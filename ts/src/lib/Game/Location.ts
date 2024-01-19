import { Platform, SupportedPlatforms } from "../Platform";
import { Dimension } from "./Dimension";

export class LNLocation{
    rawlocation:any;
    x:number;
    y:number;
    z:number;
    dimension:Dimension;
    constructor(x:number|Object,y?:number,z?:number,dimension?:Dimension){
        if(typeof x=="number"){
            this.rawlocation=undefined;
            this.x=x;
            this.y=y;
            this.z=z;
            this.dimension=dimension;
        }
        else{
            this.rawlocation=x;
        }
    }
    getX():number{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:{
                return this.rawlocation.x;
            }
        }
    }
    getY():number{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:{
                return this.rawlocation.y;
            }
        }
    }
    getZ():number{
        switch(Platform.getType()){
            case SupportedPlatforms.NodeJS:break;
            case SupportedPlatforms.LiteLoaderBDS:{
                return this.rawlocation.z;
            }
        }
    }
}