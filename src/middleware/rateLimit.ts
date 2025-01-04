import { ip_rate_limits, user_rate_limits } from '../db/schema/rateLimits';
import { db } from '../database';
import { sql } from 'drizzle-orm';

import type { Request, Response, NextFunction } from 'express';

export const ipRateLimiter = (
  action: string,
  limit: number,
  windowMs: number
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    const ip = req.ip;
    if (!ip) {
      res.status(500).send('Internal server error');
      return;
    }
    const now = Date.now();
    const windowStart = now - windowMs;

    const existing = await db
      .select()
      .from(ip_rate_limits)
      .where(sql`ip = ${ip} AND action = ${action} AND at > to_timestamp(${windowStart})`)
      .execute();
    if (existing.length >= limit) {
      res.status(429).send('Too many requests');
      return;
    }

    await db.insert(ip_rate_limits).values({ ip, action }).execute();
    next();
  };
};

export const userRateLimiter = (
  action: string,
  limit: number,
  windowMs: number
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const now = Date.now();
    const windowStart = now - windowMs;

    const existing = await db
      .select()
      .from(user_rate_limits)
      .where(sql`user_id = ${user.id} AND action = ${action} AND at > to_timestamp(${windowStart})`)
      .execute();
    if (existing.length >= limit) {
      res.status(429).send('Too many requests');
      return;
    }

    await db.insert(user_rate_limits).values({ user_id: user.id, action }).execute();
    next();
  };
};

export const hybridRateLimiter = (
  action: string,
  limit: number,
  windowMs: number
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  const ipLimiter = ipRateLimiter(action, limit, windowMs);
  const userLimiter = userRateLimiter(action, limit, windowMs);

  return async (req, res, next) => {
    await ipLimiter(req, res, async () => {
      await userLimiter(req, res, next);
    });
  };
};
