import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const regions = table(
  'regions',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    code: t.varchar('code', { length: 2 }).notNull()
  },
  table => {
    return {
      codeIndex: t.index('idx_regions_code').on(table.code)
    };
  }
);
