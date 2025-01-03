import 'dotenv/config';
import './database';

import express from 'express';
import cookieParser from 'cookie-parser';
import htmlMinify from 'html-minifier';
import pug from 'pug';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { I18n } from 'i18n';

import { db } from './database';
import { users as usersTable } from './db/schema/users';
import { tokens } from './db/schema/tokens';
import { sql } from 'drizzle-orm';
import app from './app';

const i18n = new I18n({
  locales: ['en', 'fr', 'pl'],
  fallbacks: {
    'en-*': 'en',
    'fr-*': 'fr',
    'pl-*': 'pl'
  },
  defaultLocale: 'en',
  directory: join(__dirname, '..', 'locales'),
  retryInDefaultLocale: true,
  updateFiles: false,
  autoReload: true,
  queryParameter: 'lang'
});

app.engine('pug', (filePath, options, callback) => {
  const rendered = pug.renderFile(filePath, {
    ...options,
    basedir: join(__dirname, '..', 'views')
  });
  const minified = htmlMinify.minify(rendered, {
    caseSensitive: false,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    conservativeCollapse: false,
    continueOnParseError: true,
    decodeEntities: true,
    html5: true,
    minifyCSS: true,
    minifyJS: true,
    preventAttributesEscaping: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    //removeTagWhitespace: true, // invalid html
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
  });
  return callback(null, minified);
});

app.disable('x-powered-by');
app.disable('etag');
app.set('view engine', 'pug');
app.set('views', join(__dirname, '..', 'views'));
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);

app.use(async (req, res, next) => {
  res.locals.__ = res.__;

  if (req.cookies.token) {
    const [id, tkn] = req.cookies.token.split('.');
    if (id && tkn) {
      const user = await db
        .select()
        .from(tokens)
        .where(sql`user_id = ${parseInt(id)} AND token = ${tkn}`)
        .limit(1)
        .execute();
      if (user.length > 0) {
        const u = await db
          .select()
          .from(usersTable)
          .where(sql`id = ${parseInt(id)}`)
          .limit(1)
          .execute();

        if (u.length > 0) {
          req.user = u[0];
          res.locals.user = u[0];

          if (!req.path.startsWith('/email')) {
            if (!req.user.email_verified) {
              return res.render('mail/not-verified.pug');
            }
          }
        }
      }
    }
  }

  next();
});

for (const file of readdirSync(join(__dirname, 'routes'))) {
  const router = require(join(__dirname, 'routes', file));
  app.use(router.default);
}

app.listen(process.env.port, () => {
  console.log(`[log] Listening on port ${process.env.port}`);
});
