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
            case FMPSQLDataTypeEnum.BIGINT:return `BIGINT`

            case FMPSQLDataTypeEnum.REAL:return `REAL`
            
            case FMPSQLDataTypeEnum.TEXT:return `TEXT`
            case FMPSQLDataTypeEnum.DATE:return `DATE`
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


interface FMPSQLite3Constraint{
    /**确保列不能有 NULL 值。 */
    not_null?:boolean,
    /**确保列中的所有值都是唯一的。 */
    unique?:boolean,
    /**唯一标识表中的每一行记录。PRIMARY KEY 约束是 NOT NULL 和 UNIQUE 的结合。 */
    primary_key?:boolean
    /**确保列中的值满足特定的条件。 */
    check?:{
        left:string,
        operator:FMPSQLComparisonOperators,
        right:string,
    },
    /**为列设置默认值。 */
    default?:string
}

interface FMPSQLite3ConstraintForignKey{
    /**外键指向的列所在的表   */
    table:string,
    /**外键指向的列名 */
    column:string
}

interface FMPSQLite3Column{
    /**列名 */
    name:string,
    /**列的数据类型 */
    data_type:FMPSQLDataType,
    /**无需向该列赋值，该列的值会自动增加，可作为每条数据的uid */
    auto_increment?:boolean,
    /**外键约束 */
    forign_key?:FMPSQLite3ConstraintForignKey,
    /**约束，要创建外键约束请传入forign_key参数 */
    constraint?:FMPSQLite3Constraint
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
     * - data_type：列的数据类型
     * - auto_increment：无需向该列赋值，该列的值会自动增加，可作为每条数据的uid
     * - forign_key：外键约束
     * > - table：外键指向的列所在的表  
     * > - column：外键指向的列名  
     * - constraint：约束，要创建外键约束请传入forign_key参数
     * > - not_null：确保列不能有 NULL 值。
     * > - unique：确保列中的所有值都是唯一的。
     * > - primary_key：唯一标识表中的每一行记录。PRIMARY KEY 约束是 NOT NULL 和 UNIQUE 的结合。
     * > - check：确保列中的值满足特定的条件。
     * > - default：为列设置默认值。
     */
    initTable(name:string,...columns:FMPSQLite3Column[]){
        const columnsStatements:string[]=[]
        const forign_keyStatements:string[]=[]
        let primary_key_column_name:string|undefined
        for(let column of columns){
            let columnStatement="";
            columnStatement=columnStatement+column.name
            if(column.data_type!=undefined)columnStatement=columnStatement+" "+column.data_type.toStatement()
            if(column.constraint?.not_null)columnStatement=columnStatement+" NOT NULL"
            if(column.constraint?.unique)columnStatement=columnStatement+" UNIQUE"
            //由于主键只能出现一次，所以这里会做一些检查
            if(column.constraint?.primary_key){
                if(primary_key_column_name==undefined){
                    primary_key_column_name=column.name
                    columnStatement=columnStatement+" PRIMARY KEY"
                }
                else{
                    throw new SyntaxError("主键出现了重复！正在初始化的表"+name+"已有主键"+primary_key_column_name+"，然而名为"+column.name+"的列也拥有主键约束")
                }
            }
            if(column.auto_increment)columnStatement=columnStatement+" AUTOINCREMENT"
            columnsStatements.push(columnStatement+"\n")
            //传入外键
            if(column.forign_key!=undefined){
                //为了把所有外键约束放到最后，需要先把所有收集到的外键暂存，等所有其他的键都定义完之后再回来拼外键表达式
                forign_keyStatements.push(`FOREIGN KEY (${column.name}) REFERENCES ${column.forign_key.table}(${column.forign_key.column})`)
            }
        }
        for(let forign_key_statement of forign_keyStatements){
            columnsStatements.push(forign_key_statement)
        }
        this.runSync(`CREATE TABLE IF NOT EXISTS ${name} (${columnsStatements})`)
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
                case "REAL":return FMPSQLDataTypeEnum.REAL
                case "TEXT":return FMPSQLDataTypeEnum.TEXT
                case "BIGINT":return FMPSQLDataTypeEnum.BIGINT
                case "DATE":return FMPSQLDataTypeEnum.DATE
                default:throw new SyntaxError("请为getColumns方法的toFMPSQlite3Type函数完善"+type+"映射")
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
        if(primary_key_name.length==0)throw new SyntaxError("当前表中没有主键")
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

export class FMPSQLSingleArrayTable{
    session:FMPSQLite3
    table:string
    /**
     * 初始化一个单数组表  
     * 通过一个外键创建一个表，随后可以以数组的形式直接收集获取该表中的数据
     * @param tableName 表名
     * @param bindTable 绑定到的主表名
     * @param bindColumn 绑定到的主表上的列的名
     * @param dataColumns 该表中用于存储数据的列的配置信息
     */
    constructor(session:FMPSQLite3,table:string,bindTable:string,bindColumn:string,bindColumnDataType:FMPSQLDataType,...dataColumns:FMPSQLite3Column[]){
        this.session=session
        this.table=table
        let bindColumnFound=false
        session.getColumns(bindTable).forEach((currentValue)=>{
            if(currentValue.name==bindColumn)bindColumnFound=true
        })
        if(!bindColumnFound)throw new SyntaxError("在"+bindTable+"中未找到需要绑定的列"+bindColumn)
            session.initTable(table,{
            name:"FMPSQLite3SingleArrayTableIndexColumn",
            data_type:new FMPSQLDataType(FMPSQLDataTypeEnum.INTEGER),
            auto_increment:true,
            constraint:{
                primary_key:true
            }
        },{
            name:"FMPSQLite3SingleArrayTableForignKeyColumn",
            data_type:bindColumnDataType,
            forign_key:{
                table:bindTable,
                column:bindColumn
            },
            constraint:{
                not_null:true
            }
        },{
            name:"FMPSQLite3SingleArrayTableArrayIndexColumn",
            data_type:new FMPSQLDataType(FMPSQLDataTypeEnum.REAL),
            constraint:{
                not_null:true
            }
        },...dataColumns)

    }
    get(bindedColumnValue:any){
        //对原始返回的数据进行排序
        return this.session
            .queryAllSync(`SELECT * FROM ${this.table} WHERE FMPSQLite3SingleArrayTableForignKeyColumn=?`,bindedColumnValue)
            .sort(
                (a,b)=>
                    a.FMPSQLite3SingleArrayTableArrayIndexColumn-
                    b.FMPSQLite3SingleArrayTableArrayIndexColumn
            )
    }
    push(bindedColumnValue:any,...values:{columnName:string,value:any}[][]){
        const currentValue=this.get(bindedColumnValue)
        if(values.length==0)return currentValue.length
        const firstData=values.shift();
        if(firstData==undefined)throw new SyntaxError("firstData意外地为undefined类型，请向开发者反馈")
        this.session.setRow(this.table,{
            columnName:"FMPSQLite3SingleArrayTableForignKeyColumn",
            value:bindedColumnValue
        },{
            columnName:"FMPSQLite3SingleArrayTableArrayIndexColumn",
            //currentValue可能为空
            value:currentValue.length!=0?currentValue[currentValue.length-1].FMPSQLite3SingleArrayTableArrayIndexColumn+16:16
            //数列，除以二减一后是整数，再除以二后减一后还是整数，
            //1，3，5，7，9，11，13，15，17，19
            //1，5，9，13，17，21，25
            //1，9，17，25
            //1，17
        },...firstData)
        return this.push(bindedColumnValue,...values)
    }
    shift(bindedColumnValue:any){
        const currentValue=this.get(bindedColumnValue)
        if(currentValue.length==0)return undefined
        const firstIndex=currentValue[0].FMPSQLite3SingleArrayTableArrayIndexColumn
        this.session.runSync(`DELETE FROM ${this.table} WHERE FMPSQLite3SingleArrayTableForignKeyColumn=? AND FMPSQLite3SingleArrayTableArrayIndexColumn=?`,bindedColumnValue,firstIndex)
        return currentValue[0]
    }
    insert(bindedColumnValue:any,position:number,...values:{columnName:string,value:any}[][]){
        //insert要能插入多个数据，所以values需要是一个二维数组，外层数组代表每一条数据，因为每一条数据本身都是一个数组，数组套着数组
        if(values.length==0)return;
        const firstData=values.shift();
        if(firstData==undefined)throw new SyntaxError("firstData意外地为undefined类型，请向开发者反馈")
        const currentValue=this.get(bindedColumnValue)
        if(position==0){
            this.unshift(bindedColumnValue,firstData)
        }
        else if(position>=currentValue.length){
            this.push(bindedColumnValue,firstData)
        }
        //长度等于1时，如果position等于0，证明从第一位开始插入，等效unshift，而如果大于等于1证明从第二位没有东西的位置开始插入，等效push
        else{
            const oldIndexAtPosition=currentValue[position].FMPSQLite3SingleArrayTableArrayIndexColumn
            const oldIndexPreviousPosition=currentValue[position-1].FMPSQLite3SingleArrayTableArrayIndexColumn
            const newIndex=(oldIndexAtPosition+oldIndexPreviousPosition)/2
            this.session.setRow(this.table,{
                columnName:"FMPSQLite3SingleArrayTableForignKeyColumn",
                value:bindedColumnValue
            },{
                columnName:"FMPSQLite3SingleArrayTableArrayIndexColumn",
                value:newIndex
            },...firstData)
        }
        //继续用递归插入剩余数据
        this.insert(bindedColumnValue,position+1,...values)
    }
    unshift(bindedColumnValue:any,...values:{columnName:string,value:any}[][]){
        //第一位索引虽然是无限趋近于0，但本程序的限制使第一位索引永远无法直接等于0，所以unshift只需要把0和第一位索引的平均值作为新索引即可
        if(values.length==0)return;
        const firstData=values.shift();
        if(firstData==undefined)throw new SyntaxError("firstData意外地为undefined类型，请向开发者反馈")
        const currentValue=this.get(bindedColumnValue)
        const newIndex=currentValue.length==0?16:(0+currentValue[0].FMPSQLite3SingleArrayTableArrayIndexColumn)/2
        this.session.setRow(this.table,{
            columnName:"FMPSQLite3SingleArrayTableForignKeyColumn",
            value:bindedColumnValue
        },{
            columnName:"FMPSQLite3SingleArrayTableArrayIndexColumn",
            //currentValue可能为空
            value:newIndex
        },...firstData)
        //递归地添加后面的值
        this.unshift(bindedColumnValue,...values)
    }
    pop(bindedColumnValue:any){
        const currentValue=this.get(bindedColumnValue)
        if(currentValue.length==0)return undefined
        this.session.runSync(`DELETE FROM ${this.table} WHERE FMPSQLite3SingleArrayTableForignKeyColumn=? AND FMPSQLite3SingleArrayTableArrayIndexColumn=?`,bindedColumnValue,currentValue[currentValue.length-1].FMPSQLite3SingleArrayTableArrayIndexColumn)
        return currentValue[currentValue.length-1]
    }
    splice(bindedColumnValue:any,position:number,howmany?:number,...values:{columnName:string,value:any}[][]){
        //splice需要先删除元素，再调用一次insert将新元素添加进去
        const currentValue=this.get(bindedColumnValue)
        //等于undefined时删除从position开始到最后的所有元素
        if(howmany==undefined){
            for(let indexOfDeleting=position;indexOfDeleting<position+currentValue.length;indexOfDeleting++){
                //如果要删除的位置已经超出数组边界了，就可以不继续，直接break了
                if(indexOfDeleting>currentValue.length-1)break;
                this.session.runSync(`DELETE FROM ${this.table} WHERE FMPSQLite3SingleArrayTableForignKeyColumn=? AND FMPSQLite3SingleArrayTableArrayIndexColumn=?`,bindedColumnValue,currentValue[indexOfDeleting].FMPSQLite3SingleArrayTableArrayIndexColumn)
            }
        }
        //等于0时证明不需要删除任何元素，跳过并什么也不做
        else if(howmany!=0){        
            for(let indexOfDeleting=position;indexOfDeleting<position+howmany;indexOfDeleting++){
                //如果要删除的位置已经超出数组边界了，就可以不继续，直接break了
                if(indexOfDeleting>currentValue.length-1)break;
                this.session.runSync(`DELETE FROM ${this.table} WHERE FMPSQLite3SingleArrayTableForignKeyColumn=? AND FMPSQLite3SingleArrayTableArrayIndexColumn=?`,bindedColumnValue,currentValue[indexOfDeleting].FMPSQLite3SingleArrayTableArrayIndexColumn)
            }
        }
        //删除完毕后，再调用insert方法添加元素
        this.insert(bindedColumnValue,position,...values)
    }
}