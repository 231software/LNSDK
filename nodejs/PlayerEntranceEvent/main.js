const PLUGIN_NAME="PlayerEntranceEvent"

const llversion = ll.requireVersion(2,9,2)?[0,0,1,Version.Beta]:[0,0,1]
ll.registerPlugin(PLUGIN_NAME, "提供玩家进入或退出矩形区域的事件", llversion,{Author:"小鼠同学"});

const JsonFile=require(".\\lib\\JsonFile.js");
const Listener=require(".\\lib\\listenAPI.js");
const RegionRectangle=require("./lib/RegionRectangle.js");
const BorderListener=require("./BoarderListener.js")

//导出函数用的接口
ll.exports(newAreaListener,"PlayerEntranceEvent","newAreaListener");

/**
 * 
 * @param {RegionRectangle} region 要监听的区域
 * @param {Array} listenerParameters 监听的导数以及参数，只影响灵敏度和性能 
 */
function newAreaListener(region,listenerParameters){
    
}

/*
测试：创建区域
*/
let testAreas=[];
for(let i=1;i<=1000;i++){
    let pos1=new FloatPos(i*2,i*2,i*2,0);
    let pos2=new FloatPos(i*2+1,i*2+1,i*2+1,0);
    testAreas.push(new RegionRectangle(pos1,pos2,true))
}
mc .listen("onTick",()=>{
    //test();
})
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