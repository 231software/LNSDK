
export class FMPScoreboard{
    name:string
    displayName:string|undefined
    constructor(name:string,displayName?:string){
        this.name=name
        this.displayName=displayName
    }
    get(playerName:string):number{
        return 0;
    }
    set(playerName:string,value:number):boolean{
        return false;
    }
    add(playerName:string,value:number):boolean{
        return false;
    }
    reduce(playerName:string,value:number):boolean{
        return false;
    }
    delete(playerName:string):boolean{
        return false;
    }
    setDisplay(position:ScoreboardDisplayPosition,sortByDescending:boolean=false){
        
    }

    static getObjective(name:string):FMPScoreboard|undefined{
        return undefined;
    }
    static createObjective(name:string,displayName?:string):boolean{
        return false
    }
    static removeObjective(name:string):boolean{
        return false
    }
    static getAllObjective():FMPScoreboard[]{
        return [];
    }


}
export enum ScoreboardDisplayPosition{
    Sidebar,
    BelowName,
    List
}