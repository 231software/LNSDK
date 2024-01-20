import { LNPlatform,LNSupportedPlatforms } from "./Platform";
export class LNLogger{
    static parseParams(params:any[]):string{
        let msg:string="";
        for(let arg of params){
            let argstr:string;
            switch(typeof arg){
                case "undefined":argstr="undefined";break;
                case "object":{
                    if(arg===null)argstr="null";break;
                }
                default:
                    argstr=arg.toString();
            }
            msg=msg+argstr+" ";
        }
        return msg;
    }
    static warn(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.warn(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.warn(msg);
                break;
        }
    }
    static info(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.info(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.log(msg);
                break;
        }
    }
    static debug(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.debug(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.debug(msg);
                break;
        }
    }
}