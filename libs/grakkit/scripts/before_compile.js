const coreDefinitionCode=`declare const core:{
    type:(...args)=>any,
    event:(...args)=>any
};`
const fs=require("fs")
const fsp=require("fs/promises")
const path=require("path")
const plugin_info=JSON.parse(Buffer.from((process.argv[2]),"base64").toString("utf-8"))
process.chdir("temp/build/grakkit/lib")
const stdlib_paper_RegExp=/import *\{.*\} *from +"@grakkit\/stdlib-paper"/g
const types_paper_RegExp=/import *\{(.*?)\} *from +"@grakkit\/types-paper"/gs
//扫描lib里面所有的文件，把所有的从types的导入全换成any
traverseDirectory("./",async path=>{
    //跳过非ts后缀的文件
    if(path.match(/.+\.ts$/g)===null)return;
    //读出文件内容
    const fileContent=(await fsp.readFile(path)).toString()
    //替换文件里所有符合特征的导入
    const modifiedFileContent=
        //如果没有引入grakkit/stdlib-paper就定义全局变量core
        (fileContent.match(stdlib_paper_RegExp)===null?coreDefinitionCode:"")
        +fileContent
            .replaceAll(stdlib_paper_RegExp,coreDefinitionCode)
            .replace(types_paper_RegExp,(()=>{
                const match=types_paper_RegExp.exec(fileContent)
                if(!match)return ""
                if(!match[1])return ""
                if(/\{|\}/gs.test(match[1]))return ""
                return match[1].split(/[\s\n\r]*,[\s\n\r]*/).map(v=>{
                    return `declare const ${v.trim()}:any;
                    type ${v.trim()}=any;
                    
                    `
                }).join("")
            })())
    // if(new RegExp(/.+Process\.ts$/g).test(path))console.log(modifiedFileContent)
    // if(new RegExp(/.+Dimension\.ts$/g).test(path))console.log(modifiedFileContent)
    //替换文件内容
    await fsp.writeFile(path,modifiedFileContent)
})




async function traverseDirectory(dir, callback){
    try{
        await fsp.access(dir)
    }
    catch(e){
        console.error(`路径不存在或无权访问: ${dir}`);
        return;
    }

    const entries = await fsp.readdir(dir);

    await Promise.all(entries.map(async entry => {
        const fullPath = path.join(dir, entry);
        const stats = await fsp.stat(fullPath);

        if (stats.isDirectory()) {
            // 如果是文件夹，则递归调用该函数
            traverseDirectory(fullPath, callback);
        } else {
            // 如果是文件，则异步调用回调函数
            callback(fullPath);
        }
    }));
}




// const fileContent=fs.readFileSync("index.ts").toString()
// const matchLibResult=fileContent.match(/\/\/grakkit import >>.*\/\/grakkit import <</s)
// if(matchLibResult===null)process.exit(0)
// const matchLibPattern=matchLibResult[0]
// const indexFile=fs.openSync("./index.ts","w+")
// fs.writeFileSync(indexFile,fileContent.replace(matchLibPattern,"export const core"))
// // console.log(matchLibPattern)
// console.log(fs.readFileSync("../tsconfig.json").toString())


// const anyExportFile=`
// // grakkit-shims.d.ts
// declare module '@grakkit/stdlib-paper' {
//   const value: any;
//   export = value;
// }

// declare module '@grakkit/types-paper' {
//   const value: any;
//   export = value;
// }
// `;