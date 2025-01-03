import { sendEmail } from '../email';
import { users } from '../../db/schema/users';
import { email_verification_tokens } from '../../db/schema/email_verification_tokens';
import { randomBytes } from 'node:crypto';
import { db } from '../../database';
import { sql } from 'drizzle-orm';
import app from '../../app';

export const sendVerificationEmail = async (user: typeof users.$inferSelect) => {
  if (user.email_verified) throw new Error('Email already verified');

  const token = randomBytes(64).toString('hex');

  await db.insert(email_verification_tokens).values({
    user_id: user.id,
    token: token
  });

  const content = (await Promise.resolve(
    new Promise((resolve, reject) => {
      app.render(
        'email/verify.pug',
        {
          code: `${process.env.WEB_URL}/email/verify?token=${user.id}.${token}`,
          email: user.email,
          displayname: user.display_name || user.username
        },
        (err, html) => {
          if (err) reject(err);
          else resolve(html);
        }
      );
    })
  )) as string;

  await sendEmail(user.email, 'Verify your email address', content);
};
