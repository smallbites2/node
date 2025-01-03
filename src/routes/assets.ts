import { Router } from 'express';
import { s3 } from '../env';
import { minioClient } from '../s3';
import gm from 'gm';
import fs from 'node:fs';

const router = Router();

router.get('/assets/food/:id.webp', async (req, res) => {
  const id = req.params.id;
  const stream = await minioClient.getObject(s3.bucket, `food/${id}.webp`);

  if (!req.query.raw) {
    if (req.query.size) {
      const size = parseInt(req.query.size as string);
      if (!isNaN(size) && size > 1 && size < 1024) {
        res.header('Content-Type', 'image/webp');
        //res.header("Cache-Control", "public, max-age=31536000");
        gm(stream).resize(size).setFormat('webp').quality(80).stream().pipe(res);
        return;
      }
    }
  }

  res.header('Content-Type', 'image/webp');
  //res.header("Cache-Control", "public, max-age=31536000");
  stream.pipe(res);
});

export default router;
