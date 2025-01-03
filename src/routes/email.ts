import { Router } from 'express';
import { users } from '../db/schema/users';
import { email_verification_tokens } from '../db/schema/email_verification_tokens';
import { db } from '../database';
import { sql } from 'drizzle-orm';
import { sendVerificationEmail } from '../util/email/verification';

const router = Router();

router.post('/email/resend', async (req, res) => {
  if (!req.user) {
    res.status(401).render('error/401.pug');
    return;
  }

  if (req.user.email_verified) {
    res.status(400).render('error/400.pug', {
      message: 'Your email is already verified.'
    });
    return;
  }

  await sendVerificationEmail(req.user);

  res.render('mail/verify-resent.pug');
});

router.get('/email/verify', async (req, res) => {
  if (!req.query.token || typeof req.query.token !== 'string') {
    res.status(400).render('mail/verify-invalid.pug');
  }

  const [id, tkn] = (req.query.token! as string).split('.');
  const token = await db
    .select()
    .from(email_verification_tokens)
    .where(sql`user_id = ${id} and token = ${tkn}`)
    .execute();

  if (token.length === 0) {
    res.status(400).render('mail/verify-invalid.pug');
    return;
  }

  await db
    .update(users)
    .set({ email_verified: true })
    .where(sql`id = ${id}`)
    .execute();
  await db
    .delete(email_verification_tokens)
    .where(sql`user_id = ${id}`)
    .execute();

  res.render('mail/verify-success.pug');
});

export default router;
