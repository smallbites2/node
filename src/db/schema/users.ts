import { sql } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const users = table(
  'users',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    username: t.varchar('username', { length: 64 }).unique().notNull(),
    display_name: t.varchar('display_name', { length: 64 }),
    email: t.varchar().notNull(),
    email_verified: t.boolean().notNull().default(false),
    password: t.varchar().notNull(),
    created_at: t.timestamp().default(sql`now()`)
  },
  table => {
    return {
      emailIndex: t.uniqueIndex('email_idx').on(table.email),
      usernameIndex: t.uniqueIndex('username_idx').on(table.username),
      fullTextSearchIndex: t
        .index('user_fulltext_idx')
        .using('gin', sql`(to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, '')))`),
      cronVerifiedIndex: t.index('users_cron_idx').on(table.email_verified, table.created_at)
    };
  }
);
