import {} from "@grakkit/stdlib-paper"
const Bukkit=core.type("org.bukkit.Bukkit")

//grakkit只支持info一个日志等级
export class FMPLogger{
    static debug(...args:any){
        //Bukkit.getLogger().info(argsToString([...args]));
    }
    static info(...args:any){
        Bukkit.getLogger().info(argsToString([...args]));
    }
    static warn(...args:any){
        Bukkit.getLogger().warning(argsToString([...args]));
    }
    static error(...args:any){
        Bukkit.getLogger().severe(argsToString([...args]));
    }
    static fatal(...args:any){
        Bukkit.getLogger().severe(argsToString([...args]));
    }
}

function argsToString(args:any[]){
    let output=""
    for(const arg of args)output+=arg+" "
    output=output.slice(0,output.length-1)
    return output
}