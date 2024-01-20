import {LNVersion,LNVersionStatus} from "./Versions";
enum LNSupportedPlatforms{
    Unsupported=0,
    NodeJS,
    LiteLoaderBDS,
    LeviScript,
    GMLib,
    LLSE_Lib,
    BDSX
}
/**
 * 将当前运行平台的所有信息存储在这里
 */
class LNPlatformDetector{
    type:LNSupportedPlatforms;
    version:LNVersion;
    constructor(){
        this.type=this.getType();
        this.version=this.getVersion();
    }
    getType():LNSupportedPlatforms{
        //LLSE(LegacyScriptEngine)/LeviScript/LLSE_Lib
        if(typeof ll !== 'undefined'){
            return LNSupportedPlatforms.LiteLoaderBDS;
        }
        //检测到levisciprt时，先检测gmlib，如果没有再设置为leviscript
        //NodeJS
        if(typeof console !== 'undefined'){
            return LNSupportedPlatforms.NodeJS;
        }
        return LNSupportedPlatforms.Unsupported;
    }
    getVersion():LNVersion{
        switch (this.type){
            case LNSupportedPlatforms.LiteLoaderBDS:
                return liteloaderversion2lnsdkversion(ll.version());
            case LNSupportedPlatforms.NodeJS:
                return nodejsversion2lnsdkversion(process.version);
        }
    }
}
function liteloaderversion2lnsdkversion(rawversion:liteloaderversion):LNVersion{
    let version:LNVersion=new LNVersion();
    version.major=rawversion.major;
    version.minor=rawversion.minor;
    version.revision=rawversion.revision;
    if(rawversion.isBeta)version.versionStatus=LNVersionStatus.Beta;
    else version.versionStatus=LNVersionStatus.Release;
    return version;
}
function nodejsversion2lnsdkversion(rawversion:string):LNVersion{
    let version:LNVersion=new LNVersion();
    rawversion=rawversion.replace("v","");
    let rawversionlist:Array<string>=rawversion.split(".");
    version.major=Number(rawversionlist[0]);
    version.minor=Number(rawversionlist[1]);
    version.revision=Number(rawversionlist[2]);
    version.versionStatus=LNVersionStatus.Release;
    return version;
}


let currentPlatform:LNPlatformDetector=new LNPlatformDetector();
class LNPlatform{
    static getType():LNSupportedPlatforms{
        return currentPlatform.getType();
    }
    static getVersion():LNVersion{
        return currentPlatform.getVersion();
    }
}

export {LNPlatform,LNSupportedPlatforms}