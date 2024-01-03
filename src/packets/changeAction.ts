import { UserStats, UserPresence } from '../serverPackets.ts';
import playerList from '../state/players.ts'
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: string | Buffer) {
    data = data.toString();
    const reader = new PacketReader(data);
    user.actionID = reader.byte();
    user.actionText = reader.string();
    user.beatmapChecksum = reader.string();
    user.actionMods = reader.int();
    user.playMode = reader.byte();
    user.beatmapID = reader.int();

    if (user.actionID == 0 && (user.actionMods & 128)) {
        user.actionText = "on Relax";
    }

    // TODO: append mods to the end of action text if playing

    for (const p of playerList.players) {
        p.enqueue(UserPresence(user));
        p.enqueue(UserStats(user));
    }
}