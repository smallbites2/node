declare namespace Express {
  import type { users } from '../db/schema/users';

  export interface Request {
    user: users.$inferSelect;
  }
}
