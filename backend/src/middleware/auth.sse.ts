

import { Request, Response, NextFunction } from "express";
import jwt                                  from "jsonwebtoken";
import type { JwtPayload }                  from "../modules/auth/auth.types";

export function requireAuthSse(
  req:  Request,
  res:  Response,
  next: NextFunction
): void {
  // Try query param first (EventSource), then fall back to header (curl/fetch)
  const token =
    (req.query.token as string | undefined) ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) { next(new Error("JWT_SECRET not set")); return; }

  try {
    req.user = jwt.verify(token, secret) as JwtPayload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    res.status(401).json({ error: "Invalid token" });
  }
}