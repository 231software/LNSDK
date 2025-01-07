/** 截至1.20.60原版一共有6个any最低internal最高 */
export enum LNInternalPermission{
    Any=0,
    Admin,
    GameMasters,
    HostPlayer,
    Console,
    Internal
}
export function toll2PermType(perm:LNInternalPermission):PermType{
    switch(perm){
        case LNInternalPermission.Any:return PermType.Any
        case LNInternalPermission.Admin:return PermType.Admin
        default:
        case LNInternalPermission.GameMasters:return PermType.GameMasters
        case LNInternalPermission.HostPlayer:return PermType.HostPlayer
        case LNInternalPermission.Console:return PermType.Console
        case LNInternalPermission.Internal:return PermType.Internal
    }
}