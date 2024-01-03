// oh boy here we go
const struct = require('python-struct');
interface Message {
    senderName: string
    content: string
    target: string
    senderID: number
}

class Packet {
    public id: number;
    public length: number;
    public body: Buffer;

    constructor(id: number, length: number, body: Buffer) {
        this.id = id;
        this.length = length;
        this.body = body;
    }
}

class PacketReader {
    private buffer: Buffer;
    public offset: number;
    get length(): number {
      return this.buffer.length;
    }
    public get isEOF(): boolean {
      return this.buffer.length == 0;
    }
    constructor(buffer: string) {
      this.buffer = Buffer.from(buffer);
      this.offset = 0;
    }
    public varInt(): number {
      let total = 0;
      let shift = 0;
      let byte = this.byte();
      if ((byte & 0x80) === 0) {
        total |= (byte & 0x7f) << shift;
      } else {
        let end = false;
        do {
          if (shift) {
            byte = this.byte();
          }
          total |= (byte & 0x7f) << shift;
          if ((byte & 0x80) == 0) end = true;
          shift += 7;
        } while (!end);
      }
      return total;
    }
    public string(): string {
      if (this.byte() == 0) return "";
      const length = this.varInt();
      const result = this.buffer.toString("utf8", this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
    public int(): number {
      const result = this.buffer.readInt32LE(this.offset);
      this.offset += 4;
      return result;
    }
    public intlist(): Array<number> {
      const length = this.short();
      const result: Array<number> = [];
      for (let i = 0; i < length; i++) {
        result.push(this.int());
      }
      return result;
    }
    public double(): number {
      const result = this.buffer.readDoubleLE(this.offset);
      this.offset += 8;
      return result;
    }
    public float(): number {
      const result = this.buffer.readFloatLE(this.offset);
      this.offset += 4;
      return result;
    }
    public short(): number {
      const result = this.buffer.readInt16LE(this.offset);
      this.offset += 2;
      return result;
    }
    public byte(): number {
      const result = this.buffer.readInt8(this.offset);
      this.offset += 1;
      return result;
    }
    public bytes(length: number): Buffer {
      if (length == 0) return Buffer.alloc(0);
      const result = this.buffer.slice(this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
    data(): Buffer {
      return this.buffer;
    }

    ReadMessage() : Message {
        return {
            senderName: this.string(),
            content: this.string(),
            target: this.string(),
            senderID: this.int()
        } as Message
    }

    Parse() : Packet {
        let id = this.short();
        this.byte();
        let length = this.int();

        let packet = new Packet(
            id, 
            length, 
            this.buffer.slice(7)
        );

        return packet;
    }
    
}

class PacketWriter {
    buffer: Buffer = Buffer.alloc(0); // TODO: proper memory management
    length: number = 0;

    WriteU8(val: number) : PacketWriter {
        const buff = struct.pack("<B", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI8(val: number) : PacketWriter {
        const buff = struct.pack("<b", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU16(val: number) : PacketWriter {
        const buff = struct.pack("<H", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI16(val: number) : PacketWriter {
        const buff = struct.pack("<h", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU32(val: number) : PacketWriter {
        const buff = struct.pack("<L", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI32(val: number) : PacketWriter {
        const buff = struct.pack("<l", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteU64(val: number) : PacketWriter {
        const buff = struct.pack("<Q", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteI64(val: number) : PacketWriter {
        const buff = struct.pack("<q", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    WriteF32(val: number) {
        const buff = struct.pack("<f", val);
        this.buffer = Buffer.concat([this.buffer, buff]);
        return this;
    }

    // complex types
    WriteString(str: string) : PacketWriter {
        if (!str) {
            this.WriteU8(0);
            return this;
        }

        let encoded = ULEBEncode(str.length);
        let buff = Buffer.concat([Buffer.from("\x0B"), Buffer.from(encoded), Buffer.from(str)])
        this.buffer = Buffer.concat([this.buffer, buff]);

        return this;
    }

    WriteMessage(msg: Message) {
        // TODO: lazy
    }

    WriteRaw(data: Buffer) : PacketWriter {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);
        return this;
    }

    Pack(pack_id: number) : Buffer {
        const buffer = Buffer.concat([
            Buffer.from([]), 
            struct.pack('<h', pack_id), 
            Buffer.from('\x00'), 
            struct.pack('<l', this.buffer.byteLength), 
            this.buffer
        ])

        this.buffer = Buffer.alloc(0); // re-alloc buffer so we can reuse

        return buffer;
    }
}

// uleb
function ULEBEncode(num: number) {
    var arr = [];
    var len = 0;

    if (num === 0)
        return [0];

    while (num > 0) {
        arr[len] = num & 0x7F;
        if (num >>= 7) arr[len] |= 0x80;
        len++;
    }

    return arr;
}

export { PacketReader, PacketWriter };