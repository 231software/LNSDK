class Version{
    major:number
    minor:number
    revision:number
    versionStatus:VersionStatus
    constructor(){
        this.major=0;
        this.minor=0;
        this.revision=1;
        this.versionStatus=VersionStatus.Dev;
    }
}
enum VersionStatus{
    Release=0,
    Beta,
    Alpha,
    Dev
}
export {Version,VersionStatus}