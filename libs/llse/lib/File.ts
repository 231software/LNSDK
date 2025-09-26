/// <reference path="./HelperLib/SystemAPI/File.d.ts" />
import { execSync } from "child_process";
import { FMPLogger } from "./Logger";
import * as afs from "fs/promises";
const onWindows=process.platform === 'win32'

export class FMPFile{
    static async ls(path:string):Promise<string[]>{
        try{
            return afs.readdir(path)
        }
        catch(e){
            //FMPLogger.error(e);
            throw new Error("无法列出"+path+"中的文件！\nnodejs报错：\n"+e)
        }
    }
    /**
     * 新建文件夹  
     * 如果当前目录已有同名文件夹，则不执行任何操作
     * @param path 要新建的文件夹的路径，如果要在程序当前工作目录下新建，直接传入文件夹名即可
     */
    static async initDir(path:string){
        try{
            await afs.readdir(path);
        }
        catch(e){
            try{
                await afs.mkdir(path);
            }
            catch(e){
                //如果创建失败，他会去掉最后一个文件夹后重新尝试创建
                FMPLogger.warn("文件夹创建失败！原因："+e)
                FMPLogger.info("尝试从上一层文件夹开始创建")
                const dir=new FMPDirectory(path);
                dir.folders.pop()//去掉最后一个文件夹
                FMPFile.initDir(dir.toString(onWindows))//尝试初始化外面一层的文件夹，如果这层失败了，他会递归回到上面那里再去掉一层文件夹
                FMPFile.initDir(path)
            }
        }
    }
    /**
     * 新建文件  
     * 如果当前目录已有同名文件，则不执行任何操作
     * @param path 要新建的文件夹的路径，如果要在程序当前工作目录下新建，直接传入文件夹名即可
     */
    static async initFile(path:string){
        try{
            await afs.readFile(path)
        }
        catch(e){
            //这里必须先将文件所在的目录初始化出来
            const dir=new FMPDirectory(path)
            dir.folders.pop()
            await FMPFile.initDir(dir.toString(onWindows))
            const newFile=await afs.open(path,"a")
            //打开文件后必须关闭
            await newFile.close()
        }
    }
    /**
     * 同步读取并返回文件的全部内容  
     * 请勿使用此方法读取大文件，否则会导致读取过程中服务器卡顿甚至无响应（假死）
     * @param path 文件路径
     * @returns 文件内容
     */
    static async read(path:string):Promise<string>{
        try{
            return (await afs.readFile(path)).toString();
        }
        catch(e){
            throw new Error("读取文件时发生错误！错误消息为：\n"+e);
        }
    }
    /**
     * 复制一个文件和文件夹  
     * 
     * 示例1：
     * ```ts
     * //将test.txt从folder1中移动到folder2中
     * File.copy("folder1/test.txt","folder2/test.txt")
     * ```
     * 示例2：
     * ```ts
     * //工作目录位于 上级目录/folder1中
     * //移动前：
     * //上级目录
     * // - folder
     * //   - test.txt
     * // - folder1
     * //   - folder2
     * File.copy("test.txt","../folder1/folder2/text.txt")
     * //移动后：
     * //上级目录
     * // - folder
     * // - folder1
     * //   - folder2
     * //     - test.txt
     * ```
     * 示例3（重命名）：
     * ```ts
     * //将当前文件夹中的test.txt重命名为options.txt
     * File.copy("test.txt","options.txt")
     * ```
     * 示例4（移动和重命名一次性同时做完）：
     * ```ts
     * //工作目录位于 上级目录/folder1中
     * //还需要将test.txt重命名为options.txt
     * //移动前：
     * //上级目录
     * // - folder
     * //   - test.txt
     * // - folder1
     * //   - folder2
     * File.copy("test.txt","../folder1/folder2/options.txt")
     * //移动后：
     * //上级目录
     * // - folder
     * // - folder1
     * //   - folder2
     * //     - options.txt
     * ```
     * @param source 要被复制的文件名文件夹
     * @param destination 要复制到的目标
     */
    static async copy(source:string,destination:string,options:{
        /**如果文件或文件夹同名，则跳过 */
        skipSameName?:boolean,
        /**如果文件同名则跳过，对文件夹行为无影响 */
        skipSameNameFiles?:boolean,
        /**替换同名文件，对文件夹行为无影响 */
        replaceFiles?:boolean,
        /**同名文件夹自动合并 */
        merge?:true,
        /**替换同名文件夹 */
        replaceFolder?:true
    }={}){      
        let errorText="Error(s) occured while copying files!"
        try{
            //检查是否已存在同名文件
            //解析出目标文件夹的上级目录
            const targetDir=new FMPDirectory(destination)
            if(targetDir.folders.length==0)throw new Error("目前LNSDK的nodejs还不支持拷贝到当前目录，请联系LNSDK开发者寻求帮助")
            const targetFileName=targetDir.folders.pop()
            if(targetFileName==undefined)throw new Error("multiple errors occured:\nFile can't be copied: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons.")
            //targetDir.folders.push(targetFileName,"..")//这行代码不知道有什么用，但他会在macOS上造成错误
            
            //文件已存在
            if((await FMPFile.ls(targetDir.toString(onWindows))).includes(targetFileName)){
                if(await FMPFile.isFile(source)){
                    
                    //设置了跳过同名文件
                    if(options.skipSameNameFiles||options.skipSameName==true)return;
                    //设置了替换同名文件
                    if(options.replaceFiles==true){
                        await afs.cp(source,destination)
                        //任务完成，结束
                        return
                    }
                    //什么都没有设置，根本无从得知用户在文件冲突时要如何操作，直接报错（相当于取消移动）
                    throw new Error("A File with the same name already exists in the target directory, this file can't be copied.\nYou can solve this error by setting skipSameNameFiles (skip when this happens) or replaceFiles (discard the file in the target directory by replacing) to 'true'")
                }
                if(await FMPFile.isFolder(source)){
                    //如果是文件夹，进入下面的复制文件夹环节
                    //设置了存在同名文件则跳过，因为此处已经是同名文件的情况了，就直接跳过
                    if(options.skipSameName==true)return
                    //设置了合并文件夹
                    if(options.merge==true){
                        //遍历原目录中已有的文件，递归地移动每个文件
                        try{
                            for(let file of await FMPFile.ls(source)){
                                const dir=new FMPDirectory(source)
                                dir.folders.push(file)
                                const targetDir=new FMPDirectory(destination)
                                targetDir.folders.push(file)
                                FMPFile.copy(dir.toString(onWindows),targetDir.toString(onWindows),options)
                            }                            
                        }
                        catch(e){
                            throw new Error("Can't merge folders: "+e)
                        }
                        return
                    }
                    //设置了替换文件夹
                    else if(options.replaceFolder==true){
                        //删除目标已存在的文件
                        FMPFile.permanentlyDelete(destination)
                        //再重新移动一遍
                        FMPFile.copy(source,destination,options)
                        return
                    }

                    
                    //能够处理的异常会被上面的流程控制全部跳过，无法跳过的才会到这里，并加入下面的异常
                    errorText=errorText+"\nSome files already exist in the target directory, these conflicts prevented copying."
                }
            }
            //文件不存在的话，会正常地执行下面的移动
            await afs.cp(source,destination,{recursive:true})
        }
        catch(e:any){
            //由于内层抛出的错误一定是Error类型及其子类，所以此处不检查类型
            //其他无法处理的错误，会直接报错，抛出错误
            e.message=errorText+"\nnodejs error logs：\n"+e
            throw e;
        }
    }
    /**
     * 强制向文件内写入文本内容，无视其中是否有内容、格式是否为文本文件  
     * 请不要依赖此API对所有文件执行写入操作，由于写入时没有判断，操作不当可能会造成数据丢失或程序运行出现错误
     * @param path 要写入的文件的路径
     * @param content 要写入的内容
     */
    static async forceWrite(path:string,content:string){
        const target=await afs.open(path,"w+");
        try{
            await afs.writeFile(path,content);
        }
        catch(e:any){
            e.message="Couldn't write file"+path+", nodejs error: "+e
            throw e;
        }
        finally{
            await target.close()
        }
    }
    /**
     * 重命名或移动一个文件  
     * 要移动文件，修改其路径即可  
     * 示例1：
     * ```ts
     * //将test.txt从folder1中移动到folder2中
     * File.rename("folder1/test.txt","folder2/test.txt")
     * ```
     * 示例2：
     * ```ts
     * //工作目录位于 上级目录/folder1中
     * //移动前：
     * //上级目录
     * // - folder
     * //   - test.txt
     * // - folder1
     * //   - folder2
     * File.rename("test.txt","../folder1/folder2/text.txt")
     * //移动后：
     * //上级目录
     * // - folder
     * // - folder1
     * //   - folder2
     * //     - test.txt
     * ```
     * 示例3（重命名）：
     * ```ts
     * //将当前文件夹中的test.txt重命名为options.txt
     * File.rename("test.txt","options.txt")
     * ```
     * 示例4（移动和重命名一次性同时做完）：
     * ```ts
     * //工作目录位于 上级目录/folder1中
     * //还需要将test.txt重命名为options.txt
     * //移动前：
     * //上级目录
     * // - folder
     * //   - test.txt
     * // - folder1
     * //   - folder2
     * File.rename("test.txt","../folder1/folder2/options.txt")
     * //移动后：
     * //上级目录
     * // - folder
     * // - folder1
     * //   - folder2
     * //     - options.txt
     * ```
     * 
     * 
     * @param path 文件路径
     * @param target 重命名后的文件名（路径）
     * @param options 移动文件的行为设置
     */
    static async rename(path:string,target:string,options:{
        /**如果文件或文件夹同名，则跳过 */
        skipSameName?:boolean,
        /**如果文件同名则跳过，对文件夹行为无影响 */
        skipSameNameFiles?:boolean,
        /**替换同名文件，对文件夹行为无影响 */
        replaceFiles?:boolean,
        /**同名文件夹自动合并 */
        merge?:true,
        /**替换同名文件夹 */
        replaceFolder?:true
    }={}){
        let errorText="Error(s) occured while renaming files!"
        try{
            if(await FMPFile.isFile(path)){
                //检查是否已存在同名文件
                //解析出目标文件夹的上级目录
                const targetDir=new FMPDirectory(target)
                const targetFileName=targetDir.folders.pop()
                if(targetFileName==undefined)throw new Error("multiple errors occured:\nFile can't be renamed: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons.")
                //targetDir.folders.push(targetFileName,"..")//这行代码不知道有什么用，但他会在macOS上造成错误
                
                //文件已存在
                if((await FMPFile.ls(targetDir.toString(onWindows))).includes(targetFileName)){
                    //设置了跳过同名文件
                    if(options.skipSameNameFiles||options.skipSameName==true)return;
                    //设置了替换同名文件
                    if(options.replaceFiles==true){
                        //windows上不能这么移动，会被windows系统阻止，但类unix系统（macos和linux）是可以的
                        //所以需要先判断是不是Windows系统，如果是的话就需要先删除原文件再放入新文件
                        if(onWindows){
                            //windows系统下直接删除文件也不能马上删除，所以这里调用了cmd来删除，并通过execSync别死主线程强行等待文件删除
                            execSync("del /F "+new FMPDirectory(target).toString(true))
                        }
                        await afs.rename(path,target)
                        //任务完成，结束
                        return
                    }
                    //什么都没有设置，根本无从得知用户在文件冲突时要如何操作，直接报错（相当于取消移动）
                    throw new Error("A File with the same name already exists in the target directory, this file can't be moved.\nYou can solve this error by setting skipSameNameFiles (skip when this happens) or replaceFiles (discard the file in the target directory by replacing) to 'true'")
                }
                //文件不存在的话，会正常地执行下面的移动
            }
            await afs.rename(path,target);
        }
        catch(e:any){
            //当错误为EPERM时，检测是否是因为文件夹冲突；文件冲突已在上方解决
            if(e.code==="EPERM"){
            
                //解析出目标文件夹的上级目录
                const targetDir=new FMPDirectory(target)
                if(targetDir.folders.length==0)throw new Error("目前LNSDK的nodejs还不支持拷贝到当前目录，请联系LNSDK开发者寻求帮助")
                const targetFileName=targetDir.folders.pop()
                if(targetFileName==undefined)throw new Error("multiple errors occured:\nFile can't be renamed: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons.")    
                //targetDir.folders.push(targetFileName,"..")//这行代码不知道有什么用，但他会在macOS上造成错误
                //文件已存在
                if((await FMPFile.ls(targetDir.toString(onWindows))).includes(targetFileName)){
                    //设置了存在同名文件则跳过，因为此处已经是同名文件的情况了，就直接跳过
                    if(options.skipSameName==true)return
                    //设置了合并文件夹
                    if(options.merge==true){
                        //遍历原目录中已有的文件，递归地移动每个文件
                        for(let file of await FMPFile.ls(path)){
                            const dir=new FMPDirectory(path)
                            dir.folders.push(file)
                            const targetDir=new FMPDirectory(target)
                            targetDir.folders.push(file)
                            FMPFile.rename(dir.toString(onWindows),targetDir.toString(onWindows),options)
                        }
                        return
                    }
                    //设置了替换文件夹
                    else if(options.replaceFolder==true){
                        //删除目标已存在的文件
                        FMPFile.permanentlyDelete(target)
                        //再重新移动一遍
                        FMPFile.rename(path,target,options)
                        return
                    }

                }
                //能够处理的异常会被上面的流程控制全部跳过，无法跳过的才会到这里，并加入下面的异常
                errorText=errorText+"\nSome files already exist in the target directory, these conflicts prevented renaming."
            }
            
            e.message=errorText+"\nnodejs error logs：\n"+e
            throw e;
        }
    }
    /**
     * 永久删除一个文件或文件夹，不放入系统回收站  
     * 尽量不使用此方法，文件删除后无法恢复，有数据安全隐患
     * @param path 文件或文件夹路径
     */
    static async permanentlyDelete(path:string){
        //macos此处报错，可能是找不到文件
        try{
            const file_stat=await afs.stat(path)
        try{
            if(file_stat.isFile()){
                if(onWindows)execSync("del /F "+new FMPDirectory(path).toString(true))//windows系统要同步删除文件只能调命令行
                else await afs.unlink(path);
            }
            else if(file_stat.isDirectory()){
                //清空文件夹
                for(let filename of await FMPFile.ls(path)){
                    await FMPFile.permanentlyDelete(path+"/"+filename);
                }
                //删除文件夹
                if(onWindows)execSync("rd /Q "+new FMPDirectory(path).toString(true))//windows系统要同步删除文件只能调命令行
                else await afs.rmdir(path);
            }
        }
        catch(e){
            throw new Error("Can't delete file"+path+": Error(s) occured while removing Files: "+e)
        }
        }
        catch(e:any){
            throw new Error("Can't delete file "+path+"\ncode: "+e.code+"\nreason: "+e)
        }
    }
    /**
     * 是否是文件夹
     * @param path 路径
     * @returns 检查结果
     */
    static async isFolder(path:string){
        const stat=await afs.lstat(path)
        return stat.isDirectory()
    }
    /**
     * 是否是文件
     * @param path 路径
     * @returns 检查结果
     */
    static async isFile(path:string){
        const stat=await afs.lstat(path)
        return stat.isFile()
    }
}
export class FMPDirectory{
    folders:string[];
    constructor(dir:string){
        this.folders=dir.split(/[/|\\]/);
        if(this.folders.includes("..")&&this.folders.length>1)throw new Error("路径中包含..时，必须仅包含这一个目录。目前LNSDK还无法修复该问题。")
    }
    /**
     * 向上一级
     */
    up(){
        //对于位于目录中的位置，直接去掉位于最后的目录
        if(this.folders.length>0)this.folders.pop()
        else this.folders.push("..")
    }
    toString(backslash=false):string{
        let target:string="";
        for(let i in this.folders){
            target=target+this.folders[i];
            if(Number(i)!=this.folders.length-1){
                target=target+(backslash?"\\":"/");
            }
        }
        return target;
    }
}
export class JSONFile{
    fileContent="";
    path:string;
    objpath:string[];
    rootobj:any;
    private constructor(path: string, objpath: string[], rootobj: any) {
        this.path = path;
        this.objpath = objpath;
        this.rootobj = rootobj;
    }
    /**
     * 
     * @param {string} path 文件路径
     * @param {Array<string>} objpath 在JSON文件内部的路径
     */
    static async create(path:string,objpath:string[]=[]){
        //先把文件建出来
        await FMPFile.initFile(path);
        //如果文件中事先没有内容，先在文件中写上一个大括号来保证后续顺利读取
        if((await FMPFile.read(path)).length==0)await FMPFile.forceWrite(path,"{}");
        const rootobj=JSON.parse(await FMPFile.read(path));
        if(objpath.length!=0){
            const checkObjAvailable=(checkPath:any,index:number)=>{
                if(index>objpath.length-1){return;}
                //log(objpath[index])
                //log(typeof checkPath[objpath[index]])
                //log(checkPath[objpath[index]])
                //log(index)
                if(typeof checkPath[objpath[index]]!="object"){
                    let errorPath=objpath
                    errorPath.splice(index+1)
                    FMPLogger.error("Cannot generate in the path:"+JSON.stringify(errorPath))
                    return;
                }
                checkObjAvailable(checkPath[objpath[index]],index+1);
            }          
            checkObjAvailable(rootobj,0);//这里的递归只是起到一个检查的作用
        }
        return new JSONFile(path,objpath,rootobj)
    }
    /**
     * 初始化配置项，要求可以对嵌套着的对象初始化
     * @param key 键名
     * @param value 键值
     */
    async init(key:string,value:any){//重写只能放构造里面，放别的地方不行，我也不知道为啥
        if(this.get(key)===undefined){
            await this.set(key,value);
        }
        /*
        if(this.objpath.length==0){
            
        }
        else{
            let set=this.set//由于this.set传不进去initValue，所以在这里单独声明一个变量接力一下
            let get=this.get
            if(get(key)===undefined){
                set(key,value)
            }
        }*/
    }
    /**
     * 通过递归读取目标的值
     * @param {string} key 要读取的键值
     */
    get(key:string){
        let objpath=this.objpath;
        if(this.objpath.length==0){
            //log("从根目录直接获取值")
            return this.rootobj[key];
        }
        else{
            return getValue(this.rootobj,0);
        }
        /**
         * 专用来递归访问对象的函数
         * @param obj 
         * @param index 
         * @returns ？？这里好像写的有问题，但是竟然能运行  草，果然有问题，刚才就发现了
         */
        function getValue(obj:any,index:number):any{
            //log(objpath[index])
            //log("JsonFile "+index)
            if(index>=objpath.length-1){//length-1是最后一个元素的索引，如果到达这个索引，就证明应该读取这一级目录中的值了
                //log("JsonFile "+JSON.stringify(obj[objpath[index]]))
                //log("JsonFile "+JSON.stringify(obj[objpath[index]][key]))
                return obj[objpath[index]][key]
            }else{
                return getValue(obj[objpath[index]],index+1)
            }
        }
    }
    /**
     * 通过递归写入目标的值，不影响沿途其他键;
     * 这个过程仍会调用父类的get和set
     * @param key 键名
     * @param value 键值
     */
    async set(key:string,value:any){//set之后要把rootobj重新生成一下
        let result=true;
        let objpath=this.objpath
        let rootobj=this.rootobj
        let path=this.path;
        if(this.objpath.length==0)await setRoot(key,value)
        else{
            //log("输入set的："+JSON.stringify(setValue(rootobj,0,value)))
            //log(JSON.stringify(setValue(rootobj[objpath[0]],0,value)))
            result=await setRoot(this.objpath[0],setValue(this.rootobj[this.objpath[0]],0,value));                
        }
        async function setRoot(key:string,value:any):Promise<boolean>{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            await FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
            return true;
        }
        function setValue(obj:any,index:number,value:any){
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            //log(objpath[index])
            //log(obj)
            if(index>=objpath.length-1){
                let write=obj;
                //let shell;shell[objpath[0]]=fatherGet;
                write[key]=value;
                return write;
            }                
            else{//obj[objpath[index]]是传进去的，要被修改的部分
                let write=obj;
                write[objpath[index+1]]=setValue(obj[objpath[index+1]],index+1,value)
                //log(JSON.stringify(write,0,4))
                return write
            }
        } 
        await this.reload();
        return result;
    }
    /**
     * 删除当前json对象的一个键
     * @param key 要被删除的键
     * @returns 是否成功删除
     */
    async delete(key:string):Promise<boolean>{
        let result=true;
        let objpath=this.objpath
        let rootobj=this.rootobj
        let path=this.path;
        if(this.objpath.length==0){
            delete rootobj[key]
            await FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
            return true;
        }
        else{
            //log("输入set的："+JSON.stringify(setValue(rootobj,0,value)))
            //log(JSON.stringify(setValue(rootobj[objpath[0]],0,value)))
            result=await setRoot(this.objpath[0],deleteValue(this.rootobj[this.objpath[0]],0));                
        }
        async function setRoot(key:string,value:any):Promise<boolean>{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            await FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
            return true;
        }
        function deleteValue(obj:any,index:number){
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            //log(objpath[index])
            //log(obj)
            if(index>=objpath.length-1){
                let write=obj;
                //let shell;shell[objpath[0]]=fatherGet;
                delete write[key];
                return write;
            }                
            else{//obj[objpath[index]]是传进去的，要被修改的部分
                let write=obj;
                write[objpath[index+1]]=deleteValue(obj[objpath[index+1]],index+1)
                //log(JSON.stringify(write,0,4))
                return write
            }
        } 
        await this.reload();
        return result;
    }
    async reloadroot():Promise<boolean>{
        this.fileContent=await FMPFile.read(this.path)
        //由于this.fileContent的读取一定是在赋值之后，所以不需要担心它无初始值
        this.rootobj=JSON.parse(this.fileContent);
        return true;
        //this.keys=this.getAllKeys(this.rootobj);
    }
    /**
     * 重载当前配置文件  
     * JsonFile不会锁定文件或跟踪文件修改，因此如果用户或其他软件修改了文件，需要通过某种方式使当前插件调用这个reload刷新文件内容
     * @returns 是否重载成功
     */
    async reload():Promise<boolean>{
        return this.reloadroot();
    }
    async getAllKeys(obj:any,index=0):Promise<string[]>{
        if(this.objpath.length==0){
            return Object.keys(this.rootobj)
        }
        //log(JSON.stringify(obj[objpath[index]]))
        if(index>=this.objpath.length-1){//length-1是最后一个元素的索引，如果到达这个索引，就证明应该读取这一级目录中的值了
            
            return Object.keys(obj[this.objpath[index]])
        }else{
            return this.getAllKeys(obj[this.objpath[index]],index+1)
        }
    }        
    /**
     * 获取所有的键名 
     */
    async keys():Promise<string[]>{
        return this.getAllKeys(this.rootobj);//Object.keys(rootobj);
    }
    /*
    get obj():any{
        return this.rootobj;
    }*/
    static get version(){
        return "0.0.1";
    }
}

