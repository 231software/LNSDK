const fs=require("fs")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/llse/js")
const manifestFile=fs.openSync("manifest.json","w+")
const llmanifest={
    //levilamina要求插件名必须与插件目录相同，此处只好取插件目录名
    name:plugin_info.plugin_conf.plugin_dir_name,
    entry:plugin_info.plugin_conf.main+".js",
    type:"lse-nodejs",
    dependencies:[
        {
            name:"legacy-script-engine-nodejs"
        }
    ]
}
llmanifest.author=plugin_info.plugin_conf.author
llmanifest.description=plugin_info.plugin_conf.description
fs.writeFileSync("manifest.json",JSON.stringify(llmanifest,undefined,4))
fs.close(manifestFile)