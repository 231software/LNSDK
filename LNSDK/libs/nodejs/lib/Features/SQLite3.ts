import {FMPLogger} from "../Logger"
const sqlite3=require("better-sqlite3")
/**
 * SQL数据类型枚举。  
 * 注释来自[菜鸟教程](https://www.runoob.com/sql/sql-datatypes-general.html)
 */
export enum FMPSQLDataTypeEnum{
    CHARACTER,
    VARCHAR,
    BINARY,
    BOOLEAN,
    VARBINARY,
    INTEGER,
    SMALLINT,
    BIGINT,
    DECIMAL,
    NUMBERIC,
    FLOAT,
    REAL,
    DOUBLT_PRECISION,
    DATE,
    TIME,
    TIMESTAMP,
    INTERVAL,
    ARRAY,
    MULTISET,
    XML,
    TEXT
}
export class FMPSQLDataType{
    type:FMPSQLDataTypeEnum
    params:number[]
    constructor(type:FMPSQLDataTypeEnum,...params:number[]){
        this.type=type
        this.params=params
    }
    toStatement():string{
        switch(this.type){
            case FMPSQLDataTypeEnum.CHARACTER:return `CHARACTER(${this.params[0]})`
            case FMPSQLDataTypeEnum.VARCHAR:return `VARCHAR(${this.params[0]})`
            case FMPSQLDataTypeEnum.BINARY:return `BINARY(${this.params[0]})`
            case FMPSQLDataTypeEnum.BOOLEAN:return `BOOLEAN`
            case FMPSQLDataTypeEnum.VARBINARY:return `VARBINARY(${this.params[0]})`

            case FMPSQLDataTypeEnum.INTEGER:return `INTEGER`

            case FMPSQLDataTypeEnum.REAL:return `REAL`
            
            case FMPSQLDataTypeEnum.TEXT:return `TEXT`
            default:throw new Error("目前还不支持当前数据类型："+this.type);
        }
    }

}
/**
 * SQL数据类型枚举。  
 * 注释来自[菜鸟教程](https://www.runoob.com/sql/sql-datatypes.html)
 */
export enum FMPSQLDBDataType{
    /** 	用于文本或文本与数字的组合。最多 255 个字符。 */
    Text,
    /**Memo 用于更大数量的文本。最多存储 65,536 个字符。注释：无法对 memo 字段进行排序。不过它们是可搜索的。 */
    Memo,
    /** 	允许 0 到 255 的数字。 */
    Byte,
    /** 	允许介于 -32,768 与 32,767 之间的全部数字。 */
    Integer,
    /** 	允许介于 -2,147,483,648 与 2,147,483,647 之间的全部数字。 */
    Long,
    /**单精度浮点。处理大多数小数。 */
    Single,
    /**双精度浮点。处理大多数小数。 */
    Double,
    /**用于货币。支持 15 位的元，外加 4 位小数。提示：您可以选择使用哪个国家的货币。 */
 
    Currency,
    /** 	AutoNumber 字段自动为每条记录分配数字，通常从 1 开始。 */
    AutoNumber,
    /**用于日期和时间 */
    DateTime,
    /**逻辑字段，可以显示为 Yes/No、True/False 或 On/Off。在代码中，使用常量 True 和 False （等价于 1 和 0）。注释：Yes/No 字段中不允许 Null 值 */
    YesNo,
    /**
     * 可以存储图片、音频、视频或其他 BLOBs（Binary Large OBjects）。  
     * 最多允许**1GB**。
     */
    OleObject,
    /**包含指向其他文件的链接，包括网页。 */
    Hyperlink,
    /** 	允许您创建一个可从下拉列表中进行选择的选项列表。 */
    LookupWizard
}
export enum FMPSQLComparisonOperators{
    /**= */
    Equal,
    /**!= */
    NotEqual,
    /**> */
    Greater,
    /**< */
    Less,
    /**>= */
    GreaterEqual,
    /**<= */
    LessEqual,
    /**!> */
    NotGreater,
    /**!< */
    NotLess
}
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
    close(){
        this.rawdbsession.close();
    }
    /**
     * 
     * @param name 表名
     * @param columns 表中每一列的信息  
     * - name：列名，定义外键约束时为当前表中要创建此约束的列名
     * - data_type：列的数据类型，定义外键约束时可传入undefined
     * - forign_key：不定义外键约束时请传入undefined  
     * > - table：外键指向的列所在的表  
     * > - column：外键指向的列名  
     * - constraint：约束，要创建外键约束请传入forign_key参数
     * > - not_null：确保列不能有 NULL 值。
     * > - unique：确保列中的所有值都是唯一的。
     * > - primary_key：唯一标识表中的每一行记录。PRIMARY KEY 约束是 NOT NULL 和 UNIQUE 的结合。
     * > - check：确保列中的值满足特定的条件。
     * > - default：为列设置默认值。
     */
    initTable(name:string,...columns:{
        name:string,
        data_type?:FMPSQLDataType,
        forign_key?:{
            table:string,
            column:string
        },
        constraint?:{
            not_null?:boolean,
            unique?:boolean,
            primary_key?:boolean
            check?:{
                left:string,
                operator:FMPSQLComparisonOperators,
                right:string,
            },
            default?:string
        }
    }[]){
        const columnsStatements:string[]=[]
        const forign_keyStatements:string[]=[]
        for(let column of columns){
            if(column.forign_key==undefined){
                let columnStatement="";
                columnStatement=columnStatement+column.name
                if(column.data_type!=undefined)columnStatement=columnStatement+" "+column.data_type.toStatement()
                if(column.constraint?.not_null)columnStatement=columnStatement+" NOT NULL"
                if(column.constraint?.unique)columnStatement=columnStatement+" UNIQUE"
                if(column.constraint?.primary_key)columnStatement=columnStatement+" PRIMARY KEY"
                columnsStatements.push(columnStatement+"\n")
            }
        }
        this.runSync(`CREATE TABLE IF NOT EXISTS ${name} (
            ${columnsStatements}
        )`)
    }
    getColumns(tableName:string):{
        name:string,
        type:FMPSQLDataTypeEnum,
        not_null:boolean,
        primary_key:boolean,
        default_value:any
    }[]{
        function toFMPSQLite3Type(type:string):FMPSQLDataTypeEnum{
            switch(type){
                case "INTEGER":return FMPSQLDataTypeEnum.INTEGER
                default:throw new Error("请为getColumns方法的toFMPSQlite3Type函数完善"+type+"映射")
            }
        }
        const columnsInfo:{
            name:string,
            type:FMPSQLDataTypeEnum,
            not_null:boolean,
            primary_key:boolean,
            default_value:any
        }[]=[]
        for(let column of this.queryAllSync(`PRAGMA table_info(${tableName})`)){
            columnsInfo[column.cid]={
                name:column.name,
                type:toFMPSQLite3Type(column.type),
                not_null:Boolean(column.notnull),
                default_value:column.dflt_value,
                primary_key:Boolean(column.pk)
            }
        }
        return columnsInfo
    }
    setRow(tableName:string,...values:{
        columnName:string,
        value:any
    }[]){
        let statement="INSERT INTO "+tableName+" VALUES ("
        const columns=this.getColumns(tableName)
        let primary_key_column_name=""
        let valuesOrder:any[]=[]
        for(let value of values){
            let columnIndex=0
            //找到当前值对应的列
            for(let i in columns){
                if(columns[i].primary_key)primary_key_column_name=columns[i].name
                if(columns[i].name==value.columnName){
                    columnIndex=Number(i)
                    break;
                }
            }
            valuesOrder[columnIndex]=value.value
        }
        for(let value of valuesOrder){
            statement=statement+"?,"
        }
        //去掉最后的逗号
        statement=statement.slice(0,-1)+") "
        const values_to_update:any=[]
        if(primary_key_column_name.length>0){
            statement=statement+"ON CONFLICT ("+primary_key_column_name+") DO UPDATE SET "
            for(let value of values){
                statement=statement+value.columnName+"=?,"
                values_to_update.push(value.value)
            }
            //去掉最后的逗号
            statement=statement.slice(0,-1)+";"            
        }

        const all_parameters=valuesOrder.concat(values_to_update)
        //执行语句
        this.runSync(statement,...all_parameters)
        
    }
    getRowFromPrimaryKey(tableName:string,value:any):Map<string,any>{
        let primary_key_name=""
        for(let column of this.getColumns(tableName)){
            if(column.primary_key)primary_key_name=column.name
        }
        if(primary_key_name.length==0)throw new Error("当前表中没有主键")
        const result=new Map<string,any>()
        const rawResult=this.queryAllSync("SELECT * from "+tableName+" WHERE "+primary_key_name+"=?",value)[0]
        //没有查询到任何结果
        if(rawResult==undefined)return result
        for(let columnName of Object.keys(rawResult)){
            result.set(columnName,rawResult[columnName])
        }
        return result
    }
}