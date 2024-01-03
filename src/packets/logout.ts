import Player from '../objects/player.ts';
import playerList from '../state/players.ts';
import { Logout } from '../serverPackets.ts';

export default function (user: Player, data: Buffer) {
    playerList.removePlayer(user); // remove from internal player list
    playerList.enqueue(Logout(user.id))
    if (user.spectating) {
        const host = user.spectating as Player
        user.spectating = null;
        if (host.spectators) {
            host.spectators.splice(host.spectators.indexOf(user), 1); // LOL
        }
    }
    for (const s of user.spectators) {
        s.spectating = null;
    }
    user.spectators = [];
}