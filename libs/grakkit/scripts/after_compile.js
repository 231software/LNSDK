const fs=require("fs")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/grakkit/js")
const manifestFile=fs.openSync("manifest.json","w+")
//manifest内容与lse平台的大致相同
const llmanifest={
    name:plugin_info.plugin_conf.name,
    entry:plugin_info.plugin_conf.main+".js",
    // dependencies:[
    //     {
    //         name:"legacy-script-engine-nodejs"
    //     }
    // ]
}
llmanifest.author=plugin_info.plugin_conf.author
llmanifest.description=plugin_info.plugin_conf.description
fs.writeFileSync("manifest.json",JSON.stringify(llmanifest,undefined,4))
fs.close(manifestFile)