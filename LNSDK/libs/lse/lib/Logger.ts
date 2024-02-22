export class FMPLogger{
    static info(...args:any){
        logger.info(...args);
    }
    static warn(...args:any){
        logger.warn(...args);
    }
    static error(...args:any){
        logger.error(...args);
    }
    static fatal(...args:any){
        logger.error(...args)
    }
}