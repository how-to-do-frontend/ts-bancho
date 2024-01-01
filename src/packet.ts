// oh boy here we go
interface Message {
    senderName: string
    content: string
    target: string
    senderID: number
}

class Packet {
    public id: number;
    public length: number;
    public body: ArrayBuffer;

    constructor(id: number, length: number, body: ArrayBuffer) {
        this.id = id;
        this.length = length;
        this.body = body;
    }
}

class PacketReader {
    private buffer:Buffer;
    private offset: number = 0;

    constructor(body: any) {
        this.buffer = Buffer.from(body);
    }

    ReadU8() : number {
        const res = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return res;
    }

    ReadI8() : number {
        const res = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return res;
    }

    ReadU16() : number {
        const res = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return res;
    }

    ReadI16() : number {
        const res = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return res;
    }

    ReadU32() : number {
        const res = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return res;
    }

    ReadI32() : number {
        const res = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return res;
    }

    ReadU64() : bigint {
        const res = this.buffer.readBigUInt64LE(this.offset);
        this.offset += 8;
        return res;
    }

    ReadI64() : bigint {
        const res = this.buffer.readBigInt64LE(this.offset);
        this.offset += 8;
        return res;
    }

    ReadULEB128(buf: Buffer) : { value: number, length: number } {
        let [total, len, shift] = [0, 0, 0]; // LOL

        while (true) {
            let byte = buf[len];
            len++;

            total |= ((byte & 0x7F) << shift);
            if ((byte & 0x80) === 0) break;
            shift += 7;
        }

        return {
            value: total,
            length: len
        };
    }

    ReadString() : string {
        let data: string;
        if (this.buffer[this.offset] === 0x0B) {
            // Non-empty string
            let length = this.ReadULEB128(this.buffer.slice(this.offset += 1));
            data = this.buffer.slice(this.offset += length.length, this.offset += length.value).toString();
        }
        else {
            // Empty string
            this.offset++;
            data = "";
        }
        return data;
    }

    ReadMessage() : Message {
        return {
            senderName: this.ReadString(),
            content: this.ReadString(),
            target: this.ReadString(),
            senderID: this.ReadI32()
        } as Message
    }

    Parse() : Array<Packet> {
        let offset = 0;
        let packets = [];
    
        while (offset < this.buffer.length) {
            let id = this.ReadU16();
            this.ReadI8();
            let length = this.ReadI32();
    
            let packet = new Packet(
                id, 
                length, 
                this.buffer.slice(offset + 7, (offset + 7) + length)
            );
    
            packets.push(packet);

            if (id >= 2800) {
                console.log(packet);
            }
    
            offset += (offset + 7) + length;
        }
        return packets;
    }
    
}

class PacketWriter {
    buffer: Buffer = Buffer.alloc(0); // TODO: proper memory management
    length: number = 0;

    WriteU8(val: number) : PacketWriter {
        const buff = Buffer.alloc(1)
        buff.writeUInt8(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI8(val: number) : PacketWriter {
        const buff = Buffer.alloc(1)
        buff.writeInt8(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU16(val: number) : PacketWriter {
        const buff = Buffer.alloc(2)
        buff.writeUInt16LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI16(val: number) : PacketWriter {
        const buff = Buffer.alloc(2)
        buff.writeInt16LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU32(val: number) : PacketWriter {
        const buff = Buffer.alloc(4)
        buff.writeUInt32LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI32(val: number) : PacketWriter {
        const buff = Buffer.alloc(4)
        buff.writeInt32LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU64(val: bigint) : PacketWriter {
        const buff = Buffer.alloc(8)
        buff.writeBigUInt64LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI64(val: bigint) : PacketWriter {
        const buff = Buffer.alloc(8)
        buff.writeBigInt64LE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteF32(val: number) {
        const buff = Buffer.alloc(4)
        buff.writeFloatLE(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    // complex types
    WriteULEB128(val: number) : PacketWriter {
        let buff = Buffer.alloc(1);
        while (val > 0x80) {
            buff.writeUInt8((val & 0X7F) | 0x80);
            this.buffer = Buffer.concat([this.buffer, buff]);
            buff.fill(0);
            val >>= 7;
        }
        buff.writeUInt8(val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteString(str: string) : PacketWriter {
        if (!str) {
            this.WriteU8(0);
            return this;
        }

        this.WriteU8(0xB);
        this.WriteULEB128(str.length);
        this.buffer = Buffer.concat([this.buffer, Buffer.from(str)]);

        return this;
    }

    WriteMessage(msg: Message) {
        // TODO: lazy
    }

    WriteRaw(data: Buffer) : PacketWriter {
        this.buffer = Buffer.concat([this.buffer, data]);
        return this;
    }

    Pack(pack_id: number) : Buffer {
        const startBuf = Buffer.alloc(7);

        startBuf.writeInt16LE(pack_id, 0);
        startBuf.writeInt32LE(this.buffer.byteLength, 3);
        const buffer = Buffer.concat([startBuf, this.buffer]);
        if (pack_id === 85) {
            console.log(buffer);
        }

        this.buffer = Buffer.alloc(0); // re-alloc buffer so we can reuse

        return buffer;
    }
}

export { PacketReader, PacketWriter };