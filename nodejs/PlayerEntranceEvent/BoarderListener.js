
const RegionRectangle=require("./lib/RegionRectangle.js");

class BorderListener{
    //frequency是每多少刻执行一次，不是按秒来的
    /**
     * 
     * @param {Player} player 要监听的玩家
     * @param {RegionRectangle} region 要监听的边界
     * @param {number} distance 距离
     * @param {number} frequency 每多少刻执行一次
     */
    constructor(player,region,distance,frequency){
        this.region=region;
        this.distance=distance;
        this.frequency=frequency;
        this.interval=setInterval(()=>{
            /*这里轮询的是判断玩家是否离边界距离太近
            计算在Rectangle类里
            算法：
            如果玩家的两个维度直接在区域的对应维度范围内
            直接对比另一个坐标与另一个维度上边界的距离
            否则，
            如果只有一个维度在范围内，

            
            如果都不在范围内
            */
        },frequency*50)
    }
    stop(){
        clearInterval(this.interval);
    }
    /*每20刻执行一次，每秒执行1刻
    每10刻执行一次，每秒执行2次
    每x刻*每秒执行x次=20
    每x刻执行一次，每秒执行20/第x刻执行一次 次
    每x毫秒秒执行一次，每毫秒执行1/x次
    每刻=50毫秒
    每毫秒=1/50刻
    每2刻执行一次，每100ms执行一次
    每x刻执行一次，每100x ms执行一次
    每1000毫秒执行x次，每20/x刻执行一次
    
    */
}
module.exports=BorderListener;