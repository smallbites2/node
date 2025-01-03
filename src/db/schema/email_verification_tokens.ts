import { sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const email_verification_tokens = table(
  'email_verification_tokens',
  {
    user_id: t
      .integer()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: t.text().notNull(),
    expires_at: t
      .timestamp()
      .notNull()
      .default(sql`now() + interval '1 hour'`)
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.user_id, table.token] })
    };
  }
);
