"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptDone = exports.onInit = void 0;
var Platform_1 = require("./Platform");
var ScriptDone = function () { };
exports.ScriptDone = ScriptDone;
var InitEvent = /** @class */ (function () {
    function InitEvent() {
    }
    return InitEvent;
}());
function onInit(callback) {
    switch (Platform_1.Platform.getType()) {
        case Platform_1.SupportedPlatforms.LiteLoaderBDS:
            mc.listen("onServerStarted", function () {
                callback(new InitEvent());
            });
            break;
        case Platform_1.SupportedPlatforms.NodeJS:
            exports.ScriptDone = ScriptDone = function () {
                callback(new InitEvent());
            };
            break;
    }
}
exports.onInit = onInit;
