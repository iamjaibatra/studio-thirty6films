#!/usr/bin/env node
/**
 * Static "build" for the Studio Thirty6 Films site — there's no bundler
 * here on purpose (plain HTML/CSS/ESM JS, per the existing architecture).
 * This script just:
 *   1. Copies the static files into dist/
 *   2. Generates dist/js/config.js from SUPABASE_URL / SUPABASE_ANON_KEY
 *      env vars (set these in the Vercel project settings), or falls back
 *      to a local js/config.js for `npm run build` during development.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const COPY_ITEMS = ['index.html', 'css', 'js', 'data'];

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

function writeConfig() {
  const configPath = path.join(DIST, 'js', 'config.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const content = `window.__SUPABASE_CONFIG__ = ${JSON.stringify(
      { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
      null,
      2
    )};\n`;
    fs.writeFileSync(configPath, content);
    console.log('[build] Generated js/config.js from SUPABASE_URL / SUPABASE_ANON_KEY env vars.');
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

  for (const item of COPY_ITEMS) {
    const src = path.join(ROOT, item);
    if (fs.existsSync(src)) copyRecursive(src, path.join(DIST, item));
  }

  writeConfig();
  console.log(`[build] Done → ${DIST}`);
}

main();
