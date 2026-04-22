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

      return this.client;
    } catch (error) {
      logger.error("Elasticsearch connection failed", error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info("Elasticsearch connection closed");
    }
  }
}

export default new ElasticsearchConnection();