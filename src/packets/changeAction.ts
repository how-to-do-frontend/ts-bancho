import { UserStats, UserPresence } from '../serverPackets.ts';
import playerList from '../state/players.ts'
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: any) {
    const reader = new PacketReader(data);
    user.actionID = reader.ReadU8();
    user.actionText = reader.ReadString();
    user.beatmapChecksum = reader.ReadString();
    user.actionMods = reader.ReadU32();
    user.playMode = reader.ReadU8();
    user.beatmapID = reader.ReadI32();

    if (user.actionID == 0 && (user.actionMods & 128)) {
        user.actionText = "on Relax";
    }

    // TODO: append mods to the end of action text if playing

    for (const p of playerList.players) {
        p.enqueue(UserPresence(user));
        p.enqueue(UserStats(user));
    }
}