import Player from '../objects/player.ts';
import { SpecFrames } from '../serverPackets.ts';

export default function (user: Player, data: Buffer) {
    // THIS IS REALLY FUCKING STUPID BUT NOTHING ELSE WOULD WORK
    data = Buffer.from(data);
    data.writeInt16LE(15, 0)
    for (const s of user.spectators) {
        s.enqueue(data);
    }
}