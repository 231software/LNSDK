import * as fs from 'fs'
import * as child_process from 'child_process'
import * as yaml from 'yaml'


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
            isNodeJS:true,
            lib:"nolib"
        },
    ],
    [
        "LiteLoaderBDS",{
            isNodeJS:true,
            unsupported_packages:[
                "sqlite3",
                "better-sqlite3"
            ],
            lib:"nolib"
        }        
    ],
    [
        "LLSELib",{
            isNodeJS:false,
            lib:"llselib"
        }        
    ],
    [
        "bdsx",{
            isNodeJS:true,
            unsupported_packages:[
                "sqlite3"
            ],
            lib:"bdsx"
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
/**
 * 切换至指定库
 * @param lib 要切换到的库的名称，必须位于libs且包含lib
 */
function switchToLib(lib:string){
    //将原库文件移动到nolib
    fs.renameSync("lib","libs/nolib/lib");
    //将要切换到的库文件
    fs.renameSync("libs/"+lib+"/lib","lib");
}
function switchBack(lib:string){
    //将切换过的库移动到原位置
    fs.renameSync("lib","libs/"+lib+"/lib");
    //将nolib中的默认库移到原位
    fs.renameSync("libs/nolib/lib","lib");
}


//对每种平台都单独构建一次
for(let platform of PlatformsList.keys()){
    /**各平台的构建配置，直接写在该文件中 */
    let platformConf:any=PlatformsList.get(platform)
    /**本次构建目标 */
    let target_dir:string=CONF.build_dir+"/"+platform+"/";
    //LLSELib需要在前面加@
    if(platform=="LLSELib")target_dir=target_dir+"@"+CONF.build_dir;
    else target_dir=target_dir+CONF.build_dir
    console.log(`为平台${platform}生成`)
    //切换库，切换之后还要在循环最后切换回来
    //nolib为默认库，无需切换
    if(platformConf.lib=="nolib"){}
    else{
        switchToLib(platformConf.lib);
    }

    //开始使用库构建
    console.log("生成tsconfig.json");
    let tsconfig:any={
        //忽略libs
        exclude: ["./v0/**", "./dist/**","libs"],
        compilerOptions: {
            outDir: "./"+target_dir,
            rootDir: ".",
            resolveJsonModule: true,
            downlevelIteration: true,
            // https://www.jianshu.com/p/359c71344084
            forceConsistentCasingInFileNames:false
        }
    }
    //llse-lib添加以下两项
    if(platform=="LLSELib"){
        tsconfig.compilerOptions.moduleResolution="node";
        tsconfig.compilerOptions.target="es2015";
    }
    writeFiles(["tsconfig.json"],JSON.stringify(tsconfig,undefined,4))    

    //index.js的作用：require入口文件，提供配置文件，并在nodejs环境下触发onInit事件
    //pnx-js情况特殊，import要带后缀
    //${platform=="LLSELib"?".js":""}
    //ScriptDone是用于触发onInit事件的，如果有平台不支持在引入的其他模块中注册onInit事件或根本没有onInit，就需要触发ScriptDone
    //只有nodejs环境才能去触发ScriptDone，其他环境直接触发ScriptDone可能出问题
    console.log("生成index.ts")
    writeFiles(["index.ts"],`
    import "./${CONF.src_dir}/${CONF.main}.js";
    import {ScriptDone} from "./lib/Events/Process.js";
    ${platform=="NodeJS"?"ScriptDone()":""};
    export function main(){
        ScriptDone();
    }
    `)
    console.log("生成plugin_config.js（插件配置文件）")
    writeFiles(["lib/plugin_config.ts"],`export const LNCONF:any=${JSON.stringify(CONF,undefined,4)}`);
    console.log("编译插件（必须放前面，因为需要用这步清理构建目录）");
    let task=child_process.spawnSync("tsc")
    console.log("编译结果：\n"+task.stdout.toString())
    //

    console.log("生成适用各平台必要的配置文件");
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
    else{
        if(platform=="LLSELib"){
            console.log("生成适用于LLSELib的plugin.yml");
            let llselibpluginyml:any={
                name:CONF.name,
                main:CONF.main+".js",
                load:"POSTWORLD",
                description:CONF.description,
                //PNX后续如果API有变，需要在此处加判断
                api: [ "1.0.14" ]
            }
            writeFiles([target_dir+"/plugin.yml"],yaml.stringify(llselibpluginyml))
        }
    }

    console.log("清理目录");
    delFiles([
        "tsconfig.json",
        "index.ts",
        target_dir+"/build.js",//编译插件的时候会再次编译build.ts并在插件目录再次留下一个build.js
        "build.js",
        "lib/plugin_config.ts"//这个ts不是源码，是自动生成的插件配置文件
    ])
    console.log("-----------------------")

    console.log("正在切换库")
    if(platformConf.lib=="nolib"){}
    else{
        switchBack(platformConf.lib);
    }
}

