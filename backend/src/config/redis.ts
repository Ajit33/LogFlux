import IORedis from "ioredis";
import config from "./index";
import logger from "./logger";

class RedisConnection {
  private client: IORedis | null = null;
  private connectPromise: Promise<IORedis> | null = null;

  async connect(): Promise<IORedis> {
    if (this.client) return this.client;
    if (this.connectPromise) return this.connectPromise; // reuse in-flight promise

    this.connectPromise = new Promise((resolve, reject) => {
      logger.info("Connecting to Redis...");

      const client = new IORedis({
        host: config.redis.host,
        port: config.redis.port,
        lazyConnect: true,          // don't auto-connect on instantiation
        maxRetriesPerRequest: null, // required by BullMQ
        retryStrategy: (times) => {
          if (times > 5) return null; // stop retrying after 5 attempts
          return Math.min(times * 200, 2000);
        },
      });

      client.on("connect", () => {
        logger.info("Redis connected");
        this.client = client;
        resolve(client);
      });

      client.on("error", (err) => {
        logger.error("Redis error:", err);
        if (!this.client) {
          // only reject if we never successfully connected
          this.connectPromise = null;
          reject(err);
        }
      });

      client.on("close", () => {
        logger.warn("Redis connection closed");
        this.client = null;
        this.connectPromise = null;
      });

      client.connect().catch(reject);
    });

    return this.connectPromise;
  }

  getClient(): IORedis {
    if (!this.client) throw new Error("Redis not connected. Call connect() first.");
    return this.client;
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connectPromise = null;
      logger.info("Redis connection closed");
    }
  }
}

export default new RedisConnection();