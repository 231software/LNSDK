"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LNSDKT_1 = require("./lib/LNSDKT");
var Event = require("./lib/Events");
Event.onInit(function (e) {
    LNSDKT_1.LNLogger.info(1, 2, 3, 4, 5, 6);
});
