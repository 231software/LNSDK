class LNVersion{
    major:number
    minor:number
    revision:number
    versionStatus:LNVersionStatus
    constructor(){
        this.major=0;
        this.minor=0;
        this.revision=1;
        this.versionStatus=LNVersionStatus.Dev;
    }
}
enum LNVersionStatus{
    Release=0,
    Beta,
    Alpha,
    Dev
}
export {LNVersion,LNVersionStatus}