import * as fs from 'fs'
import {LNVersion,LNVersionStatus} from "./Versions";
import {LNCONF} from "./plugin_config"
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
    config:any
    constructor(){
        this.type=this.getType();
        this.version=this.getVersion();
        this.config=this.getConfig();
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
                return fromll2version(ll.version());
            case LNSupportedPlatforms.NodeJS:
                return fromnodejsversion(process.version);
        }
    }
    getConfig():any{
        let conf={
            sqlite3:false,
            data_dir:"",
            name:LNCONF.name
        }
        //判断是否有各已确定兼容性不好的依赖
        if(LNCONF.dependencies){
            const dependencies=LNCONF.dependencies;
            if(dependencies.sqlite3)conf.sqlite3=true;
        }
        //插件目录
        conf.data_dir=this.getDataPathPerfix()+LNCONF.data_path
        return conf
    }
    /** 
     * 推断插件数据目录
     */
    getDataPathPerfix():string{
        switch(this.getType()){
            case LNSupportedPlatforms.NodeJS:return "";
            case LNSupportedPlatforms.LiteLoaderBDS:return "plugins/";
        }
    }
}
function fromll2version(rawversion:version):LNVersion{
    let version:LNVersion=new LNVersion();
    version.major=rawversion.major;
    version.minor=rawversion.minor;
    version.revision=rawversion.revision;
    if(rawversion.isBeta)version.versionStatus=LNVersionStatus.Beta;
    else version.versionStatus=LNVersionStatus.Release;
    return version;
}
function fromnodejsversion(rawversion:string):LNVersion{
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
        return currentPlatform.type;
    }
    static getVersion():LNVersion{
        return currentPlatform.version;
    }
    static getConfig():any{
        return currentPlatform.config;
    }
}
export const LNplugin_name=LNCONF.name;
//创建插件目录
try{
    fs.readdirSync(currentPlatform.config.data_dir);
}catch(e){
    fs.mkdirSync(currentPlatform.config.data_dir);
}


export {LNPlatform,LNSupportedPlatforms}