import { FMPDimension } from "./Game/Dimension";
import { FMPLocation } from "./Game/Location";
import { randomBytes } from 'crypto';

export class TwoWayMap<L,R>{
    leftTable:Map<L,R>;
    rightTable:Map<R,L>=new Map<R,L>();
    constructor(data:Map<L,R>){
        this.leftTable=data;
        this.leftTable.forEach((value,key,map)=>{
            if(this.rightTable.has(value))throw new Error("无法从此数据创建双向映射表，因为右侧索引包含重复数据。");
            this.rightTable.set(value,key)
        })
    }
    toRight(key:L):R|undefined{
        return this.leftTable.get(key)
    }
    toLeft(key:R):L|undefined{
        return this.rightTable.get(key)
    }
    add(left:L,right:R){
        if(this.leftTable.has(left)||this.rightTable.has(right))throw new Error("添加失败！添加的数据中左侧或右侧索引与现有数据存在重复。")
        this.leftTable.set(left,right);
        this.rightTable.set(right,left);
    }
    hasLeft(left:L){
        return this.leftTable.has(left);
    }
    hasRight(right:R){
        return this.rightTable.has(right)
    }
    delLeft(left:L){
        let right=this.toRight(left)
        if(right!=undefined)this.rightTable.delete(right)
        this.leftTable.delete(left);
    }
    delRight(right:R){
        let left=this.toLeft(right)
        if(left!=undefined)this.leftTable.delete(left)
        this.rightTable.delete(right);
    }
}
export class FMPRegionRectangle{
    posnwu:FMPLocation;
    possed:FMPLocation;
    is2d:boolean;
    dimension:FMPDimension
    /**
     * 会取输入的第一个坐标的维度作为区域所在维度
     * @param {FloatPos} pos1 第一个坐标
     * @param {FloatPos} pos2 第二个坐标
     * @param {boolean} is2d 是否是二维区域
     */
    constructor(pos1:FMPLocation,pos2:FMPLocation,is2d:boolean){
        //西北方向是正
        //其中x+是西，z+是北
        let largeSmall=FMPRegionRectangle.largestAndSmallestPos(pos1,pos2);
        /**矩形区域的上西北角（三个坐标均最大） */
        this.posnwu=largeSmall.large;
        /**矩形区域的下东南角（三个坐标均最小） */
        this.possed=largeSmall.small;
        /**是否为2d区域 */
        this.is2d=is2d;
        /**区域所在维度id */
        this.dimension=pos1.dimension
    }
    /**
     * 比较两个坐标的大小  
     * 注意，此方法不会比较维度，第一个坐标的维度会存储在最大坐标，第二个坐标的维度会存储在最小坐标
     * @param {FloatPos} pos1 第一个坐标
     * @param {FloatPos} pos2 第二个坐标
     * @returns {Object} FloatPos类的最大和最小坐标组成的对象，包含属性large最大坐标和small最小坐标
     */
    static largestAndSmallestPos(pos1:FMPLocation,pos2:FMPLocation){
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
            large:new FMPLocation(x.large,y.large,z.large,pos1.dimension),
            small:new FMPLocation(x.small,y.small,z.small,pos2.dimension)
        };
    }

    /**
     * 坐标是否正在区域里面
     * @param {FloatPos} pos 要用来比较的坐标
     * @returns {boolean} 是否正在区域里面
     */
    isInRegion(pos:FMPLocation):boolean{
        if(this.posnwu.x>=pos.x&&
            this.possed.x<=pos.x&&

            this.posnwu.z>=pos.z&&
            this.possed.z<=pos.z&&

            this.dimension==pos.dimension){
            if(this.is2d || (this.posnwu.y>=pos.y&&this.possed.y<=pos.y)){
                return true;
            }
		}
        return false;
    }
}

export function newUUID4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => {
        const random = randomBytes(1)[0]; // 使用 randomBytes 生成一个随机字节
        return (parseInt(c) ^ (random & 15 >> (parseInt(c) / 4))).toString(16);
    });
}
