import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import logger from "./config/logger";
import config from "./config";

import redis from "./config/redis";
import elastic from "./config/elasticsearch";

import logRoutes from "./modules/logs/log.routes";
import searchRoutes from "./modules/search/search.routes"

const app = express();

/**
 * ─────────────────────────────
 * Middlewares
 * ─────────────────────────────
 */
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Request Logger Middleware
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

/**
 * ─────────────────────────────
 * Health Check
 * ─────────────────────────────
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Root
 */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Log Ingestion System",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      ingest: "/logs (POST)",
      query: "/logs (GET)",
    },
  });
});

/**
 * ─────────────────────────────
 * Routes
 * ─────────────────────────────
 */
app.use("/logs", logRoutes);
app.use("/search", searchRoutes);
/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

/**
 * ─────────────────────────────
 * Initialize Connections
 * ─────────────────────────────
 */
async function initializeConnections() {
  try {
    logger.info("Initializing connections...");

    // Redis
    await redis.connect();

    // Elasticsearch
    await elastic.connect();

    logger.info("All connections established successfully");
  } catch (error) {
    logger.error("Failed to establish connections", error);
    throw error;
  }
}

/**
 * ─────────────────────────────
 * Start Server
 * ─────────────────────────────
 */
async function startServer() {
  try {
    await initializeConnections();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server started on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    /**
     * Graceful Shutdown
     */
    const gracefulShutdown = async (signal: string) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await redis.close();
          await elastic.close();

          logger.info("All connections closed. Exiting process");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown
      setTimeout(() => {
        logger.error("Forced shutdown");
        process.exit(1);
      }, config.shutdown.timeout);
    };

    /**
     * Process Signals
     */
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    /**
     * Crash Handling
     */
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection:", { reason, promise });
      gracefulShutdown("unhandledRejection");
    });

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();