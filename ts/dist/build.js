"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var child_proces = require("child_process");
/*
构建方式：编译此目录下build.ts并运行build.js
build.js运行结束后，会直接删除自己
*/
child_proces.spawn("tsc");
//自我删除
fs.unlink("build.js", function (err) {
    if (err) {
        if (err.code != "ENOENT")
            return console.error(err);
    }
});
