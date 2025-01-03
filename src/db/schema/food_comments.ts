import { AnyPgColumn, foreignKey } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

import { food } from './food';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const foodComments = table(
  'food_comments',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    food_id: t.integer().references(() => food.id, { onDelete: 'cascade' }),
    author_id: t.integer().references(() => users.id, { onDelete: 'cascade' }),
    content: t.text(),
    created_at: t.timestamp().default(sql`now()`),
    edited: t.boolean().default(false),
    edited_at: t.timestamp(),
    parent_id: t.integer().references((): AnyPgColumn => foodComments.id, { onDelete: 'cascade' })
  },
  table => {
    return {
      foodIndex: t.index('idx_food_comments_food_id').on(table.food_id)
    };
  }
);
