import type { Request, Response, NextFunction, RequestHandler } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter keyed by authenticated user ID.
 * Falls back to IP address for unauthenticated requests.
 */
export function rateLimit({
  windowMs,
  maxRequests,
  message = "Too many requests, please try again later.",
}: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}): RequestHandler {
  const store = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetTime) {
        store.delete(key);
      }
    }
  }, windowMs);

  // Allow the timer to not keep the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const key = user?.claims?.sub || req.ip || "unknown";
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now >= entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      return res.status(429).json({ message });
    }

    next();
  };
}
