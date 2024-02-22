import * as fs from "fs";
import { FMPLogger } from "./Logger";
export class FMPFile{
    static ls(path:string):string[]{
        return []
    }
    static initDir(path:string){
    }
    static initFile(path:string){
    }
    static read(path:string):string{
        return ""
    }
    static copy(source:string,destination:string){
    }
    static forceWrite(path:string,content:string){
    }
    /**
     * 重命名或移动一个文件  
     * 要移动文件，修改其路径即可
     * @param path 文件路径
     * @param target 重命名后的文件名（路径）
     */
    static rename(path:string,target:string){
    }
    /**
     * 永久删除一个文件或文件夹，不放入系统回收站  
     * 尽量不使用此方法，文件删除后无法恢复，有数据安全隐患
     * @param path 文件或文件夹路径
     */
    static permanently_delete(path:string){
    }
}
export class FMPDirectory{
    folders:string[];
    constructor(dir:string){
        this.folders=dir.split(/[/|\\]/);
    }
    toString(backslash=true):string{
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