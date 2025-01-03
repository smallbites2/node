import * as Minio from 'minio';
import { s3 } from './env';

export const minioClient = new Minio.Client({
  endPoint: s3.endpoint,
  port: s3.port,
  accessKey: s3.accessKey,
  secretKey: s3.secretKey
});
