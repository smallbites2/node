import { Router } from 'express';
import { foodComments } from '../db/schema/food_comments';
import { food } from '../db/schema/food';
import { db } from '../database';
import { minsToHuman } from '../util/human';
import { sql } from 'drizzle-orm';

import { categories } from '../db/schema/categories';
import { users } from '../db/schema/users';

const router = Router();

router.get('/food', async (req, res) => {
  let category = typeof req.query.cat === 'string' ? (req.query.cat === '' ? null : parseInt(req.query.cat)) : null;
  const q = typeof req.query.q === 'string' ? req.query.q : null;
  const page = typeof req.query.p === 'string' ? parseInt(req.query.p) : 1;

  let cat;
  if (!isNaN(category || NaN)) {
    cat = await db
      .select()
      .from(categories)
      .where(sql`id = ${category}`)
      .execute();
    if (cat.length === 0) {
      category = null;
    }
  }

  let result;

  const baseQuery = db
    .select()
    .from(food)
    .leftJoin(users, sql`users.id = food.author`)
    .leftJoin(categories, sql`categories.id = food.category`);

  if (category) {
    baseQuery.where(sql`category = ${cat![0].id}`);
  }

  if (q) {
    baseQuery.where(
      sql`(
      setweight(to_tsvector('english', title), 'A') ||
      setweight(to_tsvector('english', description), 'B') ||
      setweight(to_tsvector('english', yields), 'C')
    ) @@ websearch_to_tsquery('english', ${q})`
    );
  }

  result = await baseQuery.execute();

  let count = result.length;
  const perPage = 30;
  const totalPages = Math.ceil(count / perPage);
  const offset = (page - 1) * perPage;
  const currentRows = result.slice(offset, offset + perPage);

  let mapped = [];
  for (const r of currentRows) {
    mapped.push({
      ...r.food,
      prep_time: minsToHuman(r.food.prep_time),
      cook_time: minsToHuman(r.food.cook_time),
      total_time: minsToHuman(r.food.prep_time + r.food.cook_time),
      author: r.users,
      category: r.categories
    });
  }

  const c = await db.select().from(categories).execute();

  res.render('food/search.pug', {
    results: mapped,
    query: q,
    category: category,
    page: page,
    categories: c,
    total: totalPages
  });
});

router.get('/food/:id', async (req, res) => {
  const id = req.params.id;
  const f = await db
    .select()
    .from(food)
    .leftJoin(users, sql`food.author = users.id`)
    .where(sql`food.id = ${id}`)
    .execute();
  if (f.length === 0) {
    res.status(404).render('404.pug');
    return;
  }

  /*const c = await db.execute(sql`
    with recursive comment_tree as (
      select
        id,
        content,
        author_id,
        created_at,
        edited,
        edited_at,
        parent_id,
        0 as level
      from food_comments
      where parent_id is null and food_id = ${id}
      union all
      select
        fc.id,
        fc.content,
        fc.author_id,
        fc.created_at,
        fc.edited,
        fc.edited_at,
        fc.parent_id,
        ct.level + 1
      from food_comments fc
      join comment_tree ct on fc.parent_id = ct.id
    ),
    comment_hierarchy as (
      select
        id,
        content,
        author_id,
        created_at,
        edited,
        edited_at,
        parent_id,
        level,
        array[]::integer[] as path
      from comment_tree
      where level = 0
      union all
      select
        ct.id,
        ct.content,
        ct.author_id,
        ct.created_at,
        ct.edited,
        ct.edited_at,
        ct.parent_id,
        ct.level,
        ch.path || ct.id
      from comment_tree ct
      join comment_hierarchy ch on ct.parent_id = ch.id
    )
    select
      ch.id,
      ch.content,
      ch.author_id,
      ch.created_at,
      ch.edited,
      ch.edited_at,
      ch.parent_id,
      u.username,
      u.display_name,
      (select json_agg(child) from (
        select
          ch2.id,
          ch2.content,
          ch2.author_id,
          ch2.created_at,
          ch2.edited,
          ch2.edited_at,
          ch2.parent_id,
          u.username,
          u.display_name
        from comment_hierarchy ch2
        join users u on ch.author_id = u.id
        where parent_id = ch.id
      ) as child) as children
    from comment_hierarchy ch
    join users u on ch.author_id = u.id
    where level = 0
    order by created_at desc;
  `)*/

  /*const c = await db.execute(sql`
    with recursive comment_hierarchy as (
      select
        id,
        content,
        author_id,
        created_at,
        edited,
        edited_at,
        parent_id,
        0 as level,
        array[id] as path
      from food_comments
      where parent_id is null and food_id = ${id}
      union all
      select
        fc.id,
        fc.content,
        fc.author_id,
        fc.created_at,
        fc.edited,
        fc.edited_at,
        fc.parent_id,
        ch.level + 1,
        ch.path || fc.id
      from food_comments fc
      join comment_hierarchy ch on fc.parent_id = ch.id
    )
    select
      ch.id,
      ch.content,
      ch.author_id,
      ch.created_at,
      ch.edited,
      ch.edited_at,
      ch.parent_id,
      u.username,
      u.display_name,
      (select json_agg(child) from (
        select
          ch2.id,
          ch2.content,
          ch2.author_id,
          ch2.created_at,
          ch2.edited,
          ch2.edited_at,
          ch2.parent_id,
          u.username,
          u.display_name
        from comment_hierarchy ch2
        join users u on ch2.author_id = u.id
        where ch2.parent_id = ch.id
      ) as child) as children
    from comment_hierarchy ch
    join users u on ch.author_id = u.id
    where ch.level = 0
    order by ch.created_at desc;
  `)*/

  const c = await db.execute(sql`
    WITH RECURSIVE comment_tree AS (
      SELECT
        fc.id,
        fc.parent_id,
        fc.content,
        fc.author_id,
        fc.created_at,
        jsonb_build_object(
          'id', fc.id,
          'content', fc.content,
          'author_id', fc.author_id,
          'created_at', fc.created_at,
          'children', jsonb '[]'
        ) AS comment
      FROM food_comments fc
      WHERE fc.food_id = ${id} AND fc.parent_id IS NULL

      UNION ALL

      SELECT
        c.id,
        c.parent_id,
        c.content,
        c.author_id,
        c.created_at,
        jsonb_set(
          p.comment,
          '{children}',
          p.comment->'children' || jsonb_build_array(
            jsonb_build_object(
              'id', c.id,
              'content', c.content,
              'author_id', c.author_id,
              'created_at', c.created_at,
              'children', jsonb '[]'
            )
          )
        ) AS comment
      FROM food_comments c
      JOIN comment_tree p ON c.parent_id = p.id
    )
    SELECT
      comment
    FROM comment_tree
    WHERE parent_id IS NULL;
  `);

  res.render('food/details.pug', {
    food: {
      ...f[0].food,
      prep_time: minsToHuman(f[0].food.prep_time),
      cook_time: minsToHuman(f[0].food.cook_time),
      total_time: minsToHuman(f[0].food.prep_time + f[0].food.cook_time),
      author: f[0].users,
      comments: c.rows
    }
  });
});

export default router;
