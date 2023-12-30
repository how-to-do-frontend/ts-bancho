import Player from '../objects/player.ts';

class PlayerList {
    players: Array<Player>;

    constructor() {
        this.players = [];
    }

    // miscellaneuos methods
    addPlayer(player: Player) : void {
        this.players = this.players.concat(player);
    }

    removePlayer(player: Player) : void {
        this.players.splice(this.players.indexOf(player), 1);
    }

    enqueue(data: Buffer) : void {
        for (const p of this.players) {
            p.enqueue(data);
        }
    }

    // access methods
    getById(id: number) : Player | null {
        for (const p of this.players) {
            if (p.id === id) {
                return p;
            }
        }
        return null;
    }

    getByUsername(username: string) : Player | null {
        for (const p of this.players) {
            if (p.username === username) {
                return p;
            }
        }
        return null;
    }

    getByToken(token: string) : Player | null {
        for (const p of this.players) {
            if (p.token === token) {
                return p;
            }
        }
        return null;
    }
}

const p = new PlayerList();

export default p;