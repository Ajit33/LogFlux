import { Worker, Job } from "bullmq";
import config from "../config";
import logger from "../config/logger";
import elastic from "../config/elasticsearch";
import redis from "../config/redis";
import { Log } from "../modules/logs/log.types";
// interface LogJob {
//   logs: object[];
// }

class LogWorker {
  private worker: Worker | null = null;
  private pendingBatch: object[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  async start() {
    await redis.connect();
    await elastic.connect();

    logger.info("🔧 Worker starting...");

    // ─────────────────────────────────────────
    // BullMQ Worker — picks jobs off the queue
    // ─────────────────────────────────────────
   this.worker = new Worker<Log>(
  config.queue.name,
  async (job: Job<Log>) => {
    const log = job.data; // single Log object, not { logs: [] }

    logger.info(`Job ${job.id} received`, { traceId: log.traceId });

    this.pendingBatch.push(log);
    logger.info(`Pending batch size: ${this.pendingBatch.length}`);

    if (this.pendingBatch.length >= config.queue.batchSize) {
      logger.info(`Batch size ${config.queue.batchSize} reached — flushing`);
      await this.flushToElasticsearch();
    }
  },
  {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
    concurrency: 5,
  }
);

    // ─────────────────────────────────────────
    // Timer — flush every N ms regardless of size
    // ─────────────────────────────────────────
    this.flushTimer = setInterval(async () => {
      if (this.pendingBatch.length > 0) {
        logger.info(`Flush interval reached — flushing ${this.pendingBatch.length} log(s)`);
        await this.flushToElasticsearch();
      } else {
        logger.debug("Flush interval tick — nothing to flush");
      }
    }, config.queue.flushInterval);

    this.worker.on("completed", (job) => {
      logger.info(`✅ Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`❌ Job ${job?.id} failed: ${err.message}`);
    });

    this.worker.on("error", (err) => {
      logger.error("Worker error:", err);
    });

    logger.info(`✅ Worker running — batchSize: ${config.queue.batchSize}, flushInterval: ${config.queue.flushInterval}ms`);
  }

  // ─────────────────────────────────────────
  // Bulk index into Elasticsearch
  // ─────────────────────────────────────────
  private async flushToElasticsearch() {
  if (this.pendingBatch.length === 0) return;

  const batchToIndex = this.pendingBatch.splice(0, this.pendingBatch.length);

  try {
    const client = elastic.getClient();

    // ─── Add this null check ───
    if (!client) {
      logger.error("Elasticsearch client is not connected");
      this.pendingBatch.unshift(...batchToIndex);
      return;
    }

    const operations = batchToIndex.flatMap((log) => [
      { index: { _index: config.elastic.index } },
      { ...log, ingestedAt: new Date().toISOString() },
    ]);

    const response = await client.bulk({ operations, refresh: false });

    if (response.errors) {
      const failed = response.items.filter((item) => item.index?.error);
      logger.error(`Bulk index: ${failed.length} failures out of ${batchToIndex.length}`);
    } else {
      logger.info(`✅ Indexed ${batchToIndex.length} logs into Elasticsearch`);
    }
  } catch (error) {
    logger.error("Bulk index failed:", error);
    this.pendingBatch.unshift(...batchToIndex);
    logger.warn(`Returned ${batchToIndex.length} logs to pending batch for retry`);
  }
}

  // ─────────────────────────────────────────
  // Graceful shutdown
  // ─────────────────────────────────────────
  async stop() {
    logger.warn("Worker shutting down...");

    if (this.flushTimer) clearInterval(this.flushTimer);

    if (this.pendingBatch.length > 0) {
      logger.info(`Final flush of ${this.pendingBatch.length} remaining logs`);
      await this.flushToElasticsearch();
    }

    if (this.worker) await this.worker.close();

    await redis.close();
    await elastic.close();

    logger.info("Worker stopped cleanly");
  }
}

const worker = new LogWorker();

worker.start().catch((err) => {
  logger.error("Failed to start worker:", err);
  process.exit(1);
});

process.on("SIGTERM", () => worker.stop().then(() => process.exit(0)));
process.on("SIGINT", () => worker.stop().then(() => process.exit(0)));