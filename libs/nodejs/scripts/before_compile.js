const fs=require("fs")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/nodejs")
// 我们需要在package.json中加上type module，而且得是在编译之前就加的
addTypeModule("package.json")
addTypeModule("js/package.json")
function addTypeModule(path){
    const packagejsonstr=fs.readFileSync(path)
    const packagejson=JSON.parse(packagejsonstr)
    packagejson.type="module"
    fs.writeFileSync(path,JSON.stringify(packagejson,undefined,4))
}