import { Request, Response } from "express";
import searchService from "./search.service";
import logger from "../../config/logger";

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const query = {
        q:                req.query.q as string,
        level:            req.query.level as string,
        message:          req.query.message as string,
        resourceId:       req.query.resourceId as string,
        traceId:          req.query.traceId as string,
        spanId:           req.query.spanId as string,
        commit:           req.query.commit as string,
        parentResourceId: req.query.parentResourceId as string,
        timestampFrom:    req.query.timestampFrom as string,
        timestampTo:      req.query.timestampTo as string,
        regex:            req.query.regex as string,
        page:  req.query.page  ? parseInt(req.query.page as string)  : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const result = await searchService.search(query);
      res.status(200).json(result);
    } catch (error) {
      logger.error("Search error:", error);
      res.status(500).json({ error: "Failed to search logs" });
    }
  }
}

export default new SearchController();