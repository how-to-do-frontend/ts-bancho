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
    UserPresence = 84,
    Restart = 86,
    ChanInfoEnd = 89
}

let pw = new PacketWriter();

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
    return pw.WriteI32(player.id)
             .WriteU8(player.actionID)
             .WriteString(player.actionText)
             .WriteString(player.beatmapChecksum)
             .WriteI32(player.actionMods)
             .WriteU8(player.playMode)
             .WriteI32(player.beatmapID)
             .WriteI64(BigInt(0))
             .WriteF32(100.00)
             .WriteI32(0)
             .WriteI64(BigInt(0))
             .WriteI32(1)
             .WriteI16(0)
             .Pack(ServerPackets.UserStats);
}

export function SpecJoined(userID: number) {
    return pw.WriteI32(userID).Pack(ServerPackets.SpecJoined);
}

export function SpecFrames(frames: Buffer) {
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
             .WriteU8((player.perms) | (player.playMode << 5))
             .WriteF32(player.lng)
             .WriteF32(player.lat)
             .WriteI32(1)
             .Pack(ServerPackets.UserPresence);
}

export function Restart(delay: number) : Buffer {
    return pw.WriteI32(delay).Pack(ServerPackets.Restart);
}

export function ChannelInfoEnd() : Buffer {
    return pw.Pack(ServerPackets.ChanInfoEnd);
}