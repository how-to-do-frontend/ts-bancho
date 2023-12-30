import { FellowSpecJoined, SpecJoined } from '../serverPackets.ts';
import playerList from '../state/players.ts';
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: any) {
    const reader = new PacketReader(data);
    const user_id = reader.ReadI32();
    const pl = playerList.getById(user_id);

    if (pl === null) {
        return;
    }

    user.spectating = pl;
    pl.enqueue(SpecJoined(user.id));
    pl.spectators.concat(user);

    for (const p of pl.spectators) {
        if (p.id === user.id) {
            continue;
        }
        p.enqueue(FellowSpecJoined(user.id));
    }
}