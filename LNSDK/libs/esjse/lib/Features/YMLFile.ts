import {FMPFile} from "../File.js"
import { FMPLogger } from "../Logger.js";
import * as YML from "yaml"

export class XMLFile{

}

export class YMLFile{
    fileContent:string;
    path:string;
    objpath:string[];
    rootobj:any;
    /**
     * 
     * @param {string} path 文件路径
     * @param {Array<string>} objpath 在YML文件内部的路径
     */
    constructor(path:string,objpath:string[]=[]){
        //先把文件建出来
        FMPFile.initFile(path);
        //如果文件中事先没有内容，先在文件中写上一个大括号来保证后续顺利读取
        if(FMPFile.read(path).length==0)FMPFile.forceWrite(path,"{}");
        this.path=path;
        this.objpath=objpath
        this.rootobj=YML.parse(FMPFile.read(path));
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
            if(index>=objpath.length-1){//length-1是最后一个元素的索引，如果到达这个索引，就证明应该读取这一级目录中的值了
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
        //在根目录的情况下直接设置
        if(this.objpath.length==0)setRoot(key,value)
        //否则通过嵌套的方式设置
        else{
            result=setRoot(this.objpath[0],setValue(this.rootobj[this.objpath[0]],0,value));                
        }
        function setRoot(key:string,value:any):boolean{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            FMPFile.forceWrite(path,YML.stringify(rootobj));
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
                return write
            }
        } 
        this.reload();
        return result;
    }
    /**
     * 删除当前YML对象的一个键
     * @param key 要被删除的键
     * @returns 是否成功删除
     */
    delete(key:string):boolean{
        let result=true;
        let objpath=this.objpath
        let rootobj=this.rootobj
        let path=this.path;
        if(this.objpath.length==0){
            delete rootobj[key]
            FMPFile.forceWrite(path,YML.stringify(rootobj));
            return true;
        }
        else{
            result=setRoot(this.objpath[0],deleteValue(this.rootobj[this.objpath[0]],0));                
        }
        function setRoot(key:string,value:any):boolean{
            //注意，这个函数里面没有this，所有的this的属性都要传进来才能用
            rootobj[key]=value
            FMPFile.forceWrite(path,YML.stringify(rootobj));
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
                return write
            }
        } 
        this.reload();
        return result;
    }
    reloadroot():boolean{
        this.fileContent=FMPFile.read(this.path)
        this.rootobj=YML.parse(this.fileContent);
        return true;
        //this.keys=this.getAllKeys(this.rootobj);
    }
    /**
     * 重载当前配置文件  
     * YMLFile不会锁定文件或跟踪文件修改，因此如果用户或其他软件修改了文件，需要通过某种方式使当前插件调用这个reload刷新文件内容
     * @returns 是否重载成功
     */
    reload():boolean{
        return this.reloadroot();
    }
    getAllKeys(obj:any,index=0){
        if(this.objpath.length==0){
            return Object.keys(this.rootobj)
        }
        if(index>=this.objpath.length-1){//length-1是最后一个元素的索引，如果到达这个索引，就证明应该读取这一级目录中的值了
            
            return Object.keys(obj[this.objpath[index]])
        }else{
            return this.getAllKeys(obj[this.objpath[index]],index+1)
        }
    }        
    /**
     * 获取所有的键名 
     */
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