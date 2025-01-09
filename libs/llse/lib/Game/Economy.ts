import { FMPLogger } from "../Logger.js"
import {FMPPlayer} from "./Player.js"
import { FMPScoreboard } from "./Scoreboard.js"
export class FMPCurrency{
    name:string
    bindedScoreboardObjective:FMPScoreboard
    static tryToGetPlayerName(playerUID:string):string{
        const playerName=FMPPlayer.uuid2name(playerUID)
        if(playerName==undefined)throw new Error("找不到玩家uuid"+playerUID+"对应的信息，这可能是因为您服务器中的数据库丢失或损坏，或插件获取过错误的玩家uuid")
        return playerName
    }
    constructor(name:string){
        this.name=name
        this.bindedScoreboardObjective=new FMPScoreboard(name)
    }
    get(playerUID:string):number{
        return this.bindedScoreboardObjective.get(FMPCurrency.tryToGetPlayerName(playerUID))
    }
    set(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.set(FMPCurrency.tryToGetPlayerName(playerUID),value)
    }
    add(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.add(FMPCurrency.tryToGetPlayerName(playerUID),value)
    }
    reduce(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.reduce(FMPCurrency.tryToGetPlayerName(playerUID),value)
    }
    /**
     * 在一个玩家的存款中兑换一部分货币为另一种货币
     * @param targetCurrency 要兑换成的币种
     * @param amount 要兑换的数量
     * @param playerUID 兑换者的UID
     * @param rate 汇率
     */
    exchange(targetCurrency:FMPCurrency,amount:number,playerUID:string,rate:number=1):boolean{
        return false
    }
    static fromScoreboard(name:string):FMPCurrency{
        return new FMPCurrency(name)
    }
}