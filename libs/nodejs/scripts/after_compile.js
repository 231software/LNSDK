const fs=require("fs")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/nodejs/js")