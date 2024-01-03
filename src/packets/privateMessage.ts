import { Message } from '../serverPackets.ts';
import playerList from '../state/players.ts';
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: Buffer | string) {
    data = data.toString();
    const reader = new PacketReader(data)
    reader.string();
    const message = reader.string();
    const target = reader.string();
    reader.int();

    const pl = playerList.getByUsername(target);
    pl?.enqueue(Message(
        user.username,
        message,
        target,
        user.id
    ));
}