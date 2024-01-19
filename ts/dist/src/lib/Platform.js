"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedPlatforms = exports.Platform = void 0;
var Versions_1 = require("./Versions");
var SupportedPlatforms;
(function (SupportedPlatforms) {
    SupportedPlatforms[SupportedPlatforms["Unsupported"] = 0] = "Unsupported";
    SupportedPlatforms[SupportedPlatforms["NodeJS"] = 1] = "NodeJS";
    SupportedPlatforms[SupportedPlatforms["LiteLoaderBDS"] = 2] = "LiteLoaderBDS";
    SupportedPlatforms[SupportedPlatforms["LeviLamina"] = 3] = "LeviLamina";
    SupportedPlatforms[SupportedPlatforms["LLSE_Lib"] = 4] = "LLSE_Lib";
    SupportedPlatforms[SupportedPlatforms["BDSX"] = 5] = "BDSX";
    SupportedPlatforms[SupportedPlatforms["GMLib"] = 6] = "GMLib";
})(SupportedPlatforms || (exports.SupportedPlatforms = SupportedPlatforms = {}));
/**
 * 将当前运行平台的所有信息存储在这里
 */
var PlatformDetector = /** @class */ (function () {
    function PlatformDetector() {
        this.type = this.getType();
        this.version = this.getVersion();
    }
    PlatformDetector.prototype.getType = function () {
        //LLSE(LegacyScriptEngine)/LeviScript/LLSE_Lib
        if (typeof ll !== 'undefined') {
            return SupportedPlatforms.LiteLoaderBDS;
        }
        //检测到levisciprt时，先检测gmlib，如果没有再设置为leviscript
        //NodeJS
        if (typeof console !== 'undefined') {
            return SupportedPlatforms.NodeJS;
        }
        return SupportedPlatforms.Unsupported;
    };
    PlatformDetector.prototype.getVersion = function () {
        switch (this.type) {
            case SupportedPlatforms.LiteLoaderBDS:
                return liteloaderversion2lnsdkversion(ll.version());
            case SupportedPlatforms.NodeJS:
                return nodejsversion2lnsdkversion(process.version);
        }
    };
    return PlatformDetector;
}());
function liteloaderversion2lnsdkversion(rawversion) {
    var version = new Versions_1.Version();
    version.major = rawversion.major;
    version.minor = rawversion.minor;
    version.revision = rawversion.revision;
    if (rawversion.isBeta)
        version.versionStatus = Versions_1.VersionStatus.Beta;
    else
        version.versionStatus = Versions_1.VersionStatus.Release;
    return version;
}
function nodejsversion2lnsdkversion(rawversion) {
    var version = new Versions_1.Version();
    rawversion = rawversion.replace("v", "");
    var rawversionlist = rawversion.split(".");
    version.major = Number(rawversionlist[0]);
    version.minor = Number(rawversionlist[1]);
    version.revision = Number(rawversionlist[2]);
    version.versionStatus = Versions_1.VersionStatus.Release;
    return version;
}
var currentPlatform = new PlatformDetector();
var Platform = /** @class */ (function () {
    function Platform() {
    }
    Platform.getType = function () {
        return currentPlatform.getType();
    };
    Platform.getVersion = function () {
        return currentPlatform.getVersion();
    };
    return Platform;
}());
exports.Platform = Platform;
