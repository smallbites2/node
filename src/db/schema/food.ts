import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

import { categories } from './categories';
import { users } from './users';
import { sql } from 'drizzle-orm';
import { regions } from './regions';

export const foodTranslations = table(
  'food_translations',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    food_id: t
      .integer()
      .notNull()
      .references(() => food.id, { onDelete: 'cascade' }),
    locale: t.varchar('locale', { length: 5 }).notNull(),
    title: t.text().notNull(),
    description: t.text().notNull(),
    ingredients: t.text().array().notNull(),
    instructions_list: t.text().array().notNull(),
    yields: t.text().notNull(),
    translation_author: t
      .integer()
      .notNull()
      .references(() => users.id)
  },
  table => {
    return {
      idAndLocaleIndex: t.index('idx_food_translations_id_locale').on(table.id, table.locale),
      fullTextSearchTitle: t
        .index('idx_food_translations_fulltext_title')
        .using('pgroonga', sql`${table.title}`)
        .with({
          tokenizer: 'TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)'
        }),
      fullTextSearchDescription: t
        .index('idx_food_translations_fulltext_description')
        .using('pgroonga', sql`${table.description}`)
        .with({
          tokenizer: 'TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)'
        }),
      fullTextSearchInstructions: t
        .index('idx_food_translations_fulltext_instructions')
        .using('pgroonga', sql`${table.instructions_list}`)
        .with({
          tokenizer: 'TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)'
        }),
      fullTextSearchYields: t
        .index('idx_food_translations_fulltext_yields')
        .using('pgroonga', sql`${table.yields}`)
        .with({
          tokenizer: 'TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)'
        })
    };
  }
);

export const food = table(
  'food',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    region: t
      .integer()
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    category: t
      .integer()
      .notNull()
      .references(() => categories.id),
    author: t
      .integer()
      .notNull()
      .references(() => users.id),
    prep_time: t.integer().notNull(),
    cook_time: t.integer().notNull(),
    calories: t.doublePrecision().notNull(),
    default_locale: t.varchar('default_locale', { length: 5 }).default('en_US'),
    image: t.text()
  },
  table => {
    return {
      categoryIndex: t.index('idx_food_category').on(table.category),
      authorIndex: t.index('idx_food_author').on(table.author)
    };
  }
);
