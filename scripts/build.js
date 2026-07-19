#!/usr/bin/env node
/**
 * Static "build" for the Studio Thirty6 Films site — there's no bundler
 * here on purpose (plain HTML/CSS/ESM JS, per the existing architecture).
 * This script:
 *   1. Copies the static files into dist/
 *   2. Generates dist/js-{version}/config.js from SUPABASE_URL /
 *      SUPABASE_ANON_KEY env vars, or falls back to a local js/config.js
 *   3. Versions js/ and data/content.js into a per-build directory name
 *      (not a query string) so every deploy gets a genuinely new URL —
 *      this cascades correctly to every internal `import './modules/x.js'`
 *      statement too, since relative ES module imports resolve against
 *      the importing file's own URL. A query string on the top-level
 *      <script> tag alone would NOT have cache-busted those nested
 *      imports, since each is fetched as its own distinct URL by the
 *      browser regardless of what query string was on app.js.
 *   4. Appends the same version as a query string on the CSS <link> tags
 *      (safe there — this stylesheet has no local relative resources).
 * This removes any dependence on Cache-Control headers being honored
 * correctly by every intermediate cache/CDN — a stale copy of a
 * previous version simply lives at a different, no-longer-referenced URL.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const STATIC_COPY_ITEMS = [
  'index.html',
  '404.html',
  'css',
  'favicon.svg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-192x192.png',
  'favicon-512x512.png',
  'apple-touch-icon.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/** Short, stable-per-content hash of every JS file, so identical rebuilds don't churn the version needlessly. */
function computeVersion() {
  const hash = crypto.createHash('sha1');
  const jsDir = path.join(ROOT, 'js');

  function hashDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) hashDir(full);
      else hash.update(fs.readFileSync(full));
    }
  }
  hashDir(jsDir);
  hash.update(fs.readFileSync(path.join(ROOT, 'data', 'content.js')));

  return hash.digest('hex').slice(0, 10);
}

function writeConfig(jsDistDir) {
  const configPath = path.join(jsDistDir, 'config.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const content = `window.__SUPABASE_CONFIG__ = ${JSON.stringify(
      { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
      null,
      2
    )};\n`;
    fs.writeFileSync(configPath, content);
    console.log('[build] Generated config.js from SUPABASE_URL / SUPABASE_ANON_KEY env vars.');
    return;
  }

  const localConfig = path.join(ROOT, 'js', 'config.js');
  if (fs.existsSync(localConfig)) {
    fs.copyFileSync(localConfig, configPath);
    console.log('[build] No env vars set — using existing local js/config.js.');
    return;
  }

  console.warn(
    '[build] WARNING: no SUPABASE_URL/SUPABASE_ANON_KEY env vars and no local js/config.js. ' +
      'The built site will not be able to reach Supabase — copy js/config.example.js to ' +
      'js/config.js (locally) or set the env vars (on Vercel) before deploying.'
  );
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  for (const item of STATIC_COPY_ITEMS) {
    const src = path.join(ROOT, item);
    if (fs.existsSync(src)) copyRecursive(src, path.join(DIST, item));
  }

  const version = computeVersion();
  const jsDistDir = path.join(DIST, `js-${version}`);
  copyRecursive(path.join(ROOT, 'js'), jsDistDir);
  writeConfig(jsDistDir);

  const dataDistDir = path.join(DIST, `data-${version}`);
  copyRecursive(path.join(ROOT, 'data'), dataDistDir);

  const indexPath = path.join(DIST, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html
    .replace(/(["'])js\/config\.js\1/, `$1js-${version}/config.js$1`)
    .replace(/(["'])data\/content\.js\1/, `$1data-${version}/content.js$1`)
    .replace(/(["'])js\/app\.js\1/, `$1js-${version}/app.js$1`)
    .replace(/(["'])css\/main\.css\1/, `$1css/main.css?v=${version}$1`)
    .replace(/(["'])css\/modes\.css\1/, `$1css/modes.css?v=${version}$1`);
  fs.writeFileSync(indexPath, html);

  console.log(`[build] Version ${version} — done → ${DIST}`);
}

main();
