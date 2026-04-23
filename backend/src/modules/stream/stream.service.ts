import { Response } from "express";
import { randomUUID } from "crypto";
import logger from "../../config/logger";

interface StreamClient {
  id: string;
  res: Response;
  connectedAt: Date;
}

interface SseEvent {
  event?: string;
  data: unknown;
  id?: string;
}

class StreamService {
  private clients = new Map<string, StreamClient>();

  addClient(clientId: string, res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const client: StreamClient = {
      id: clientId,
      res,
      connectedAt: new Date(),
    };

    this.clients.set(clientId, client);

    logger.info("SSE client connected", {
      clientId,
      totalClients: this.clients.size,
    });
    this.sendToClient(client, {
      event: "connected",
      data: {
        clientId,
        message: "Stream connected",
        totalClients: this.clients.size,
      },
    });

    const heartbeat = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(heartbeat);
        return;
      }
      res.write(": heartbeat\n\n");
    }, 30_000);

    res.on("close", () => {
      clearInterval(heartbeat);
      this.removeClient(clientId);
    });
  }

  // ── removeClient ──────────────────────────────────────────────────────────
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    logger.info("SSE client disconnected", {
      clientId,
      totalClients: this.clients.size,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  broadcast(log: unknown): void {
    if (this.clients.size === 0) return; // no clients — skip work

    const event: SseEvent = { event: "log", data: log, id: randomUUID() };

    let dead: string[] = [];

    this.clients.forEach((client) => {
      // Check if the response is still writable before sending
      if (client.res.writableEnded) {
        dead.push(client.id);
        return;
      }
      this.sendToClient(client, event);
    });

    // Clean up any stale clients we found while broadcasting
    dead.forEach((id) => this.removeClient(id));
  }

  // ─────────────────────────────────────────────────────────────────────────
  broadcastBulk(logs: unknown[]): void {
    if (this.clients.size === 0 || logs.length === 0) return;
    logs.forEach((log) => this.broadcast(log));
  }

  private sendToClient(client: StreamClient, event: SseEvent): void {
    try {
      let message = "";
      if (event.id) message += `id: ${event.id}\n`;
      if (event.event) message += `event: ${event.event}\n`;
      message += `data: ${JSON.stringify(event.data)}\n\n`;
      client.res.write(message);
    } catch (err) {
      logger.warn("SSE write failed — removing dead client", {
        clientId: client.id,
      });
      this.removeClient(client.id);
    }
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      clients: Array.from(this.clients.values()).map((c) => ({
        id: c.id,
        connectedAt: c.connectedAt,
      })),
    };
  }
}

export const streamService = new StreamService();
export default streamService;
