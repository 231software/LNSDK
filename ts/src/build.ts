const fs=require('fs')
const child_process=require('child_process')

enum LNSupportedPlatforms{
    Unsupported=0,
    NodeJS,
    LiteLoaderBDS,
    LeviScript,
    GMLib,
    LLSE_Lib,
    BDSX
}
const PlatformsList=new Map([
    [
        "NodeJS",{
            isNodeJS:true
        }    
    ],
    [
        "LiteLoaderBDS",{
            isNodeJS:true,
            unsupported_packages:[
                "sqlite3",
                "better-sqlite3"
            ]
        }        
    ]

])

//读取配置文件
const CONF=JSON.parse(fs.readFileSync("plugin.json").toString());
//补全配置文件和读取配置项
if(!CONF.build_dir)CONF.build_dir="dist"
if(!CONF.src_dir)CONF.src_dir="src"
/*
//清空构建文件夹
fs.readdir(CONF.build_dir,(err,files)=>{
    if(!err)fs.rmdir(CONF.build_dir,(err)=>{})
})
//创建构建文件夹
fs.readdir(CONF.build_dir,(err,files)=>{
    if(err)if(err.code=="ENOENT")fs.mkdir(CONF.build_dir,()=>{})
});
*/

/**
 * 将文件一次性写入所有提供的路径，文件不存在则创建
 * @param paths 所有要写入的路径
 */
function writeFiles(paths:Array<string>,content:string){
    for(let path of paths){
        const tsconfigfile=fs.openSync(path,"w+");
        fs.writeFileSync(path,content);
        fs.close(tsconfigfile);        
    }

}
function delFiles(paths:Array<string>){
    for(let path of paths){
        try{
            fs.unlinkSync(path);
        }
        catch(e){
        }
    }
}

//对每种平台都单独构建一次
for(let platform of PlatformsList.keys()){
    const target_dir=CONF.build_dir+"/"+platform+"/"+CONF.build_dir
    console.log(`为平台${platform}生成`)
    console.log("生成tsconfig.json");

    //NodeJS
    let tsconfig={
        exclude: ["./v0/**", "./dist/**"],
        compilerOptions: {
        outDir: "./"+target_dir,
        rootDir: ".",
        resolveJsonModule: true,
        downlevelIteration: true,
        // https://www.jianshu.com/p/359c71344084
        forceConsistentCasingInFileNames:false
        }
    }
    writeFiles(["tsconfig.json"],JSON.stringify(tsconfig,undefined,4))    

    //index.js的作用：require入口文件，提供配置文件，并在nodejs环境下触发
    console.log("生成index.ts")
    writeFiles(["index.ts"],`
    export const LNCONF=JSON.parse('${JSON.stringify(CONF)}');
    import "./${CONF.src_dir}/${CONF.main}";
    import {ScriptDone} from "./lib/Events/Process";
    ScriptDone();
    `)
    /*
    const indexfile=fs.openSync("index.ts","w+")
    fs.writeFileSync("index.ts",`import "./${CONF.src_dir}/${CONF.main}"`);
    fs.close(indexfile);*/
    console.log("编译插件（必须放前面，因为需要用这步清理构建目录）");
    let task=child_process.spawnSync("tsc")
    console.log("编译结果：\n"+task.stdout.toString())
    //
    //console.log("生成适用npm，LLSE，LeviScript，BDSX的package.json");
    let platformConf:any=PlatformsList.get(platform)
    if(platformConf.isNodeJS){
        console.log(`生成适用${platform}的package.json`);
        const npm_package={
            name:CONF.name,
            main:CONF.main+".js",
            dependencies:undefined,
            description:CONF.description
        }
        //处理各平台无法运行的包
        if(CONF.dependencies){
            const dependencies=CONF.dependencies;
            if(platformConf.unsupported_packages){
                for(let unsupported_package of platformConf.unsupported_packages){
                    delete dependencies[unsupported_package];
                }
            }
            //如果该平台不支持任何提供的包，直接不添加dependencies项以防出错
            if(Object.keys(dependencies).length!=0){
                npm_package.dependencies=dependencies;
            }
        }

        writeFiles([target_dir+"/package.json"],JSON.stringify(npm_package,undefined,4))
        /*
        const npmpkgfile=fs.openSync(CONF.build_dir+"/package.json","w+");
        fs.writeFileSync(CONF.build_dir+"/package.json",JSON.stringify(npm_package,undefined,4));
        fs.close(npmpkgfile);*/
    }


    console.log("清理目录");
    //fs.unlinkSync()
    delFiles(["tsconfig.json","index.ts",target_dir+"/build.js","build.js"])
    console.log("-----------------------")
}

