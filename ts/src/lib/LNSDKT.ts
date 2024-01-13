import { Platform, SupportedPlatforms } from "./Platform";
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
        switch (Platform.getType()){
            case SupportedPlatforms.LiteLoaderBDS:
                logger.info(msg);
                break;
            case SupportedPlatforms.NodeJS:
                console.log(msg);
                break;
        }
    }
}