import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

import { users } from './users';
import { sql } from 'drizzle-orm';

export const categories = table('categories', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.text().notNull().unique()
});
