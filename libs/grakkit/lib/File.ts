import { FMPLogger } from "./Logger";
//文件读取使用java.nio.file，不使用nodejs的fs模块
const Bukkit=core.type("org.bukkit.Bukkit")
// const grakkit=Bukkit.getPluginManager().getPlugin("grakkit")
const Files=core.type("java.nio.file.Files")
const File=core.type("java.io.File")
const Paths=core.type("java.nio.file.Paths")
const FileWriter=core.type("java.io.FileWriter")
const StandardCopyOption=core.type("java.nio.file.StandardCopyOption")
const System=core.type("java.lang.System");

export class FMPFile{
    static ls(path:string):string[]{
        // FMPLogger.info(System.getProperty("user.dir"))
        // FMPLogger.info(path)
        try{
            const javaFile=new File(path)
            //为了不引发graaljs异常，这里主动检测目标文件夹是否存在
            if(!javaFile.exists())throw new Error("目标路径"+path+"不存在！")
            const javaFileListResult=javaFile.listFiles()
            const result:string[]=[]
            for(const javaFileResult of javaFileListResult){
                const dirs=javaFileResult.toString().split(/[\/|\\]/g)
                result.push(dirs[dirs.length-1])
            }
            return result
            //return fs.readdirSync(path)
        }
        catch(e){
            //FMPLogger.error(e);
            throw new Error("无法列出"+path+"中的文件！\n详情：\n"+e)
        }
    }
    /**
     * 新建文件夹  
     * 如果当前目录已有同名文件夹，则不执行任何操作
     * @param path 要新建的文件夹的路径，如果要在程序当前工作目录下新建，直接传入文件夹名即可
     */
    static initDir(path:string){

        //先检测有没有这个文件夹
        try{
            FMPFile.ls(path);
        }
        catch(e){
            try{
                //没有文件夹，先新建文件夹
                new File(path).mkdirs()
            }
            catch(e){
                //如果创建失败，他会去掉最后一个文件夹后重新尝试创建
                FMPLogger.warn("文件夹创建失败！原因："+e)
                FMPLogger.info("尝试从上一层文件夹开始创建")
                const dir=new FMPDirectory(path);
                dir.folders.pop()//去掉最后一个文件夹
                FMPFile.initDir(dir.toString())//尝试初始化外面一层的文件夹，如果这层失败了，他会递归回到上面那里再去掉一层文件夹
                FMPFile.initDir(path)
            }
        }
    }
    /**
     * 新建文件  
     * 如果当前目录已有同名文件，则不执行任何操作
     * @param path 要新建的文件夹的路径，如果要在程序当前工作目录下新建，直接传入文件夹名即可
     */
    static initFile(path:string){
        const javaFileObject=new File(path)
        if(javaFileObject.exists())return;
        //先创建文件夹，不然会报错
        FMPFile.initDir(new FMPDirectory(path).getParentPath().toString())
        javaFileObject.createNewFile()
    }
    static read(path:string):string{
        try{
            //检测文件是否存在，防止触发graalvm异常
            if(!new File(path).exists())throw new Error("文件"+path+"不存在！如果您的程序未要求用户提前创建准备好文件，请在读取前调用File.initFile方法创建它！")
            return Files.readString(Paths.get(path));
        }
        catch(e){
            throw new Error("读取文件时发生错误！错误消息为：\n"+e);
        }
    }
    static copy(source: string, destination: string, options: any = {}) {
        let errorText = "Error(s) occurred while copying files!";
        const targetDir = new FMPDirectory(destination);
        const targetFileName = targetDir.folders.pop();
        try {
            if (targetFileName == undefined)throw new Error(
                "multiple errors occurred:\nFile can't be copied: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons."
            );
            // targetDir.folders.push(targetFileName, "..");
            // FMPLogger.info(targetFileName)
            // FMPLogger.info(targetDir.toString())
            // FMPLogger.info(FMPFile.ls(targetDir.toString()).includes(targetFileName))
            // 检查是否已存在同名文件
            // 文件已存在
            if (FMPFile.ls(targetDir.toString()).includes(targetFileName)) {
                if (FMPFile.isFile(source)) {
                    // 设置了跳过同名文件
                    if (options.skipSameNameFiles || options.skipSameName == true) return;
    
                    // 设置了替换同名文件
                    if (options.replaceFiles == true) {
                        FMPLogger.info("复制时替换同名文件")
                        //graaljs似乎不能直接通过复制进行替换，必须删除原文件
                        FMPFile.permanently_delete(destination)
                        Files.copy(
                            Paths.get(source),
                            Paths.get(destination),
                            StandardCopyOption.REPLACE_EXISTING
                        );
                        FMPLogger.info("复制完成");
                        // 任务完成，结束
                        return;
                    }
    
                    // 什么都没有设置
                    throw new Error(
                        "A file with the same name already exists in the target directory, this file can't be copied.\nYou can solve this error by setting skipSameNameFiles (skip when this happens) or replaceFiles (discard the file in the target directory by replacing) to 'true'."
                    );
                }
    
                if (FMPFile.isFolder(source)) {
                    // 如果是文件夹，进入下面的复制文件夹环节
    
                    // 设置了存在同名文件则跳过
                    if (options.skipSameName == true) return;
    
                    // 设置了合并文件夹
                    if (options.merge == true) {
                        // 遍历源目录中的文件
                        for (let file of FMPFile.ls(source)) {
                            const dir = new FMPDirectory(source);
                            dir.folders.push(file);
                            const targetDir = new FMPDirectory(destination);
                            targetDir.folders.push(file);
                            FMPFile.copy(dir.toString(), targetDir.toString(), options);
                        }
                        return;
                    }
    
                    // 设置了替换文件夹
                    else if (options.replaceFolder == true) {
                        if (FMPFile.isFolder(destination)) {
                            FMPFile.permanently_delete(destination);
                        }
                        FMPFile.copy(source, destination, options);
                        return;
                    }
    
                    // 未处理的异常
                    errorText =
                        errorText +
                        "\nSome files already exist in the target directory, these conflicts prevented copying.";
                }
            }
            else{
                // 文件不存在，执行正常复制
                FMPFile.initDir(new FMPDirectory(targetDir.toString()).toString()); // 确保目标路径存在
                if(options.replaceFiles){
                    //
                    Files.copy(Paths.get(source),Paths.get(destination),StandardCopyOption.REPLACE_EXISTING)
                }
                else{
                    Files.copy(Paths.get(source),Paths.get(destination))
                }
            }
        } catch (e) {
            const errorToBeThrown = new Error(
                errorText + "\nnodejs error logs:\n" + e
            );
            for (const key of Object.keys(e)) {
                errorToBeThrown[key] = e[key];
            }
            throw errorToBeThrown;
        }
    }
    
    /**
     * 强制向文件内写入文本内容，无视其中是否有内容、格式是否为文本文件  
     * 请不要依赖此API对所有文件执行写入操作，由于写入时没有判断，操作不当可能会造成数据丢失或程序运行出现错误
     * @param path 要写入的文件的路径
     * @param content 要写入的内容
     */
    static forceWrite(path:string,content:string){
        //如果文件不存在，则主动抛出错误，避免引发graalvm异常
        if(!new File(path).exists())throw new Error("由于"+path+"不存在，无法写入该文件！")
        const target=new FileWriter(path,false)
        target.write(content,0,content.length);
        //你也可以在 close() 之前调用 flush()，确保数据完全写入：
        target.flush();
        //JavaScript（GraalJS）中，FileWriter 需要手动调用 close() 以确保数据真正被写入：
        target.close();
    }
    /**
     * 重命名或移动一个文件  
     * 要移动文件，修改其路径即可
     * @param path 文件路径
     * @param target 重命名后的文件名（路径）
     */
    static rename(path:string,target:string,options:any={}){
        let errorText="Error(s) occured while renaming files!"
        //不知道为什么会写下这段代码，要不是它报错了我可能永远不会发现它
        // Files.copy(Paths.get(path),Paths.get(target),StandardCopyOption.ATOMIC_MOVE)
        try{
            if(FMPFile.isFile(path)){
                //检查是否已存在同名文件
                //解析出目标文件夹的上级目录
                const targetDir=new FMPDirectory(target)
                const targetFileName=targetDir.folders.pop()
                if(targetFileName==undefined)throw new Error("multiple errors occured:\nFile can't be renamed: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons.")
                // targetDir.folders.push(targetFileName,"..")
                //文件已存在
                if(FMPFile.ls(targetDir.toString()).includes(targetFileName)){
                    //设置了跳过同名文件
                    if(options.skipSameNameFiles||options.skipSameName==true)return;
                    //设置了替换同名文件
                    if(options.replaceFiles==true){
                        new File(path).renameTo(new File(target))
                        //任务完成，结束
                        return
                    }
                    //什么都没有设置，根本无从得知用户在文件冲突时要如何操作，直接报错（相当于取消移动）
                    throw new Error("A File with the same name already exists in the target directory, this ile can't be moved.\nYou can solve this error by setting skipSameNameFiles (skip when this happens) or replaceFiles (discard the file in the target directory by replacing) to 'true'")
                }
                //文件不存在的话，会正常地执行下面的移动
            }
            new File(path).renameTo(new File(target))
        }
        catch(e){
            //这个错误不能用nodejs的方法判断，这里根本就不是nodejs环境
            if(e.code==="EPERM"){
                //解析出目标文件夹的上级目录
                const targetDir=new FMPDirectory(target)
                const targetFileName=targetDir.folders.pop()
                if(targetFileName==undefined)throw new Error("multiple errors occured:\nFile can't be renamed: operation not permitted\nFailed to obtain the last file or folder's name while checking for reasons.")
                targetDir.folders.push(targetFileName,"..")
                //文件已存在
                if(FMPFile.ls(targetDir.toString()).includes(targetFileName)){
                    //设置了存在同名文件则跳过，因为此处已经是同名文件的情况了，就直接跳过
                    if(options.skipSameName==true)return
                    //设置了合并文件夹
                    if(options.merge==true){
                        //遍历原目录中已有的文件，递归地移动每个文件
                        for(let file of FMPFile.ls(path)){
                            const dir=new FMPDirectory(path)
                            dir.folders.push(file)
                            const targetDir=new FMPDirectory(target)
                            targetDir.folders.push(file)
                            FMPFile.rename(dir.toString(),targetDir.toString(),options)
                        }
                        return
                    }
                    //设置了替换文件夹
                    else if(options.replaceFolder==true){
                        //删除目标已存在的文件
                        FMPFile.permanently_delete(target)
                        //再重新移动一遍
                        FMPFile.rename(path,target,options)
                        return
                    }

                }
                //能够处理的异常会被上面的流程控制全部跳过，无法跳过的才会到这里，并加入下面的异常
                errorText=errorText+"\nSome files already exist in the target directory, these conflicts prevented renaming."
            }
            
            //其他无法处理的错误，会直接报错，抛出错误
            const errorToBeThrown=new Error(errorText+"\nnodejs error logs：\n"+e)
            // 复制原始错误的所有属性到自定义错误对象上 
            for (let key in e) { 
                if (e.hasOwnProperty(key)) { 
                    errorToBeThrown[key] = e[key]; 
                } 
            } 
            // 抛出自定义错误对象 
            throw errorToBeThrown;
        }
    }
    /**
     * 永久删除一个文件或文件夹，不放入系统回收站  
     * 尽量不使用此方法，文件删除后无法恢复，有数据安全隐患
     * @param path 文件或文件夹路径
     */
    static permanently_delete(path:string){
        //先检测文件是否是文件夹，如果是文件夹的话，需要先清空再删除
        const javaFile=new File(path)
        //如果文件不存在，则直接报错，程序有义务先判断文件存在再进行删除
        if(!javaFile.exists())throw new Error("无法删除文件，因为文件"+path+"本来就不存在。")
        try{
            if(javaFile.isFile()){
                try{
                    javaFile.delete()
                }
                catch(e){
                    FMPLogger.info("无法删除文件"+path+"，原因："+e)
                }
            }
            else if(javaFile.isDirectory()){
                //清空文件夹
                for(let filename of this.ls(path)){
                    this.permanently_delete(path+"/"+filename);
                }
                //删除文件夹
                javaFile.delete()
            }
        }
        catch(e){
            FMPLogger.error(e)
        }
    }
    /**
     * 是否是文件夹
     * @param path 路径
     * @returns 检查结果
     */
    static isFolder(path:string){
        const stat=new File(path)
        return stat.isDirectory()
    }
    /**
     * 是否是文件
     * @param path 路径
     * @returns 检查结果
     */
    static isFile(path:string){
        const stat=new File(path)
        return stat.isFile()
    }
}
export class FMPDirectory{
    folders:string[];
    path:string;
    constructor(dir:string){
        this.path=dir
        this.folders=dir.split(/[/|\\]/);
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
    isWindowsAbsolutePath(){
        return /^[a-zA-Z]:\\|^\\\\/.test(this.path);
    }/*
    toPluginDir():string{
        //绝对路径的情况
        if(this.isWindowsAbsolutePath())return this.path;
        if(this.folders[0]=="")return this.path;
        //如果不是绝对路径，往路径前面加上plugins/
    }*/
    getParentPath():FMPDirectory{
    
        if (!this.folders.length || [".","./",""].includes(this.path)) {
            return new FMPDirectory("../");
        }
    
        if (this.folders.length === 1 && ["","../",".."].includes(this.folders[0])) {
            return new FMPDirectory(this.path + "/../");
        }
    
        // 移除末尾的文件或文件夹部分以获取父路径
        this.folders.pop();
        this.folders.pop();
        const parentPath = this.toString(); // 使用 `/` 分隔符
        return new FMPDirectory(parentPath === "" ? "../" : parentPath);
    }
}
export class JsonFile{
    fileContent:string;
    path:string;
    objpath:string[];
    rootobj:any;
    /**
     * 
     * @param {string} path 文件路径
     * @param {Array<string>} objpath 在JSON文件内部的路径
     */
    constructor(path:string,objpath:string[]=[]){
        //先把文件建出来
        FMPFile.initFile(path);
        //如果文件中事先没有内容，先在文件中写上一个大括号来保证后续顺利读取
        if(FMPFile.read(path).length==0){
            FMPFile.forceWrite(path,"{}");
            const newContent=FMPFile.read(path)
            if(newContent!=="{}")throw new Error("初始化JSON文件失败！文件中现有内容："+newContent)
        }
        this.path=path;
        this.objpath=objpath
        try{

            this.rootobj=JSON.parse(FMPFile.read(path));
        }
        catch(e){
            FMPLogger.info(FMPFile.read(path))
            throw new Error("读取JSON文件时出现错误！:"+e.message);
        }
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
            checkObjAvailable(this.rootobj,0);//这里的递归只是起到一个检查的作用
        }
    }
    /**
     * 初始化配置项，要求可以对嵌套着的对象初始化
     * @param key 键名
     * @param value 键值
     */
    init(key:string,value:any){//重写只能放构造里面，放别的地方不行，我也不知道为啥
        if(this.get(key)===undefined){
            this.set(key,value);
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
        function getValue(obj:Object,index:number){
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
    set(key:string,value:any){//set之后要把rootobj重新生成一下
        let result=true;
        let objpath=this.objpath
        let rootobj=this.rootobj
        let path=this.path;
        if(this.objpath.length==0)setRoot(key,value)
        else{
            //log("输入set的："+JSON.stringify(setValue(rootobj,0,value)))
            //log(JSON.stringify(setValue(rootobj[objpath[0]],0,value)))
            result=setRoot(this.objpath[0],setValue(this.rootobj[this.objpath[0]],0,value));                
        }
        function setRoot(key:string,value:any):boolean{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
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
        this.reload();
        return result;
    }
    delete(key:string):boolean{
        let result=true;
        let objpath=this.objpath
        let rootobj=this.rootobj
        let path=this.path;
        if(this.objpath.length==0){
            delete rootobj[key]
            FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
            return true;
        }
        else{
            //log("输入set的："+JSON.stringify(setValue(rootobj,0,value)))
            //log(JSON.stringify(setValue(rootobj[objpath[0]],0,value)))
            result=setRoot(this.objpath[0],deleteValue(this.rootobj[this.objpath[0]],0));                
        }
        function setRoot(key:string,value:any):boolean{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            FMPFile.forceWrite(path,JSON.stringify(rootobj,undefined,4));
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
        this.reload();
        return result;
    }
    reloadroot():boolean{
        this.fileContent=FMPFile.read(this.path)
        this.rootobj=JSON.parse(this.fileContent);
        return true;
        //this.keys=this.getAllKeys(this.rootobj);
    }
    reload():boolean{
        return this.reloadroot();
    }
    getAllKeys(obj:any,index=0){
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
    keys():string[]{
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

//export class FMPFile{
//     static ls(path:string):string[]{
//         return file.getFilesList(path)
//     }
//     static initDir(path:string){
//         file.mkdir(path);
//     }
//     static initFile(path:string){
//         if(file.readFrom(path)===null)file.writeTo(path,"")
//     }
//     static read(path:string):string{
//         const content:string|null=file.readFrom(path)
//         return content===null?"":content;
//     }
//     static copy(source:string,destination:string){
//         file.copy(source,destination);
//     }
//     static forceWrite(path:string,content:string){
//         file.writeTo(path,content);
//     }
//     /**
//      * 重命名或移动一个文件  
//      * 要移动文件，修改其路径即可
//      * @param path 文件路径
//      * @param target 重命名后的文件名（路径）
//      */
//     static rename(path:string,target:string){
//         FMPLogger.info("重命名逻辑未完成！\n目前需要的工作：分割传入的路径，分辨是否是在当前目录中重命名，然后复刻nodejs移动文件命令的特性")

//     }
//     /**
//      * 永久删除一个文件或文件夹，不放入系统回收站  
//      * 尽量不使用此方法，文件删除后无法恢复，有数据安全隐患
//      * @param path 文件或文件夹路径
//      */
//     static permanently_delete(path:string){
//     }
// }