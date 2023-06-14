const PLUGIN_NAME="PlayerEntranceEvent"

const JsonFile=require("..\\..\\lib\\JsonFile.js");
const Listener=require("..\\..\\lib\\listenAPI.js");
const RegionRectangle=require("..\\..\\lib\\RegionRectangle.js");
//const BorderListener=require(".\\BoarderListener.js")

class GlobalEntranceManager{
    /**
     * @param {Map<string, EntranceEvent>} events 区域事件列表
     * */
    static events=new Map()
    static players=[];
    static checkPosPointer=0;
    /**
     * 定时执行检查中的一步检查
     */
    static checkPos(){
        //通过步进选取一个玩家来检查
        //重置指针
        if(GlobalEntranceManager.checkPosPointer>=GlobalEntranceManager.players.length){
            GlobalEntranceManager.checkPosPointer=0;
        }
        //如果指针指向了空的位置证明这个玩家下线，直接退出
        //实测这个东西似乎是，玩家下线了之后，实例仍然存在，但是里面所有原来的属性方法全变成null，所以必须通过里面原先就有的属性判断
        if(GlobalEntranceManager.players[GlobalEntranceManager.checkPosPointer].realName==null){
            return;
        }
        const currentPlayer=GlobalEntranceManager.players[GlobalEntranceManager.checkPosPointer]

        //执行检查特定玩家在哪些区域内
        let regionsIn = this.checkPlayerPos(currentPlayer);
        /**@deprecated */
        //尝试触发所有位于的区域对应的监听
        regionsIn.forEach((currentEvent)=>{
            //currentEvent.event.exec(currentEvent.region,currentPlayer);
        })
        //指针偏移一次
        GlobalEntranceManager.checkPosPointer++;
    }
    /**
     * 检查特定玩家在哪些区域内
     * @param {Player} player 要检查的玩家
     * @returns {EntranceEvent[]} 被检查的玩家位于的区域
     */
    static checkPlayerPos(player){
        let regionsIn=[];
        GlobalEntranceManager.events.forEach((currentEvent)=>{
            //玩家是否在当前这个区域内
            //if(GlobalEntranceManager.events.get(eventName).region.isInRegion(player.pos)){
                //如果在区域内，就把这个区域对应的事件加入到所有玩家位于的区域那个列表
                //regionsIn.push(GlobalEntranceManager.events.get(eventName));
                //如果在区域内，则检查是否应执行触发进入
            //}
            //此处遍历了区域与玩家之前的关系，挨个检查是要触发进入还是退出
            //log(currentEvent)
            currentEvent.triggerEvent(player)
        })
        return regionsIn;
    }
    /**
     * 刷新缓存的玩家列表
     */
    static refreshPlayers(){
        GlobalEntranceManager.players=mc.getOnlinePlayers()
    }
}
class EntranceEvent{
    static player_status={};
    /**
     * 
     * @param {Listener} event 对应的Listener实例
     * @param {RegionRectangle} region 对应的区域实例
     */
    constructor(event,region,eventName){
        /**@param {Listener} event 对应的Listener实例 */
        this.event=event;
        /**@param {RegionRectangle} region 对应的区域实例 */
        this.region=region;
        this.eventName=eventName;
        this.inside=false;
    }
    /**
     * 检查应触发进入退出
     */
    triggerEvent(player){
        let inside=this.region.isInRegion(player.pos);
        //log(player.name+inside.toString()+", "+EntranceEvent.player_status[player.xuid][this.eventName])
        //log("inside:"+inside.toString());
        //log("EntranceEvent.player_status[player.xuid][this.eventName]:"+EntranceEvent.player_status[player.xuid][this.eventName])
        //let test = (inside!=EntranceEvent.player_status[player.xuid][this.eventName])
        //log(inside!=EntranceEvent.player_status[player.xuid][this.eventName])
        //log(test.toString())
        //玩家此时相对区域的状态有没有变化，如果变化了就应该触发监听
        if(inside!=EntranceEvent.player_status[player.xuid][this.eventName]){
            //log("触发")
            this.execute(player,inside)
            EntranceEvent.player_status[player.xuid][this.eventName]=inside;
        }
    }
    /**
     * 触发此事件
     * @param {Player} player 触发事件的玩家
     * @param {boolean} entrnaceBehavior true为进入false为退出
     */
    execute(player,entrnaceBehavior){
        //触发事件时回调：玩家对象，是否是进入
        this.event.exec(player,entrnaceBehavior);
    }
}

//初始化监听器
Listener.init(PLUGIN_NAME)

//导出函数用的接口
ll.exports(newAreaListener,"PlayerEntranceEvent","newAreaListener");

/**
 * 插件请求创建事件  
 * @param {RegionRectangle} region 要监听的区域
 * @returns {string} 监听器名，后面一段是随机生成的字符
 */
function newAreaListener(pos1,pos2,is2d){
    let region=new RegionRectangle(pos1,pos2,is2d)
    //生成事件名
    const eventName="onPlayerEntrance,ID:"+system .randomGuid()
    //从事件名生成这个事件
    let entranceEvent=new Listener(eventName);
    //将生成的事件加入事件库
    GlobalEntranceManager.events.set(eventName,new EntranceEvent(entranceEvent,region,eventName));
    //返回生成的事件的事件名
    return eventName;
}

/**
 * 定时检查玩家位置，后面要改逻辑来优化  
 * 这个在领地之前一定要做优化，不然会很卡  
 * 因为这个算法在时间复杂度上很高
 */
function intervalPosChk(){
    GlobalEntranceManager.checkPos();
}

mc .listen("onTick",intervalPosChk)
mc.listen("onJoin",(player)=>{
    EntranceEvent.player_status[player.xuid]={}
    GlobalEntranceManager.refreshPlayers();
})
mc.listen("onLeft",(player)=>{
    GlobalEntranceManager.refreshPlayers();
})

/*
逻辑：
插件先调用这个事件的接口，创建一个事件
创建好了之后，这个函数会返回创建好的监听器名，然后这边一注册就好了
*/

/*
测试：创建区域
*/
let testAreas=[];
for(let i=1;i<=1000;i++){
    let pos1=new FloatPos(i*2,i*2,i*2,0);
    let pos2=new FloatPos(i*2+1,i*2+1,i*2+1,0);
    testAreas.push(new RegionRectangle(pos1,pos2,true))
}

async function test(){
    let time1=new Date();
    testAreas.forEach((currentValue)=>{
        for(let i=1;i<=50;i++){
            currentValue.isInRegion(new FloatPos(0,0,0,0));
        }
    })
    let time2=new Date();
    log(time2.getTime()-time1.getTime());    
}

let testevent=new Listener("onPlayerEntranceEventTest");


const llversion = ll.requireVersion(2,9,2)?[0,0,1,Version.Beta]:[0,0,1]
ll.registerPlugin(PLUGIN_NAME, "提供玩家进入或退出矩形区域的事件", llversion,{Author:"小鼠同学"});