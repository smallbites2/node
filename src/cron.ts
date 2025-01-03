import { ip_rate_limits, user_rate_limits } from './db/schema/rateLimits';
import { tokens } from './db/schema/tokens';
import { users } from './db/schema/users';
import { db } from './database';
import { sql } from 'drizzle-orm';

(async () => {
  await db.transaction(async tx => {
    await tx.delete(ip_rate_limits).where(sql`at < NOW() - INTERVAL '1 day'`);
    await tx.delete(user_rate_limits).where(sql`at < NOW() - INTERVAL '1 day'`);
    await tx.delete(tokens).where(sql`expires_at < NOW()`);
    await tx.delete(users).where(sql`email_verified = FALSE AND created_at < NOW() - INTERVAL '30 days'`);

    await tx.execute(sql`VACUUM;`);
  });
})();
