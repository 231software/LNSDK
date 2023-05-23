//新计划：现在需要他能够对对象中的路径创建一个类，然后这个类可以有JsonConfigFile的所有方法
/**
 * 重写了JsonConfigFile类的配置文件修改接口，可实现修复init初始化bool，通过一个数组指定配置文件内的路径实现将get，set等方法应用于更深层的配置项，不用get出来赋值再set
 */
class JsonFile extends JsonConfigFile{
    /**
     * 
     * @param {string} path 传递给JsonConfigFile的路径
     * @param {Array<string>} objpath 在JSON文件内部的路径
     */
    constructor(path,objpath=[]){
        
        super(path)
        this.objpath=objpath
        let rootobj=JSON.parse(super.read());
        if(objpath.length!=0){
            checkObjAvailable(rootobj,0);//这里的递归只是起到一个检查的作用
            function checkObjAvailable(checkPath,index){
                if(index>objpath.length-1){return;}
                //log(objpath[index])
                //log(typeof checkPath[objpath[index]])
                //log(checkPath[objpath[index]])
                //log(index)
                if(typeof checkPath[objpath[index]]!="object"){
                    let errorPath=objpath
                    errorPath.splice(index+1)
                    logger.error("Cannot generate in the path:"+JSON.stringify(errorPath))
                    return;
                }
                checkObjAvailable(checkPath[objpath[index]],index+1);
            }          
        }
        /**
         * 初始化配置项，要求可以对嵌套着的对象初始化
         * @param {string} key 键名
         * @param {any} value 键值
         */
        this.init=(key,value)=>{//重写只能放构造里面，放别的地方不行，我也不知道为啥
            if(this.objpath.length==0){
                super.init(key,value)
                if((typeof value)=="boolean"){
                    super.set(key,Boolean(value))
                }                
            }
            else{
                let set=this.set//由于this.set传不进去initValue，所以在这里单独声明一个变量接力一下
                let get=this.get
                if(get(key)===undefined){
                    set(key,value)
                }
            }

        }
        /**
         * 通过递归读取目标的值
         * @param {string} key 要读取的键值
         */
        this.get=(key)=>{
            //let objpath=this.objpath;
            if(this.objpath.length==0){
                //log("从根目录直接获取值")
                return super.get(key);
            }
            else{
                return getValue(rootobj,0);
            }
            /**
             * 专用来递归访问对象的函数
             * @param {Object} obj 
             * @param {number} index 
             * @returns ？？这里好像写的有问题，但是竟然能运行  草，果然有问题，刚才就发现了
             */
            function getValue(obj,index){
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
         * @param {string} key 键名
         * @param {any} value 键值
         */
        this.set=(key,value)=>{//set之后要把rootobj重新生成一下
            let result;
            if(this.objpath.length==0){
                result=super.set(key,value);
            }
            else{
                let root=super.get(objpath[0]);
                //log("输入set的："+JSON.stringify(setValue(rootobj,0,value)))
                //log(JSON.stringify(setValue(rootobj[objpath[0]],0,value)))
                result=super.set(objpath[0],setValue(rootobj[objpath[0]],0,value));
                
                function setValue(obj,index,value){
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
            }
            this.reloadroot();
            return result;
        }
        this.reload=()=>{
            super.reload();
            this.reloadroot();
        }
        function getAllKeys(obj,index=0){
            if(objpath.length==0){
                return Object.keys(rootobj)
            }
            //log(JSON.stringify(obj[objpath[index]]))
            if(index>=objpath.length-1){//length-1是最后一个元素的索引，如果到达这个索引，就证明应该读取这一级目录中的值了
                
                return Object.keys(obj[objpath[index]])
            }else{
                return getAllKeys(obj[objpath[index]],index+1)
            }
        }        
        this.keys=()=>{
            return getAllKeys(rootobj);//Object.keys(rootobj);
        }
        this.obj=()=>{
            return rootobj;
        }
        this.reloadroot=()=>{
            rootobj=JSON.parse(super.read());
            this.keys=getAllKeys(rootobj);
        }
    }
    static get version(){
        return "0.0.1";
    }
}
module.exports=JsonFile;