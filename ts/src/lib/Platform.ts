import {Version,VersionStatus} from "./Versions";
enum SupportedPlatforms{
    Unsupported=0,
    NodeJS,
    LiteLoaderBDS,
    LeviLamina,
    LLSE_Lib,
    BDSX
}
/**
 * 将当前运行平台的所有信息存储在这里
 */
class PlatformDetector{
    type:SupportedPlatforms;
    version:Version;
    constructor(){
        this.type=this.getType();
        this.version=this.getVersion();
    }
    getType():SupportedPlatforms{
        //LLSE(LegacyScriptEngine)/LeviScript/LLSE_Lib
        if(typeof ll !== 'undefined'){
            return SupportedPlatforms.LiteLoaderBDS;
        }
        //NodeJS
        if(typeof console !== 'undefined'){
            return SupportedPlatforms.NodeJS;
        }
        return SupportedPlatforms.Unsupported;
    }
    getVersion():Version{
        switch (this.type){
            case SupportedPlatforms.LiteLoaderBDS:
                return liteloaderversion2lnsdkversion(ll.version());
            case SupportedPlatforms.NodeJS:
                return nodejsversion2lnsdkversion(process.version);
        }
    }
}
function liteloaderversion2lnsdkversion(rawversion:liteloaderversion):Version{
    let version:Version=new Version();
    version.major=rawversion.major;
    version.minor=rawversion.minor;
    version.revision=rawversion.revision;
    if(rawversion.isBeta)version.versionStatus=VersionStatus.Beta;
    else version.versionStatus=VersionStatus.Release;
    return version;
}
function nodejsversion2lnsdkversion(rawversion:string):Version{
    let version:Version=new Version();
    rawversion=rawversion.replace("v","");
    let rawversionlist:Array<string>=rawversion.split(".");
    version.major=Number(rawversionlist[0]);
    version.minor=Number(rawversionlist[1]);
    version.revision=Number(rawversionlist[2]);
    version.versionStatus=VersionStatus.Release;
    return version;
}


let currentPlatform:PlatformDetector=new PlatformDetector();
class Platform{
    static getType():SupportedPlatforms{
        return currentPlatform.getType();
    }
    static getVersion():Version{
        return currentPlatform.getVersion();
    }
}

export {Platform,SupportedPlatforms}