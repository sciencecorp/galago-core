import { encode } from "base32";
import { Worker as SnowflakeIdWorker } from "snowflake-uuid";

class SnowflakeIdGenerator {
  private readonly worker: SnowflakeIdWorker;

  constructor(private workerId: number) {
    this.worker = new SnowflakeIdWorker(workerId, 0, {
      workerIdBits: 10,
      sequenceBits: 12,
    });
  }

  public nextId(): string {
    const id: bigint = this.worker.nextId();
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(id);
    return encode(buffer);
  }
}

// TODO: read workerId from config
const snowflakeIdGenerator = new SnowflakeIdGenerator(487);

export default snowflakeIdGenerator;
