import { LNPlatform,LNSupportedPlatforms } from "./Platform.js";
import {logger} from "../../@LLSELib/index.js"
/*
import * as sqlite3 from 'better-sqlite3';
let testdb=new sqlite3("aaa")
testdb.prepare("safd").run()
*/
/*
let npm_sqlite3;
if(LNPlatform.getConfig().sqlite3&&LNPlatform.getType()==LNSupportedPlatforms.NodeJS)
    npm_sqlite3=require("better-sqlite3");
console.log(npm_sqlite3)
*/
export class LNLogger{
    static parseParams(params:any[]):string{
        let msg:string="";
        for(let arg of params){
            let argstr:string;
            switch(typeof arg){
                case "undefined":argstr="undefined";break;
                case "object":{
                    if(arg===null)argstr="null";break;
                }
                default:
                    argstr=arg.toString();
            }
            msg=msg+argstr+" ";
        }
        return msg;
    }
    static warn(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.warn(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.warn(msg);
                break;
        }
    }
    static info(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.info(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.log(msg);
                break;
        }
    }
    static debug(...message:any[]):void{
        let msg=this.parseParams(message);
        switch (LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:
                logger.debug(msg);
                break;
            case LNSupportedPlatforms.NodeJS:
                console.debug(msg);
                break;
        }
    }
}
export class LNSQLite3{
    rawdbsession:any;
    /**
     * **llselib暂不支持sqlite数据库**
     * @param path 数据库路径
     */
    constructor(path:string){
        /*
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:{
                this.rawdbsession=new DBSession('sqlite3', {
                    path: path,
                    create: true,
                    readonly:false,
                    readwrite:true
                  });
                break;
            }
            default:{
                this.rawdbsession=new (require('better-sqlite3'))(path)
            }
        }
        */
    }
    /**
     * 同步预准备执行SQL语句  
     * 目前请自行使用异步函数来实现异步执行  
     * 暂不支持传入对象来指定参数的方法，虽然这个类型已经写进去了  
     * better-sqlite3: `SQLite3 can only bind numbers, strings, bigints, buffers, and null`
     * @param SQLstring SQL语句
     * @param params 预准备语句要绑定的参数
     */
    runSync(SQLstring:string,...params:any[]){
        //https://juejin.cn/post/7027793131516985380     
        /*
        if(arguments.length==1){
            
        }
        */
       /*
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:{
                let stmt=this.rawdbsession.prepare(SQLstring);
                stmt.bind(params)
                stmt.execute();
                
                break;
            }
            default:{
                this.rawdbsession.transaction(()=>this.rawdbsession.prepare(SQLstring).run(...params))()
            }
        }  
        */
        /*
        else{
            switch(LNPlatform.getType()){
                case LNSupportedPlatforms.LiteLoaderBDS:{
                    let stmt=this.rawdbsession.prepare(SQLstring);
                    stmt.bind(params)
                    stmt.execute();
                    break;
                }
                default:{
                    this.rawdbsession.transaction(()=>this.rawdbsession.prepare(SQLstring).run(params))()
                }
            }   
        }*/

    };
    /**
     * 同步预准备执行SQL语句  
     * 目前请自行使用异步函数来实现异步执行  
     * 暂不支持传入对象来指定参数的方法，虽然这个类型已经写进去了  
     * @param SQLstring SQL语句
     * @param params 预准备语句要绑定的参数  
     * better-sqlite3: `SQLite3 can only bind numbers, strings, bigints, buffers, and null`
     * @returns 执行结果
     */
    queryAllSync(SQLstring:string,...params:any[]):any[]{
        /*
        switch(LNPlatform.getType()){
            case LNSupportedPlatforms.LiteLoaderBDS:{
                let stmt=this.rawdbsession.prepare(SQLstring);
                stmt.bind(params)
                stmt.execute();
                const rawresult:Array<Array<any>>=stmt.fetchAll();
                let result=[];
                for(let rowindex in rawresult){
                    if(Number(rowindex)==0)continue;
                    let rowresult={};
                    for(let column_id in rawresult[0]){
                        rowresult[rawresult[0][Number(column_id)]]=rawresult[Number(rowindex)][Number(column_id)]
                    }
                    result=result.concat([rowresult])
                }
                return result;
            }
            break;
            default:{
                return this.rawdbsession.transaction(()=>this.rawdbsession.prepare(SQLstring).all(...params))();
            }
        }
        */
        return [];
    }
}