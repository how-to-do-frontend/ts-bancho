import { Response, Request } from 'express';
import HandleLogin from './login.ts';
import playerList from './state/players.ts';
import Player from './objects/player.ts';
import { PacketReader } from './packet.ts';
import { Notify, Restart } from './serverPackets.ts';
// Packets Import
import privateMessage from './packets/privateMessage.ts';
import changeAction from './packets/changeAction.ts';
import startSpectating from './packets/startSpectating.ts';
import spectateFrames from './packets/spectateFrames.ts';

async function HandleRequest(req: Request, res: Response) : Promise<void> {
    const tokenString = req.headers['osu-token'] as string;

    if (!tokenString) {
        // no token so it's logging in
        await HandleLogin(req, res);
    }
    else {
        // somebody's got packets to give us huh ?
        let resp : Buffer;
        const user = playerList.getByToken(tokenString) as Player;

        if (user !== null) {
            // user exists with valid token
            const reader = new PacketReader(req.body);
            const packets = reader.Parse();
            for (const p of packets) {
                switch (p.id) {
                    case 0:
                        // Change Action
                        changeAction(user, p.body);
                        continue;
                    case 4:
                        // Ping
                        continue;
                    case 16:
                        // Start Spectating
                        startSpectating(user, p.body);
                        continue;
                    case 18:
                        spectateFrames(user, p.body);
                        continue;
                    case 25:
                        // Private Message
                        privateMessage(user, p.body);
                        continue;
                    default:
                        console.log("Recieved unknown packet %s from %s", p.id.toString(), user.username);
                }
            }
            resp = user.dequeue();
        }
        else {
            // as far as we know, this user doesnt exist, so we force client to reconnect
            resp = Buffer.concat([Notify("Reconnecting..."), Restart(0)]); // TODO
        }

        res.end(resp)
    }
}

export default HandleRequest;