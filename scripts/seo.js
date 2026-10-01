/**
 * SEO layer for the Studio Thirty6 Films site.
 *
 * The visible site is a JavaScript "Cinema OS" whose projects and services
 * load live from Supabase, so the raw HTML a crawler receives says almost
 * nothing about the studio. At build time this module pulls the same
 * published content from Supabase and bakes it into dist/ as:
 *
 *   1. A crawlable, screen-reader-accessible content block (H1, about,
 *      services, clients, work list) — replaces the block between
 *      <!-- SEO:START --> and <!-- SEO:END --> in index.html.
 *   2. JSON-LD structured data (organisation + website + video list) —
 *      injected at <!-- SEO:JSONLD -->.
 *   3. A fresh og:image pointing at the featured project's thumbnail.
 *   4. sitemap.xml with <lastmod> and a video entry for every film.
 *
 * If Supabase can't be reached at build time the hand-written fallback
 * block already in index.html ships unchanged, so the build never fails
 * because of SEO.
 *
 * Local testing without network: set SEO_FIXTURE_DIR to a folder holding
 * projects.json / services.json / archive.json.
 */
const fs = require('fs');
const path = require('path');
const { buildPages } = require('./pages');

const SITE_URL = 'https://studiothirty6films.com';
const STUDIO_NAME = 'Studio Thirty6 Films';
const INSTAGRAM_URL = 'https://www.instagram.com/studiothirty6_films/';

/* Brands the studio has shot for that aren't (yet) published as projects
 * in the CMS. Kept here so the client list never loses them. */
const NOTABLE_CLIENTS = ['Vogue', 'Bvlgari', 'Bose', 'Kiko Milano', 'Tira', 'Amazon', 'Max Fashion'];

const MAX_JSONLD_VIDEOS = 30;

/* ── helpers ─────────────────────────────────────────── */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

/** "1:11" → "PT1M11S" (ISO 8601 duration for schema.org). */
function isoDuration(d) {
  const m = /^(?:(\d+):)?(\d+):(\d{1,2})$/.exec(clean(d));
  if (!m) return undefined;
  const h = Number(m[1] || 0), min = Number(m[2]), s = Number(m[3]);
  return `PT${h ? h + 'H' : ''}${min ? min + 'M' : ''}${s}S`;
}

/** "1:11" → 71 (seconds, for the video sitemap). */
function seconds(d) {
  const parts = clean(d).split(':').map(Number);
  if (parts.some(Number.isNaN) || !parts.length) return undefined;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

function uniq(list) {
  const seen = new Set();
  return list.filter((x) => {
    const k = clean(x).toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Drop near-duplicate client names (e.g. "Amazon" vs "Amazon Beauty" stay, exact dupes go). */
function clientList(projects) {
  return uniq([...NOTABLE_CLIENTS, ...projects.map((p) => clean(p.client))]);
}

/* ── data ────────────────────────────────────────────── */

function readSupabaseConfig(root) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
  const local = path.join(root, 'js', 'config.js');
  if (!fs.existsSync(local)) return null;
  const src = fs.readFileSync(local, 'utf8');
  const url = /url:\s*["']([^"']+)["']/.exec(src);
  const key = /anonKey:\s*["']([^"']+)["']/.exec(src);
  return url && key ? { url: url[1], key: key[1] } : null;
}

async function rest(cfg, query) {
  const res = await fetch(`${cfg.url}/rest/v1/${query}`, {
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${query.split('?')[0]}`);
  return res.json();
}

async function loadData(root) {
  const fixtures = process.env.SEO_FIXTURE_DIR;
  if (fixtures) {
    const read = (f) => JSON.parse(fs.readFileSync(path.join(fixtures, f), 'utf8'));
    return { projects: read('projects.json'), services: read('services.json'), archive: read('archive.json') };
  }

  const cfg = readSupabaseConfig(root);
  if (!cfg) throw new Error('no Supabase config');

  const [projects, services, archiveRows] = await Promise.all([
    rest(cfg, 'projects?select=title,slug,client,category,year,description,thumbnail,video,duration,featured,created_at,updated_at,display_order&published=eq.true&order=display_order.asc.nullslast'),
    rest(cfg, 'services?select=title,description,display_order&enabled=eq.true&order=display_order.asc'),
    rest(cfg, 'page_content?select=content&page=eq.archive&section=eq.content&limit=1'),
  ]);
  return { projects, services, archive: (archiveRows[0] && archiveRows[0].content) || {} };
}

/* ── renderers ───────────────────────────────────────── */

function renderContentBlock({ projects, services, archive }, categoryUrl) {
  const about = [archive.studio_description_1, archive.studio_description_2].map(clean).filter(Boolean);
  const clients = clientList(projects);

  const byCategory = new Map();
  for (const p of projects) {
    const cat = clean(p.category) || 'Films';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(p);
  }

  const servicesHtml = services
    .map((s) => `      <li><h3>${esc(clean(s.title))}</h3><p>${esc(clean(s.description))}</p></li>`)
    .join('\n');

  const link = (url, text) => (url ? `<a href="${url}">${text}</a>` : text);
  const workHtml = [...byCategory.entries()]
    .map(([cat, list]) => {
      const items = list
        .map((p) => {
          const meta = [clean(p.client), clean(p.category), p.year].filter(Boolean).join(' · ');
          const desc = clean(p.description);
          return `        <li><strong>${link(p._url, esc(clean(p.title)))}</strong> — ${esc(meta)}${desc && desc !== clean(p.title) ? `. ${esc(desc)}` : ''}</li>`;
        })
        .join('\n');
      return `      <h3>${link(categoryUrl && categoryUrl(cat), esc(cat))}</h3>\n      <ul>\n${items}\n      </ul>`;
    })
    .join('\n');

  const stats = (archive.stats || [])
    .map((s) => `${esc(clean(s.value))} ${esc(clean(s.label).toLowerCase())}`)
    .join(' · ');

  return `<!-- SEO:START -->
<section id="seo" class="seo-only" aria-label="About ${STUDIO_NAME}">
  <h1>${STUDIO_NAME} — Fashion, Jewellery &amp; Brand Film Production House in New Delhi</h1>
${about.map((p) => `  <p>${esc(p)}</p>`).join('\n')}
${stats ? `  <p>${stats}.</p>\n` : ''}  <h2>Services</h2>
  <ul>
${servicesHtml}
  </ul>
  <h2>Clients</h2>
  <p>${clients.map(esc).join(', ')}.</p>
  <h2><a href="/work/">Selected work</a></h2>
${workHtml}
  <h2>Contact</h2>
  <p>New Delhi, India · <a href="mailto:info@studiothirty6films.com">info@studiothirty6films.com</a> · <a href="${INSTAGRAM_URL}">Instagram @studiothirty6_films</a></p>
</section>
<!-- SEO:END -->`;
}

function renderJsonLd({ projects, services, archive }) {
  const orgId = `${SITE_URL}/#organization`;
  const about = [archive.studio_description_1, archive.studio_description_2].map(clean).filter(Boolean).join(' ');

  const videos = projects
    .filter((p) => p.video && p.thumbnail)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, MAX_JSONLD_VIDEOS)
    .map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: clean(p.title),
      // Each film's VideoObject lives on its own watch page (/work/<slug>/).
      url: p._url ? `${SITE_URL}${p._url}` : `${SITE_URL}/`,
    }));

  const graph = [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': orgId,
      name: STUDIO_NAME,
      alternateName: ['Studio Thirty6', 'Thirty6 Films'],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon-512x512.png`,
      image: (projects.find((p) => p.featured) || projects[0] || {}).thumbnail,
      description: about || undefined,
      email: 'info@studiothirty6films.com',
      foundingDate: '2018',
      address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressRegion: 'Delhi', addressCountry: 'IN' },
      areaServed: ['India', 'Worldwide'],
      knowsAbout: services.map((s) => clean(s.title)),
      sameAs: [INSTAGRAM_URL],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: STUDIO_NAME,
      publisher: { '@id': orgId },
      inLanguage: 'en-IN',
    },
  ];
  if (videos.length) {
    graph.push({ '@type': 'ItemList', name: `${STUDIO_NAME} — selected films`, itemListElement: videos });
  }

  // JSON.stringify drops undefined keys; escape "<" so no value can close the script tag.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function renderSitemap({ projects }, pageUrls = []) {
  const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
  const homeLastmod = projects.map((p) => p.updated_at || p.created_at).filter(Boolean).sort().pop();

  const videoXml = (p) => {
    if (!p || !p.video || !p.thumbnail) return '';
    const secs = seconds(p.duration);
    const desc = clean(p.description) || `${clean(p.category)} for ${clean(p.client)}`;
    return [
      '    <video:video>',
      `      <video:thumbnail_loc>${esc(p.thumbnail)}</video:thumbnail_loc>`,
      `      <video:title>${esc(clean(p.title))}</video:title>`,
      `      <video:description>${esc(desc.slice(0, 2048))}</video:description>`,
      `      <video:content_loc>${esc(p.video)}</video:content_loc>`,
      secs ? `      <video:duration>${secs}</video:duration>` : null,
      p.created_at ? `      <video:publication_date>${esc(new Date(p.created_at).toISOString())}</video:publication_date>` : null,
      '    </video:video>',
    ].filter(Boolean).join('\n') + '\n';
  };

  const entry = (loc, lastmod, priority, extra = '') =>
    `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n${lastmod ? `    <lastmod>${day(lastmod)}</lastmod>\n` : ''}    <priority>${priority}</priority>\n${extra}  </url>`;

  const urls = [entry('/', homeLastmod, '1.0')];
  for (const u of pageUrls) {
    const priority = u.project ? '0.6' : u.loc === '/work/' ? '0.9' : '0.8';
    urls.push(entry(u.loc, u.lastmod, priority, videoXml(u.project)));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('\n')}
</urlset>
`;
}

/* ── entry point ─────────────────────────────────────── */

async function applySeo(root, dist) {
  let data;
  try {
    data = await loadData(root);
  } catch (err) {
    console.warn(`[seo] Could not load content from Supabase (${err.message}) — shipping the static fallback block.`);
    return;
  }
  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.services = Array.isArray(data.services) ? data.services : [];
  data.archive = data.archive || {};

  // Project/category pages first: they assign each project its _url,
  // which the homepage block, JSON-LD and sitemap all link to.
  const pages = buildPages(dist, data);

  const indexPath = path.join(dist, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, () => renderContentBlock(data, pages.categoryUrl));
  html = html.replace('<!-- SEO:JSONLD -->', () => renderJsonLd(data));

  const featured = data.projects.find((p) => p.featured && p.thumbnail) || data.projects.find((p) => p.thumbnail);
  if (featured) {
    html = html.replace(
      /(<meta (?:property|name)="(?:og:image|twitter:image)" content=")[^"]*(")/g,
      (_, a, b) => `${a}${esc(featured.thumbnail)}${b}`
    );
  }

  fs.writeFileSync(indexPath, html);
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), renderSitemap(data, pages.urls));

  console.log(
    `[seo] Baked ${data.projects.length} projects, ${data.services.length} services, ` +
      `${clientList(data.projects).length} clients into index.html; ` +
      `${pages.urls.length} pages (${pages.categories.length} categories) + sitemap.xml.`
  );
}

module.exports = { applySeo };
