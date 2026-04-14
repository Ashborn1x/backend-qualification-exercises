export class ObjectId {
  private static readonly processRandom = Buffer.from(
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  );

  private static counter = Math.floor(Math.random() * 0x1000000);

  private data: Buffer;

  constructor(type: number, timestamp: number) {
    this.data = Buffer.alloc(14);

    this.data.writeUInt8(type & 0xff, 0);
    this.data.writeUIntBE(timestamp, 1, 6);
    ObjectId.processRandom.copy(this.data, 7);
    this.data.writeUIntBE(ObjectId.counter, 11, 3);

    ObjectId.counter = (ObjectId.counter + 1) % 0x1000000;
  }

  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }
  
  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}
