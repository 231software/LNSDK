"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionStatus = exports.Version = void 0;
var Version = /** @class */ (function () {
    function Version() {
        this.major = 0;
        this.minor = 0;
        this.revision = 1;
        this.versionStatus = VersionStatus.Dev;
    }
    return Version;
}());
exports.Version = Version;
var VersionStatus;
(function (VersionStatus) {
    VersionStatus[VersionStatus["Release"] = 0] = "Release";
    VersionStatus[VersionStatus["Beta"] = 1] = "Beta";
    VersionStatus[VersionStatus["Alpha"] = 2] = "Alpha";
    VersionStatus[VersionStatus["Dev"] = 3] = "Dev";
})(VersionStatus || (exports.VersionStatus = VersionStatus = {}));
