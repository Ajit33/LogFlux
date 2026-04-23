import elastic from "../../config/elasticsearch";
import logger from "../../config/logger";
import { Log } from "../logs/log.types";
import { SearchQuery, SearchResult } from "./search.types";

export class SearchService {
  async search(query: SearchQuery): Promise<SearchResult> {
    const client = elastic.getClient();

    const {
      q,
      level,
      message,
      resourceId,
      traceId,
      spanId,
      commit,
      parentResourceId,
      timestampFrom,
      timestampTo,
      regex,
      page = 1,
      limit = 50,
    } = query;

    const must: object[] = [];
    const filter: object[] = [];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ["message^3", "resourceId", "traceId", "spanId", "commit"],
          fuzziness: "AUTO",
        },
      });
    }

    if (regex) {
      must.push({
        regexp: { message: { value: regex, flags: "ALL" } },
      });
    }

    if (message) {
      must.push({
        match: { message: { query: message, operator: "and" } },
      });
    }

    if (level) filter.push({ term: { level } });
    if (resourceId) filter.push({ term: { resourceId } });
    if (traceId) filter.push({ term: { traceId } });
    if (spanId) filter.push({ term: { spanId } });
    if (commit) filter.push({ term: { commit } });
    if (parentResourceId)
      filter.push({ term: { "metadata.parentResourceId": parentResourceId } });

    if (timestampFrom || timestampTo) {
      const range: Record<string, string> = {};
      if (timestampFrom) range.gte = timestampFrom;
      if (timestampTo) range.lte = timestampTo;
      filter.push({ range: { timestamp: range } });
    }

    const esQuery =
      must.length === 0 && filter.length === 0
        ? { match_all: {} }
        : {
            bool: {
              ...(must.length > 0 ? { must } : {}),
              ...(filter.length > 0 ? { filter } : {}),
            },
          };

    const response = await client.search<Log>({
      index: "logs",
      from: (page - 1) * limit,
      size: limit,
      sort: [{ timestamp: { order: "desc" } }],
      query: esQuery,
      track_total_hits: true,
    });

    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    return {
      total,
      page,
      limit,
      logs: response.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      })),
    };
  }
}

export default new SearchService();
