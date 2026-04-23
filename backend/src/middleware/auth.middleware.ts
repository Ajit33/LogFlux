import { Request, Response, NextFunction } from "express";
import authService from "../modules/auth/auth.service";
import type { JwtPayload } from "../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token  =
      (header?.startsWith("Bearer ") ? header.slice(7) : null) ??
      (req.query.token as string | undefined);

    if (!token) return res.status(401).json({ error: "Authentication required" });

    req.user = authService.verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}