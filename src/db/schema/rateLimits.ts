import { sql } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const ip_rate_limits = table(
  'ip_rate_limits',
  {
    ip: t.inet().notNull(),
    action: t.text().notNull(),
    at: t.timestamp().notNull().defaultNow()
  },
  table => {
    return {
      pk: t.primaryKey({ columns: [table.ip, table.action, table.at] }),
      ipRateLimitIndex: t.index('iplimit_cron_idx').on(table.at)
    };
  }
);

export const user_rate_limits = table(
  'user_rate_limits',
  {
    user_id: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: t.text().notNull(),
    at: t.timestamp().notNull().defaultNow()
  },
  table => {
    return {
      pk: t.primaryKey({ columns: [table.user_id, table.action, table.at] }),
      cronIndex: t.index('userlimit_cron_idx').on(table.at)
    };
  }
);
