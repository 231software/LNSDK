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
        this.type=type,
        this.params=params
    }
    toStatement():string{
        switch(this.type){
            case FMPSQLDataTypeEnum.CHARACTER:return `CHARACTER(${this.params[0]})`
            case FMPSQLDataTypeEnum.VARCHAR:return `VARCHAR(${this.params[0]})`
            case FMPSQLDataTypeEnum.BINARY:return `BINARY(${this.params[0]})`
            case FMPSQLDataTypeEnum.BOOLEAN:return `BOOLEAN`
            case FMPSQLDataTypeEnum.VARBINARY:return `VARBINARY(${this.params[0]})`

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
        }}[]){

    }
}