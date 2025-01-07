import * as fs from 'fs';
import * as child_process from 'child_process';
//忽略libs文件夹
//https://deepinout.com/typescript/typescript-questions/651_typescript_how_to_ignore_some_files_when_running_type_checking_some_files_using_tsc.html#:~:text=除了使用tsconfig.json文件中的exclude和include选项进行文件忽略外，我们还可以使用js规则文件来指定要忽略的文件%E3%80%82%20我们可以在项目的根目录下创建一个名为”tsconfig.ignore.js”的js规则文件，并在其中导出一个忽略规则函数%E3%80%82,忽略规则函数接受一个参数，该参数是当前要检查的文件的绝对路径%E3%80%82%20我们可以在规则函数中返回true来指示tsc忽略该文件，返回false则表示对该文件进行类型检查%E3%80%82
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
//清空LNSDK文件夹，改同步
fs.readdir(BUILD_DIR,(err,files)=>{
    if(!err)fs.rmdir(BUILD_DIR,(err)=>{})
})
//创建LNSDK文件夹，改同步
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

//删除目标中的LLSELib
  
//将LNSDK文件夹所有文件压缩以创建发行版
//自我删除
fs.unlink("build.js",(err)=>{
    if (err) {
        if(err.code!="ENOENT")return console.error(err);
    }
});