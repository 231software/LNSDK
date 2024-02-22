import sqlite3 from 'better-sqlite3';
export class FMPSQLite3{
    rawdbsession:any;
    /**
     * **创建数据库部分暂不支持异步**
     * @param path 数据库路径
     */
    constructor(path:string){
        this.rawdbsession=new sqlite3(path)
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
        this.rawdbsession.transaction(()=>this.rawdbsession.prepare(SQLstring).run(...params))()
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
        return this.rawdbsession.transaction(()=>this.rawdbsession.prepare(SQLstring).all(...params))();
    }
}