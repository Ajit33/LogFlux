import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Elasticsearch
  elastic: {
    url: process.env.ELASTIC_URL || "http://localhost:9200",
    index: process.env.ELASTIC_INDEX || "logs",
  },

  // Redis (BullMQ)
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },

  // Queue
  queue: {
    name: process.env.QUEUE_NAME || "logQueue",
    batchSize: parseInt(process.env.BATCH_SIZE || "500", 10),
    flushInterval: parseInt(process.env.FLUSH_INTERVAL || "1000", 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "debug",
  },

  // Graceful shutdown
  shutdown: {
    timeout: parseInt(process.env.SHUTDOWN_TIMEOUT || "5000", 10),
  },
};

export default config;