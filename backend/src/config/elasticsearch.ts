import { Client } from "@elastic/elasticsearch";
import config from "./index";
import logger from "./logger";

class ElasticsearchConnection {
  private client: Client | null = null;

  async connect(): Promise<Client> {
    if (this.client) return this.client;

    try {
      logger.info("Connecting to Elasticsearch...");

      this.client = new Client({
        node: config.elastic.url,
      });

      await this.client.ping();

      logger.info("Elasticsearch connected");
     await this.createIndexIfNotExists();
      return this.client;
       
    } catch (error) {
      logger.error("Elasticsearch connection failed", error);
      throw error;
    }
  }

  getClient(): Client {
  if (!this.client) {
    throw new Error("Elasticsearch client not connected. Call connect() first.");
  }
  return this.client;
}

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info("Elasticsearch connection closed");
    }
  }
  private async createIndexIfNotExists() {
  if (!this.client) throw new Error("Client not initialized");

  const exists = await this.client.indices.exists({ index: "logs" });
  if (exists) return;

  await this.client.indices.create({
    index: "logs",
    mappings: {
      properties: {
        level:      { type: "keyword" },
        message:    { type: "text" },
        resourceId: { type: "keyword" },
        timestamp:  { type: "date" },
        traceId:    { type: "keyword" },
        spanId:     { type: "keyword" },
        commit:     { type: "keyword" },
        ingestedAt: { type: "date" },
        metadata: {
          properties: {
            parentResourceId: { type: "keyword" },
          },
        },
      },
    },
  });

  logger.info("Elasticsearch index created with mappings");
}
}

export default new ElasticsearchConnection();