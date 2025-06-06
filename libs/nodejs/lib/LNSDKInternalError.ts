export class LNSDKInternalError extends Error{
    constructor(msg:string){
        super(msg)
        this.name="LNSDKInternalError"
    }
}