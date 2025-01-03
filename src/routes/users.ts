import { Router } from 'express';
import { db } from '../database';
import { users as usersTable } from '../db/schema/users';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/users', async (req, res) => {
  const query = req.query.q;

  let users;
  if (query) {
    users = await db
      .select()
      .from(usersTable)
      .where(
        sql`to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, '')) @@ plainto_tsquery('english', ${query})`
      )
      .limit(100);
  } else {
    users = await db.select().from(usersTable).limit(100);
  }

  res.render('users', { query, users: users });
});

export default router;
