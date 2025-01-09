import {earlyInitedScoreboards} from "../Events/Process.js"
import { serverStarted } from "../Events/Process.js"
export class FMPScoreboard{
    rawScoreboard:Objective
    userSetName:string
    userSetDisplayeName:string|undefined
    constructor(name:string,displayName?:string){
        this.userSetDisplayeName=displayName
        this.userSetName=name
        //如果服务器仍未开启，就把计分板初始化放到队列里，等开服之后再注册
        if(!serverStarted){
            earlyInitedScoreboards.push()
            return;
        }
        this.init()
    }
    init(){
        let objective=mc.getScoreObjective(this.userSetName)
        if(objective==null){
            FMPScoreboard.createObjective(this.userSetName,this.userSetDisplayeName)
            objective=mc.getScoreObjective(this.userSetName)
        }
        if(objective==undefined)throw new Error("在初始化计分板时，无法创建这个计分板")
        this.rawScoreboard=objective
    }
    get name():string{
        return this.rawScoreboard.name
    }
    get displayName():string{
        return this.rawScoreboard.displayName
    }
    get(playerName:string):number{
        return this.rawScoreboard.getScore(playerName)
    }
    set(playerName:string,value:number):boolean{
        return Boolean(this.rawScoreboard.setScore(playerName,value))
    }
    add(playerName:string,value:number):boolean{
        return Boolean(this.rawScoreboard.addScore(playerName,value))
    }
    reduce(playerName:string,value:number):boolean{
        return Boolean(this.rawScoreboard.reduceScore(playerName,value));
    }
    delete(playerName:string):boolean{
        return this.rawScoreboard.deleteScore(playerName)
    }
    setDisplay(position:ScoreboardDisplayPosition,sortByDescending:boolean=false){
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
        this.rawScoreboard.setDisplay(llseDisplayPositionTypeString)
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