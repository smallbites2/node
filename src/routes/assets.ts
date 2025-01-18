import { Router } from 'express';
import { s3 } from '../env';
import { minioClient } from '../s3';
import sharp from 'sharp';

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
        const transformer = sharp().resize(size).webp({ quality: 80 });
        stream.pipe(transformer).pipe(res);
        return;
      }
    }
  }

  res.header('Content-Type', 'image/webp');
  //res.header("Cache-Control", "public, max-age=31536000");
  stream.pipe(res);
});

export default router;
