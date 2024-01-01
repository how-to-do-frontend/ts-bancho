import { Response, Request } from 'express';
import * as Database from './state/db.ts';
import * as Utils from './utils.ts';
import { ChannelInfoEnd, ClientPerms, Notify, Protocol, UserID, UserPresence, UserStats } from './serverPackets.ts';
import * as fetch from 'node-fetch';
import { getCountryID } from './countries.ts'
import playerList from './state/players.ts';
import Player from './objects/player.ts'
import uuid from 'uuid-random';

interface ILoginRequest {
    username: string
    password_md5: string
    osu_version: string
    utc_offset: number
    display_city: boolean
    pm_private: boolean
    osu_path_md5: string
    adapters_string: string
    adapters_md5: string
    uninstall_md5: string
    disk_signature_md5: string
}

function UnmarshalLoginData(login_data: string) : ILoginRequest {
    const [username, password_md5, other_data] = login_data.split('\n');
    const [osu_version, utc_offset, display_city, client_hashes, pm_private] = other_data.split('|', 5);
    const [osu_path_md5, adapters_string, adapters_md5, uninstall_md5, disk_signature_md5] = client_hashes.split(':', 5);
    const login_req: ILoginRequest = {
        username: username,
        password_md5: password_md5,
        osu_version: osu_version,
        utc_offset: parseInt(utc_offset),
        display_city: !!display_city, 
        pm_private: !!pm_private,
        osu_path_md5: osu_path_md5,
        adapters_string: adapters_string,
        adapters_md5: adapters_md5,
        uninstall_md5: uninstall_md5,
        disk_signature_md5: disk_signature_md5
    };
    return login_req;
}

async function HandleLogin(req: Request, res: Response) : Promise<void> {
    try {
        // once to test
        UnmarshalLoginData(req.body);
    }
    catch {
        res.send('Real funny retard.')
        return;
    }
    // again to get result 
    // TODO: any better way? this is EXTREMLY slow with the unmarshal function alone taking roughly 150ms
    const login_req = UnmarshalLoginData(req.body);
    console.log(login_req.username);
    const user_data = await Database.fetchOne(`SELECT * FROM users WHERE safe_name='${Utils.makeUsernameSafe(login_req.username)}'`);

    let requestIP = req.headers['cf-connecting-ip'];

    if (requestIP === undefined) {
        requestIP = req.headers['X-Real-IP'];
    }

    const geoReq = await fetch.default('https://ip.zxq.co/' + requestIP); // bs shit
    const geoData:any = await geoReq.json();
    const [user_lat, user_lng] = geoData.loc.split(',');
    const userCountryCode = getCountryID(geoData.country);

    res.setHeader('cho-token', 'no')

    // no user
    if (!user_data) {
        res.send(Notify('User not found!\nCheck your credentials and retry.'));
        console.warn(`${login_req.username}'s login failed! (No such user)`);
        return;
    }

    // user, but wrong password
    if (!login_req.password_md5 == user_data.pw_bcrypt) {
        res.send(Notify('Incorrect password!\nCheck your credentials and retry.'));
        console.warn(`${user_data.name}'s login failed! (Password mismatch)`);
        return;
    }

    // user found, not incorrect password (?) lets log them in!
    const token = uuid();
    const user = new Player(user_data.user_id, user_data.name, token, 5, user_lat, user_lng, userCountryCode, login_req.utc_offset);
    playerList.addPlayer(user);
    user.enqueue(UserID(user_data.user_id));
	user.enqueue(Protocol(19));
    user.enqueue(ClientPerms(4));
    user.enqueue(ChannelInfoEnd());

    await user.loadStats();
    
    for (const p of playerList.players) {
        // enqueue us to them
        p.enqueue(UserPresence(user));
        p.enqueue(UserStats(user));

        // enqueue them to us
        user.enqueue(UserPresence(p));
        user.enqueue(UserStats(p));
    }

    user.enqueue(Notify('Welcome to osu-packet'));
    res.setHeader('cho-token', token);
    res.end(user.dequeue(), () => {
        console.log(`${user_data.name} logged in!`);
    });
    return;
}

export default HandleLogin;