import { Router } from 'express';
import { food } from '../db/schema/food';
import { db } from '../database';
import { sql } from 'drizzle-orm';
import { minsToHuman } from '../util/human';

const router = Router();

router.get('/', async (req, res) => {
  const foods = await db.execute('select * from food tablesample system_rows(5);');

  res.render('index.pug', {
    foods: foods.rows.map(f => {
      return {
        ...f,
        // @ts-ignore
        prep_time: minsToHuman(f.prep_time),
        // @ts-ignore
        cook_time: minsToHuman(f.cook_time)
      };
    })
  });
});

router.get('/favicon.ico', (req, res) => {
  res.end();
});

router.get('/email/reset', (req, res) => {
  res.render('email/reset.pug', {
    email: 'a@a.a',
    displayname: 'Konfucjusz',
    link: 'https://www.youtube.com/watch?v=E4WlUXrJgy4'
  });
});

router.get('/email/verify', (req, res) => {
  res.render('email/verify.pug', {
    email: 'a@a.a',
    displayname: 'Spartakus',
    code: '2137'
  });
});

export default router;
