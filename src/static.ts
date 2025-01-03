import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import htmlMinify from 'html-minifier';
import CleanCSS from 'clean-css';
import pug from 'pug';

const router = Router();

const css = new CleanCSS({
  level: 2,
  returnPromise: false
});

router.get(['/', '/*'], (req, res) => {
  let p = req.path;
  if (req.path.endsWith('/')) {
    p += 'index.pug';
  }

  if (req.path.includes('..')) {
    res.status(400).send('Invalid path');
    return;
  }

  const filePath = path.join(__dirname, '..', 'views', p);
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Not found');
    return;
  }

  if (p.endsWith('.pug')) {
    res.setHeader('Content-Type', 'text/html');
    const content = fs.readFileSync(filePath, 'utf-8');
    const compiled = pug.compile(content, { filename: filePath });
    const html = compiled();

    res.send(
      htmlMinify.minify(html, {
        caseSensitive: false,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true, // Collapse white space that contributes to text nodes in a document tree
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
      })
    );
    return;
  }

  if (p.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.send(css.minify(content).styles);
    return;
  }

  res.sendFile(filePath);
});

export default router;
