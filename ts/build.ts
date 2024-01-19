import * as fs from 'fs';
import * as child_process from 'child_process';
/*
构建方式：编译此目录下build.ts并运行build.js
build.js运行结束后，会直接删除自己
*/
//编译，使用exec会导致tsc不使用tsconfig.json
//child_process.spawn("tsc")
//读取配置文件
const CONF=JSON.parse(fs.readFileSync("build.json").toString());
const DONT_COPY_LIST:Array<string>=CONF.dont_copy_list;
const SRC_DIR:string=CONF.src_dir
const BUILD_DIR=CONF.build_dir
//清空LNSDK文件夹
fs.readdir(BUILD_DIR,(err,files)=>{
    if(!err)fs.rmdir(BUILD_DIR,(err)=>{})
})
//创建LNSDK文件夹
fs.readdir(BUILD_DIR,(err,files)=>{
    if(err)if(err.code=="ENOENT")fs.mkdir(BUILD_DIR,()=>{})
});
/*
LNSDK目录格式：
src：用户代码
lib：LNSDK的库文件
build.ts：编译运行此文件来构建
tsconfig.json：构建时让tsc读取的配置文件
*/
//将项目的ts/dist/src文件夹下除了index.ts外所有文件放入LNSDK
/** 本次构建复制的文件列表 */
let copied_list=[]
fs.readdir(SRC_DIR,(err,files)=>{
    for(let file of files){
        //不复制排除掉的文件
        if(DONT_COPY_LIST.includes(file))continue
        fs.cp(SRC_DIR+"/"+file,BUILD_DIR+"/"+file, { recursive: true }, (err) => {
            if(err)console.error(err);
        });
    }
})
  
//将LNSDK文件夹所有文件压缩以创建发行版
//自我删除
fs.unlink("build.js",(err)=>{
    if (err) {
        if(err.code!="ENOENT")return console.error(err);
    }
});