import { FellowSpecJoined, SpecJoined } from '../serverPackets.ts';
import playerList from '../state/players.ts';
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: string | Buffer) {
    data = data.toString();
    const reader = new PacketReader(data);
    const user_id = reader.int();
    const pl = playerList.getById(user_id);

    if (pl === null) {
        return;
    }

    user.spectating = pl;
    pl.enqueue(SpecJoined(user.id));
    pl.spectators.push(user);

    for (const p of pl.spectators) {
        if (p.id === user.id) {
            continue;
        }
        p.enqueue(FellowSpecJoined(user.id));
    }
}