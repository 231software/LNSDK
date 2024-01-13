"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LNLogger = void 0;
var Platform_1 = require("./Platform");
var LNLogger = /** @class */ (function () {
    function LNLogger() {
    }
    LNLogger.parseParams = function (params) {
        var msg = "";
        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
            var arg = params_1[_i];
            msg = msg + arg.toString() + " ";
        }
        return msg;
    };
    LNLogger.info = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var msg = this.parseParams(message);
        switch (Platform_1.Platform.getType()) {
            case Platform_1.SupportedPlatforms.LiteLoaderBDS:
                logger.info(msg);
                break;
            case Platform_1.SupportedPlatforms.NodeJS:
                console.log(msg);
                break;
        }
    };
    return LNLogger;
}());
exports.LNLogger = LNLogger;
