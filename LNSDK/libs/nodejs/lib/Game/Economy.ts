import {FMPPlayer} from "./Player.js"
export class FMPCurrency{
    name:string
    constructor(name:string){
        this.name=name
    }
    get(playerUID:string):number{
        return 0;
    }
    set(playerUID:string,value:number):Boolean{
        return false
    }
    add(playerUID:string,value:number):Boolean{
        return false;
    }
    reduce(playerUID:string,value:number):Boolean{
        return false;
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