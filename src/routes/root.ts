import { Router } from 'express';
import { food } from '../db/schema/food';
import { db } from '../database';
import { sql } from 'drizzle-orm';
import { minsToHuman } from '../util/human';

const router = Router();

router.get('/', async (req, res) => {
  const foods = await db.execute(sql`
    SELECT * FROM food
    TABLESAMPLE SYSTEM_ROWS(5)
    LEFT JOIN food_translations ON food.id = food_translations.food_id AND food.default_locale = food_translations.locale
  `);

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

export default router;
