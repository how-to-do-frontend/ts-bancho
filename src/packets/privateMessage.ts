import { Message } from '../serverPackets.ts';
import playerList from '../state/players.ts';
import Player from '../objects/player.ts';
import { PacketReader } from '../packet.ts';

export default function (user: Player, data: any) {
    const reader = new PacketReader(data)
    reader.ReadString();
    const message = reader.ReadString();
    const target = reader.ReadString();
    reader.ReadI32();

    const pl = playerList.getByUsername(target);
    pl?.enqueue(Message(
        user.username,
        message,
        target,
        user.id
    ));
}