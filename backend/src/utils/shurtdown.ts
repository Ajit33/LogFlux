import logger from "../config/logger";
import redis from "../config/redis";
import elastic from "../config/elasticsearch";

export const gracefulShutdown = async (server: any) => {
  logger.warn("Shutting down gracefully...");

  try {
    // Stop HTTP server
    if (server) {
      server.close(() => {
        logger.info("HTTP server closed");
      });
    }

    // Close Redis
    await redis.close();

    // Close ES
    await elastic.close();

    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error("Shutdown error", err);
    process.exit(1);
  }
};
