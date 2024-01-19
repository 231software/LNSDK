import * as fs from 'fs'
import * as child_process from 'child_process'
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

console.log("生成tsconfig.json");
const tsconfig={
    exclude: ["./v0/**", "./dist/**"],
    compilerOptions: {
      outDir: "./"+CONF.build_dir,
      rootDir: ".",
      resolveJsonModule: true
    }
}
const tsconfigfile=fs.openSync("tsconfig.json","w+");
fs.writeFileSync("tsconfig.json",JSON.stringify(tsconfig,undefined,4));
fs.close(tsconfigfile);

console.log("生成index.ts")
const indexfile=fs.openSync("index.ts","w+")
fs.writeFileSync("index.ts",`import "./${CONF.src_dir}/${CONF.main}.ts"`);
fs.close(indexfile);

console.log(fs.readFileSync("index.ts").toString());

console.log("编译插件（必须放前面，因为需要用这步清理构建目录）");
child_process.spawnSync("tsc")

console.log("生成适用npm，LLSE，LeviScript，BDSX的package.json");
const npm_package={
    name:CONF.name,
    main:CONF.main+".js",
    dependencies:CONF.dependencies,
    description:CONF.description
}
const npmpkgfile=fs.openSync(CONF.build_dir+"/package.json","w+");
fs.writeFileSync(CONF.build_dir+"/package.json",JSON.stringify(npm_package,undefined,4));
fs.close(npmpkgfile);

console.log("清理目录");
fs.unlinkSync("tsconfig.json")
fs.unlinkSync("index.ts")
fs.unlinkSync(CONF.build_dir+"/build.js")