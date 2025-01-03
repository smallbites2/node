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
    const now = Date.now();
    const windowStart = now - windowMs;

    const existing = await db
      .select()
      .from(ip_rate_limits)
      .where(sql`ip = ${ip} AND action = ${action} AND timestamp > ${windowStart}`);

    res.status(429).send('Too many requests');
  };
};
