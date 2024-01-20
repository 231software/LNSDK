import { LNPlatform,LNSupportedPlatforms } from "./Platform";
export class LNLogger{
    static parseParams(params:any[]):string{
        let msg:string="";
        for(let arg of params){
            msg=msg+arg.toString()+" ";
        }
        return msg;
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