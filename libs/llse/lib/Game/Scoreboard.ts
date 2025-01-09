import { serverStarted } from "../Events/Process.js"
import { FMPLogger } from "../Logger.js"
import { FMPPlayer } from "./Player.js"
export class FMPScoreboard{
    //rawScoreboard:Objective
    userSetName:string
    userSetDisplayeName:string|undefined
    constructor(name:string,displayName?:string){
        this.userSetDisplayeName=displayName
        this.userSetName=name
        let objective=mc.getScoreObjective(this.userSetName)
        if(objective==null){
            FMPScoreboard.createObjective(this.userSetName,this.userSetDisplayeName)
            objective=mc.getScoreObjective(this.userSetName)
        }
        if(objective==null)throw new Error("在初始化计分板时，无法创建这个计分板")
        //this.rawScoreboard=objective
    }
    get name():string{
        //return this.rawScoreboard.name
        return this.userSetName
    }
    get displayName():string{
        FMPLogger.error("由于不知道LLSE或LSE获取无displayName的计分板此属性的行为，计分板的displayName暂时只能获得空字符串。请向LNSDK开发者寻求帮助。")
        return ""
    }
    get(playerName:string):number{
        const rawPlayer:Player|null=mc.getPlayer(playerName)
        if(rawPlayer==null){
            FMPLogger.error("找不到玩家"+playerName+"。LNSDK目前不支持在LLSE上操作离线玩家的计分板或虚拟计分板。请向LNSDK开发者寻求帮助。")
            return 0;
        }
        return rawPlayer.getScore(this.userSetName)
    }
    set(playerName:string,value:number):boolean{
        const rawPlayer:Player|null=mc.getPlayer(playerName)
        if(rawPlayer==null){
            FMPLogger.error("找不到玩家"+playerName+"。LNSDK目前不支持在LLSE上操作离线玩家的计分板或虚拟计分板。请向LNSDK开发者寻求帮助。")
            return false
        }
        return rawPlayer.setScore(this.userSetName,value)
    }
    add(playerName:string,value:number):boolean{
        const rawPlayer:Player|null=mc.getPlayer(playerName)
        if(rawPlayer==null){
            FMPLogger.error("找不到玩家"+playerName+"。LNSDK目前不支持在LLSE上操作离线玩家的计分板或虚拟计分板。请向LNSDK开发者寻求帮助。")
            return false
        }
        return rawPlayer.setScore(this.userSetName,value)
    }
    reduce(playerName:string,value:number):boolean{
        const rawPlayer:Player|null=mc.getPlayer(playerName)
        if(rawPlayer==null){
            FMPLogger.error("找不到玩家"+playerName+"。LNSDK目前不支持在LLSE上操作离线玩家的计分板或虚拟计分板。请向LNSDK开发者寻求帮助。")
            return false
        }
        return rawPlayer.reduceScore(this.userSetName,value)
    }
    delete(playerName:string):boolean{
        const object=mc.getScoreObjective(this.userSetName)
        if(object==undefined)throw new Error("插件运行过程中计分板"+this.name+"意外消失，插件无法继续工作。")
        return object.deleteScore(playerName)
    }
    setDisplay(position:ScoreboardDisplayPosition,sortByDescending:boolean=false){
        const object=mc.getScoreObjective(this.userSetName)
        if(object==undefined)throw new Error("插件运行过程中计分板"+this.name+"意外消失，插件无法继续工作。")
        let llseDisplayPositionTypeString:"belowname"|"list"|"sidebar"="sidebar";
        switch(position){
            case ScoreboardDisplayPosition.BelowName:{
                llseDisplayPositionTypeString="belowname";
                break;
            }
            case ScoreboardDisplayPosition.List:{
                llseDisplayPositionTypeString="list";
                break;
            }
            case ScoreboardDisplayPosition.BelowName:{
                llseDisplayPositionTypeString="sidebar";
                break;
            }
        }
        object.setDisplay(llseDisplayPositionTypeString)
    }

    static getObjective(name:string):FMPScoreboard|undefined{
        const rawScoreboard=mc.getScoreObjective(name)
        if(rawScoreboard==null)return undefined;
        return new FMPScoreboard(name,rawScoreboard.displayName)
    }
    static createObjective(name:string,displayName?:string):boolean{
        const displayNameFinal=displayName!=undefined?displayName:name
        const rawScoreboard=mc.newScoreObjective(name,displayNameFinal)
        if(rawScoreboard==null)return false
        return true
    }
    static removeObjective(name:string):boolean{
        return mc.removeScoreObjective(name)
    }
    static getAllObjective():FMPScoreboard[]{
        const objectives:FMPScoreboard[]=[]
        for(let rawObjective of mc.getAllScoreObjectives()){
            objectives.push(new FMPScoreboard(rawObjective.name,rawObjective.displayName))
        }
        return objectives;
    }


}
export enum ScoreboardDisplayPosition{
    Sidebar,
    BelowName,
    List
}