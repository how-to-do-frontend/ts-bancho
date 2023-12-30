import Player from '../objects/player.ts';

export default function (user: Player, data: any) {
    for (const s of user.spectators) {
        console.log(user.username + " sent a spec frame LOL")
        s.enqueue(data);
    }
}