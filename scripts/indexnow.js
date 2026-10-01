/**
 * IndexNow — tells Bing, Yandex, Seznam, Naver (and other IndexNow
 * engines) about new and changed pages as soon as a production deploy goes
 * out, instead of waiting for them to recrawl.
 *
 * How it decides what to submit: it fetches the *currently live* sitemap
 * (the previous deploy) and compares it with the sitemap this build just
 * generated. A URL is submitted when it's new or its <lastmod> changed.
 * If the live site doesn't serve our key file yet (the first deploy with
 * IndexNow), every URL is submitted once.
 *
 * Runs only on Vercel production builds (VERCEL_ENV=production), never on
 * previews or local builds. Any failure is logged and ignored — IndexNow
 * must never break a deploy.
 *
 * The key file (<key>.txt at the site root) proves we own the domain. It
 * is public by design; changing it just means submitting under a new key.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://studiothirty6films.com';
const HOST = 'studiothirty6films.com';
const KEY = '8ba198b7cc9785c4f4c7b23c5a8a79c2';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** loc → lastmod (or '') for every <url> in a sitemap. */
function parseSitemap(xml) {
  const map = new Map();
  for (const block of String(xml).match(/<url>[\s\S]*?<\/url>/g) || []) {
    const loc = (/<loc>([^<]+)<\/loc>/.exec(block) || [])[1];
    const lastmod = (/<lastmod>([^<]+)<\/lastmod>/.exec(block) || [])[1] || '';
    if (loc) map.set(loc.trim(), lastmod.trim());
  }
  return map;
}

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' } });
  return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : '' };
}

/** Pure diff, exported for testing. */
function changedUrls(nextMap, liveMap, { submitAll = false } = {}) {
  const out = [];
  for (const [loc, lastmod] of nextMap) {
    if (submitAll || !liveMap.has(loc) || liveMap.get(loc) !== lastmod) out.push(loc);
  }
  return out;
}

async function submitIndexNow(dist) {
  if (process.env.VERCEL_ENV !== 'production' && !process.env.INDEXNOW_FORCE) {
    console.log('[indexnow] Not a production build — skipping.');
    return;
  }

  try {
    const next = parseSitemap(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'));

    const keyFile = await get(`${SITE_URL}/${KEY}.txt`).catch(() => ({ ok: false }));
    const firstRun = !keyFile.ok || keyFile.text.trim() !== KEY;

    let live = new Map();
    if (!firstRun) {
      const sm = await get(`${SITE_URL}/sitemap.xml`).catch(() => ({ ok: false }));
      if (sm.ok) live = parseSitemap(sm.text);
    }

    const urls = changedUrls(next, live, { submitAll: firstRun || live.size === 0 });
    if (!urls.length) {
      console.log('[indexnow] No new or changed pages — nothing to submit.');
      return;
    }

    // The protocol allows 10,000 URLs per request; we're nowhere near that.
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(20000),
    });
    // 200 = accepted, 202 = accepted (key validation pending — normal on the first run).
    console.log(
      `[indexnow] Submitted ${urls.length} URL(s)${firstRun ? ' (first run: all pages)' : ''} → HTTP ${res.status}.` +
        (urls.length <= 5 ? ` ${urls.join(', ')}` : '')
    );
  } catch (err) {
    console.warn(`[indexnow] Skipped (${err.message}). The deploy is unaffected.`);
  }
}

module.exports = { submitIndexNow, parseSitemap, changedUrls, KEY };
