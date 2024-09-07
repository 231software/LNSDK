export class FMPSQLite3{
    rawdbsession:DBSession;
    /**
     * **创建数据库部分暂不支持异步**
     * @param path 数据库路径
     */
    constructor(path:string){
        this.rawdbsession=new DBSession('sqlite3',{
            path,
            create:true,
            readonly:false,
            readwrite:true
        })
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
        let stmt=this.rawdbsession.prepare(SQLstring);
        stmt.bind(params)
        stmt.execute();
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
        let stmt=this.rawdbsession.prepare(SQLstring);
        stmt.bind(params)
        stmt.execute();
        const rawresult:Array<Array<any>>=stmt.fetchAll();
        let result:Array<any>=[];
        for(let rowindex in rawresult){
            if(Number(rowindex)==0)continue;
            let rowresult:Object={};
            for(let column_id in rawresult[0]){
                rowresult[rawresult[0][Number(column_id)]]=rawresult[Number(rowindex)][Number(column_id)]
            }
            result.push(rowresult)
        }
        return result;
    }
}