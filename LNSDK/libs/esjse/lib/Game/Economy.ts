import {FMPPlayer} from "./Player.js"
import { FMPScoreboard } from "./Scoreboard.js"
export class FMPCurrency{
    name:string
    bindedScoreboardObjective:FMPScoreboard
    constructor(name:string){
        this.name=name
        this.bindedScoreboardObjective=new FMPScoreboard(name)
    }
    get(playerUID:string):number{
        return this.bindedScoreboardObjective.get(playerUID)
    }
    set(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.set(playerUID,value)
    }
    add(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.add(playerUID,value)
    }
    reduce(playerUID:string,value:number):Boolean{
        return this.bindedScoreboardObjective.reduce(playerUID,value)
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