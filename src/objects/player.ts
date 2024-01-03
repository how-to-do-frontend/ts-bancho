import { fetchOne } from "../state/db";

class Player {
    public username: string;
    public id: number;
    public token: string;
    public perms: number;

    // geoloc data
    public lat:number;
    public lng:number;
    public country: number;
    public utc_offset:number;

    public stats = {
        pp: 0,
        acc: 0,
        rscore: 0,
        tscore: 0,
        rank: 1,
        playcount: 0
    };

    // Presence data
	public actionID:number = 0;
	public actionText:string = "";
	public actionMods:number = 0;
	public beatmapChecksum:string = "";
	public beatmapID:number = 0;

    // mode shit
    public playMode:number = 0;
    public relaxing:boolean = false;

    // spec shit
    public spectators:Array<Player> = [];
    public spectating: Player | null = null;

    // yeah
    public queue: Buffer = Buffer.alloc(0)

    public constructor(id:number, username:string, token:string, perms:number, lat:number, lng:number, country:number, utc_offset:number) {
		this.id = id;
		this.username = username;
		this.token = token;
		this.perms = perms;
        this.lat = lat;
        this.lng = lng;
        this.country = country;
        this.utc_offset = utc_offset;
	}

    public enqueue(data: Buffer) : void {
        this.queue = Buffer.concat([this.queue, data]);
    }

    public async loadStats() {
        let data = await fetchOne(`
            SELECT
                *
            FROM stats
            WHERE user_id = ${this.id} AND mode = ${this.playMode} AND rx = ${!!(this.relaxing)}
        `);

        if (!data) return;

        this.stats.pp = data.pp;
        this.stats.tscore = data.tscore;
        this.stats.rscore = data.rscore;
        this.stats.acc = data.acc;
        this.stats.playcount = data.playcount;
    }

    public logout() : void {
        // todo
    }

    public dequeue() : Buffer {
        const tmp = this.queue;
        this.queue = Buffer.alloc(0);
        return tmp;
    }
}

export default Player;