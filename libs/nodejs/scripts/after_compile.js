const fs=require("fs")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/nodejs/js")
//我们需要在package.json中加上type module
const packagejsonstr=fs.readFileSync("package.json")
const packagejson=JSON.parse(packagejsonstr)
packagejson.type="module"
fs.writeFileSync("package.json",JSON.stringify(packagejson,undefined,4))