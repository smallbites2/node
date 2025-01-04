import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { gitDescribe } from 'git-describe';

const p = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const gitPlugin = {
  name: 'git',
  setup(build) {
    build.onResolve({ filter: /^git$/ }, args => {
      return { path: args.path, namespace: 'git' };
    });

    build.onLoad({ filter: /.*/, namespace: 'git' }, async () => {
      return {
        contents: JSON.stringify(await gitDescribe({ dirtyMark: true })),
        loader: 'json'
      };
    });
  }
};

esbuild.build({
  entryPoints: ['src/index.ts', 'src/cron.ts'],
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  target: 'node22',
  sourcemap: 'linked',
  minify: true,
  logLevel: 'info',
  format: 'cjs',
  external: [...Object.keys(p.dependencies)],
  plugins: [gitPlugin]
});
