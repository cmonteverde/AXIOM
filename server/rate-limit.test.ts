import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "./rate-limit";
import type { Request, Response, NextFunction } from "express";

function mockReq(ip = "127.0.0.1", userId?: string): Partial<Request> {
  return {
    ip,
    user: userId ? { claims: { sub: userId } } : undefined,
  } as any;
}

function mockRes(): Partial<Response> & { statusCode?: number; body?: any; headers: Record<string, string> } {
  const res: any = {
    headers: {},
    setHeader(key: string, value: string) {
      res.headers[key] = value;
      return res;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: any) {
      res.body = body;
      return res;
    },
  };
  return res;
}

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    limiter(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it("sets rate limit headers", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 10 });
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    limiter(req as Request, res as Response, next as NextFunction);
    expect(res.headers["X-RateLimit-Limit"]).toBe(10);
    expect(res.headers["X-RateLimit-Remaining"]).toBe(9);
    expect(res.headers["X-RateLimit-Reset"]).toBeDefined();
  });

  it("blocks requests over the limit with 429", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 2 });
    const req = mockReq();
    const next = vi.fn();

    // First 2 requests pass
    limiter(req as Request, mockRes() as Response, next as NextFunction);
    limiter(req as Request, mockRes() as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(2);

    // 3rd request blocked
    const res3 = mockRes();
    const next3 = vi.fn();
    limiter(req as Request, res3 as Response, next3 as NextFunction);
    expect(next3).not.toHaveBeenCalled();
    expect(res3.statusCode).toBe(429);
  });

  it("uses custom message on block", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1, message: "Slow down!" });
    const req = mockReq();

    limiter(req as Request, mockRes() as Response, vi.fn() as NextFunction);
    const res2 = mockRes();
    limiter(req as Request, res2 as Response, vi.fn() as NextFunction);
    expect(res2.body?.message).toBe("Slow down!");
  });

  it("tracks users separately by user ID", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1 });
    const next = vi.fn();

    limiter(mockReq("1.1.1.1", "user-a") as Request, mockRes() as Response, next as NextFunction);
    limiter(mockReq("1.1.1.1", "user-b") as Request, mockRes() as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(2); // Different users, both pass
  });

  it("tracks by IP when no user", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1 });
    const next = vi.fn();

    limiter(mockReq("1.1.1.1") as Request, mockRes() as Response, next as NextFunction);
    const res2 = mockRes();
    limiter(mockReq("1.1.1.1") as Request, res2 as Response, vi.fn() as NextFunction);
    expect(res2.statusCode).toBe(429);

    // Different IP is fine
    limiter(mockReq("2.2.2.2") as Request, mockRes() as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("decrements remaining count with each request", () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
    const req = mockReq();

    for (let i = 0; i < 3; i++) {
      const res = mockRes();
      limiter(req as Request, res as Response, vi.fn() as NextFunction);
      expect(res.headers["X-RateLimit-Remaining"]).toBe(5 - (i + 1));
    }
  });
});
