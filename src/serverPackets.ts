import { PacketWriter } from "./packet.ts";
import Player from './objects/player.ts'

enum ServerPackets {
    UserID = 5,
    Message = 7,
    UserStats = 11,
    SpecJoined = 13,
    SpecFrames = 15,
    Notify = 24,
    FellowSpecJoined = 42,
    ClientPerms = 71,
    Protocol = 75,
    UserPresence = 83,
    Restart = 86,
    ChanInfoEnd = 89
}

let pw: PacketWriter = new PacketWriter();

export function UserID(userID: number) : Buffer {
    return pw.WriteI32(userID).Pack(ServerPackets.UserID);
}

export function Message(senderName: string, content: string, target: string, senderID: number) : Buffer {
    return pw.WriteString(senderName)
             .WriteString(content)
             .WriteString(target)
             .WriteI32(senderID)
             .Pack(ServerPackets.Message);
}

export function UserStats(player: Player) : Buffer {
    console.log(player.playMode);
    return pw.WriteI32(player.id)
             .WriteU8(player.actionID)
             .WriteString(player.actionText)
             .WriteString(player.beatmapChecksum)
             .WriteI32(player.actionMods)
             .WriteU8(player.playMode)
             .WriteI32(player.beatmapID)
             .WriteI64(player.stats.rscore)
             .WriteF32(player.stats.acc / 100)
             .WriteI32(player.stats.playcount)
             .WriteI64(player.stats.tscore)
             .WriteI32(player.stats.rank)
             .WriteI16(player.stats.pp)
             .Pack(ServerPackets.UserStats);
}

export function SpecJoined(userID: number) : Buffer {
    return pw.WriteI32(userID).Pack(ServerPackets.SpecJoined);
}

export function SpecFrames(frames: Buffer) : Buffer {
    return pw.WriteRaw(frames).Pack(ServerPackets.SpecFrames);
}

export function Notify(message: string) : Buffer {
    return pw.WriteString(message).Pack(ServerPackets.Notify);
}

export function FellowSpecJoined(userID: number) {
    return pw.WriteI32(userID).Pack(ServerPackets.FellowSpecJoined);
}

export function ClientPerms(perms: number) : Buffer{
    return pw.WriteI32(perms).Pack(ServerPackets.ClientPerms);
}

export function Protocol(protocol: number) : Buffer {
    return pw.WriteI32(protocol).Pack(ServerPackets.Protocol);
}

export function UserPresence(player: Player) : Buffer {
    return pw.WriteI32(player.id)
             .WriteString(player.username)
             .WriteU8(player.utc_offset + 24)
             .WriteU8(player.country)
             .WriteU8(player.perms)
             .WriteF32(player.lng)
             .WriteF32(player.lat)
             .WriteI32(player.stats.rank)
             .Pack(ServerPackets.UserPresence);
}

export function Restart(delay: number) : Buffer {
    return pw.WriteI32(delay).Pack(ServerPackets.Restart);
}

export function ChannelInfoEnd() : Buffer {
    return pw.Pack(ServerPackets.ChanInfoEnd);
}