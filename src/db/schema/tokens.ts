import { sql } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const tokens = table(
  'tokens',
  {
    user_id: t
      .integer()
      .references(() => users.id)
      .notNull(),
    token: t.text().notNull(),
    expires_at: t
      .timestamp()
      .default(sql`now() + interval '1 day'`)
      .notNull(),
    created_at: t
      .timestamp()
      .default(sql`now()`)
      .notNull(),
    logged_in_ip: t.inet().notNull(),
    last_seen_ip: t.inet().notNull()
  },
  table => {
    return {
      uniqueTokens: t.unique('unique_tokens').on(table.token),
      primaryKey: t.primaryKey({
        columns: [table.user_id, table.token]
      }),
      cronIndex: t.index('tokens_cron_idx').on(table.expires_at)
    };
  }
);
