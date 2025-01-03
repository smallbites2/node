import { Router } from 'express';
import { db } from '../database';
import { users as usersTable } from '../db/schema/users';
import { tokens } from '../db/schema/tokens';
import { sql } from 'drizzle-orm';
import zod from 'zod';
import { hash, verify } from 'argon2';
import { randomBytes } from 'node:crypto';
import { ipRateLimiter } from '../middleware/rateLimit';

const loginSchema = zod.object({
  username: zod.string(),
  password: zod.string()
});

const registerSchema = zod.object({
  username: zod.string().min(3),
  email: zod.string().email(),
  password: zod.string().min(8),
  password2: zod.string()
});

const router = Router();

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', ipRateLimiter('login', 5, 60 * 60 * 1000), async (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) {
    res.render('auth/login', { error: 'Invalid input' });
    return;
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(sql`username = ${body.data.username} or email = ${body.data.username}`)
    .limit(1)
    .execute();
  if (!user.length) {
    res.render('auth/login', { error: 'Invalid username or password' });
    return;
  }

  const isValid = await verify(user[0].password, body.data.password);
  if (!isValid) {
    res.render('auth/login', { error: 'Invalid username or password' });
    return;
  }

  const token = randomBytes(128).toString('base64').replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '');
  const t = await db
    .insert(tokens)
    .values({
      // @ts-ignore
      user_id: user[0].id,
      token,
      logged_in_ip: req.ip,
      last_seen_ip: req.ip
    })
    .returning()
    .execute();

  res.cookie('token', `${user[0].id}.${token}`, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    path: '/'
  });

  res.redirect(typeof req.query.to === 'string' ? req.query.to : '/');
});

router.get('/logout', async (req, res) => {
  const [userId, token] = req.cookies.token.split('.');
  await db
    .delete(tokens)
    .where(sql`user_id = ${userId} and token = ${token}`)
    .execute();
  res.clearCookie('token');
  if (typeof req.query.to === 'string') {
    res.redirect(req.query.to);
  } else {
    res.redirect('/');
  }
});

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', ipRateLimiter('register', 1, 24 * 60 * 60 * 1000), async (req, res) => {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) {
    res.render('auth/register', { error: 'Invalid data' });
    return;
  }

  if (body.data.password !== body.data.password2) {
    res.render('auth/register', { error: 'Passwords do not match' });
    return;
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(sql`username = ${body.data.username}`)
    .limit(1)
    .execute();
  if (user.length) {
    res.render('auth/register', { error: 'Username already taken' });
    return;
  }

  const email = await db
    .select()
    .from(usersTable)
    .where(sql`email = ${body.data.email}`)
    .limit(1)
    .execute();
  if (email.length) {
    res.render('auth/register', { error: 'Email already taken' });
    return;
  }

  const h = await hash(body.data.password);
  await db
    .insert(usersTable)
    .values({
      username: body.data.username,
      email: body.data.email,
      password: h
    })
    .execute();

  res.render('auth/login', { success: 'Account created, you can now login' });
});

export default router;
