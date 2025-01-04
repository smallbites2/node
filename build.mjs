import * as esbuild from 'esbuild';
import fs from 'node:fs';

const p = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

esbuild.buildSync({
  entryPoints: ['src/index.ts', 'src/cron.ts'],
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  target: 'node22',
  sourcemap: 'linked',
  minify: true,
  logLevel: 'info',
  format: 'cjs',
  external: [
    ...Object.keys(p.dependencies),
  ]
});
