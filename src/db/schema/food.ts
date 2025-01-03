import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

import { categories } from './categories';
import { foodComments } from './food_comments';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const food = table(
  'food',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    title: t.varchar('title', { length: 128 }).notNull(),
    category: t
      .integer()
      .notNull()
      .references(() => categories.id),
    author: t
      .integer()
      .notNull()
      .references(() => users.id),
    description: t.text().notNull(),
    ingredients: t.text().array().notNull(),
    prep_time: t.integer().notNull(),
    cook_time: t.integer().notNull(),
    yields: t.varchar('yields', { length: 128 }).notNull(),
    calories: t.doublePrecision().notNull(),
    instructions_list: t.text().array().notNull(),
    image: t.text()
  },
  table => {
    return {
      titleIndex: t.index('idx_food_title').on(table.title),
      categoryIndex: t.index('idx_food_category').on(table.category),
      authorIndex: t.index('idx_food_author').on(table.author),

      fullTextSearchIndex: t.index('idx_food_fulltext').using(
        'gin',
        sql`(
          setweight(to_tsvector('english', title), 'A') ||
          setweight(to_tsvector('english', description), 'B') ||
          setweight(to_tsvector('english', yields), 'C'))`
      )
    };
  }
);
