/** 截至1.20.60原版一共有6个any最低internal最高 */
export enum FMPInternalPermission{
    Any=0,
    Admin,
    GameMasters,
    HostPlayer,
    Console,
    Internal
}
export function toll2PermType(perm:FMPInternalPermission):PermType{
    switch(perm){
        case FMPInternalPermission.Any:return PermType.Any
        case FMPInternalPermission.Admin:return PermType.Admin
        default:
        case FMPInternalPermission.GameMasters:return PermType.GameMasters
        case FMPInternalPermission.HostPlayer:return PermType.HostPlayer
        case FMPInternalPermission.Console:return PermType.Console
        case FMPInternalPermission.Internal:return PermType.Internal
    }
}