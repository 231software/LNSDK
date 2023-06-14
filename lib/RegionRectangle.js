/**
 * 矩形区域类  
 */
class RegionRectangle{
    /**
     * 会取输入的第一个坐标的维度作为区域所在维度
     * @param {FloatPos} pos1 第一个坐标
     * @param {FloatPos} pos2 第二个坐标
     * @param {boolean} is2d 是否是二维区域
     */
    constructor(pos1,pos2,is2d){
        //西北方向是正
        //其中x+是西，z+是北
        let largeSmall=RegionRectangle.largestAndSmallestPos(pos1,pos2);
        /**矩形区域的上西北角（三个坐标均最大） */
        this.posnwu=largeSmall.large;
        /**矩形区域的下东南角（三个坐标均最小） */
        this.possed=largeSmall.small;
        /**是否为2d区域 */
        this.is2d=is2d;
        /**区域所在维度id */
        this.dimid=pos1.dimid
    }
    /**
     * 比较两个坐标的大小  
     * 注意，此方法不会比较维度，第一个坐标的维度会存储在最大坐标，第二个坐标的维度会存储在最小坐标
     * @param {FloatPos} pos1 第一个坐标
     * @param {FloatPos} pos2 第二个坐标
     * @returns {Object} FloatPos类的最大和最小坐标组成的对象，包含属性large最大坐标和small最小坐标
     */
    static largestAndSmallestPos(pos1,pos2){
        let x={large:0,small:0},y={large:0,small:0},z={large:0,small:0};
        //取三个坐标轴上最大最小值
        if(pos1.x>pos2.x){
            x.large=pos1.x
            x.small=pos2.x
        }
        else{
            x.large=pos2.x
            x.small=pos1.x
        }
    
        if(pos1.y>pos2.y){
            y.large=pos1.y
            y.small=pos2.y
        }
        else{
            y.large=pos2.y
            y.small=pos1.y
        }
    
        if(pos1.z>pos2.z){
            z.large=pos1.z
            z.small=pos2.z
        }
        else{
            z.large=pos2.z
            z.small=pos1.z
        }
    
        return {
            large:new FloatPos(x.large,y.large,z.large,pos1.dimid),
            small:new FloatPos(x.small,y.small,z.small,pos2.dimid)
        };
    }

    /**
     * 坐标是否正在区域里面
     * @param {FloatPos} pos 要用来比较的坐标
     * @returns {boolean} 是否正在区域里面
     */
    isInRegion(pos){
        if(this.posnwu.x>=pos.x&&
            this.possed.x<=pos.x&&

            this.posnwu.z>=pos.z&&
            this.possed.z<=pos.z&&

            this.dimid==pos.dimid){
            if(this.is2d || (this.posnwu.y>=pos.y&&this.possed.y<=pos.y)){
                return true;
            }
		}
        return false;
    }
}
module.exports=RegionRectangle;