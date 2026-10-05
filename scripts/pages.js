/**
 * Static project + category pages for Studio Thirty6 Films.
 *
 * The Cinema OS homepage is one URL, so search engines can only rank it for
 * the studio's name. At build time this module turns the same published CMS
 * content into crawlable pages:
 *
 *   /work/                      — index of every category and film
 *   /work/<project>/            — one watch page per published project
 *   /<category-slug>/           — one page per category (e.g. /jewellery-films/)
 *
 * Every page is plain HTML + css/pages.css (no app JS), shares the site's
 * look, and links back into the Cinema OS. Called from scripts/seo.js.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://studiothirty6films.com';
const STUDIO = 'Studio Thirty6 Films';
const INSTAGRAM = 'https://www.instagram.com/studiothirty6_films/';

/* The studio's official profiles elsewhere. Listed as schema.org sameAs and
 * in every footer so search engines tie them to one business. */
const FOUNDER = 'Gimmy Kohli';

const PROFILES = [
  { name: 'Instagram', url: INSTAGRAM },
  { name: 'YouTube', url: 'https://www.youtube.com/@StudioThirty6Films' },
  { name: 'Vimeo', url: 'https://vimeo.com/studiothirty6films' },
];
const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap';

/* CMS category → page. `service` is the CMS services row whose copy we reuse;
 * anything not listed here still gets a page with a generic title. */
const CATEGORY_PAGES = {
  'Jewellery':        { slug: 'jewellery-films',     h1: 'Jewellery Films',               title: 'Jewellery Film & Video Production, New Delhi',           service: 'Jewellery Films' },
  'Fashion Campaign': { slug: 'fashion-campaigns',   h1: 'Fashion Campaign Films',        title: 'Fashion Campaign Film Production, New Delhi',            service: 'Fashion Campaigns' },
  'Brand Film':       { slug: 'brand-films',         h1: 'Brand Films',                   title: 'Brand Film Production Company, New Delhi',               service: 'Brand Films' },
  'Reels':            { slug: 'reels',               h1: 'Fashion & Brand Reels',         title: 'Reels Production for Fashion & Lifestyle Brands, New Delhi', service: 'Reels' },
  'Celebrities':      { slug: 'celebrity-shoots',    h1: 'Celebrity Shoots',              title: 'Celebrity Campaign Shoots, New Delhi',                   service: 'Celebrities' },
  'Editorials':       { slug: 'editorial-films',     h1: 'Editorial Films',               title: 'Fashion Editorial Video Production, New Delhi',          service: 'Editorials' },
  'Beauty':           { slug: 'beauty-campaigns',    h1: 'Beauty Campaigns',              title: 'Beauty Campaign Video Production, New Delhi',            service: 'Beauty Campaigns' },
  'Architecture':     { slug: 'architecture-films',  h1: 'Architecture & Corporate Films', title: 'Architecture & Corporate Video Production, New Delhi',  service: 'Architecture' },
  'Product':          { slug: 'product-films',       h1: 'Product Films',                 title: 'Product Video Production, New Delhi',                    service: 'Product' },
};

/* Category order on index pages and in navigation. */
const CATEGORY_ORDER = Object.keys(CATEGORY_PAGES);

/* Landing-page copy per category: who it's for and what the studio makes.
 * Client names, counts and years are added from the CMS at build time, so
 * nothing here needs updating when new films are published. */
const CATEGORY_COPY = {
  'Jewellery': {
    pitch: 'Jewellery is the hardest product to film well: metal flares, stones lose their fire under the wrong light, and a piece that looks extraordinary in the hand can look flat on screen. Our jewellery films are lit and shot for the piece first — macro detail of setting and stone, then the jewellery on a person, in motion — so the craft reads at full scale on a phone screen as much as in a campaign film.',
    who: 'We work with jewellery houses and fine-jewellery labels on collection launches, campaign films, festive edits, and product films for e-commerce and social.',
  },
  'Fashion Campaign': {
    pitch: 'A fashion campaign film has to sell the clothes and the world around them in the same frame. We shoot campaigns that keep the garment honest — fall, texture, fit and movement — while building the mood that makes a collection feel like a place the audience wants to be.',
    who: 'We make season and collection campaigns, festive and occasion-wear films, lookbook videos and launch content for fashion labels, designers and retail brands.',
  },
  'Brand Film': {
    pitch: 'Brand films put the brand inside a world the audience wants to inhabit. Direction, production and post-production are handled in-house, so the story, the look and the final grade come from one team rather than being stitched together across vendors.',
    who: 'We make brand films for fashion, lifestyle and consumer brands — launch films, festive and seasonal campaigns, brand stories and the cut-downs that go with them.',
  },
  'Reels': {
    pitch: 'Reels are shot and cut for the feed, not cropped from a horizontal film after the fact. We plan vertical-first: framing, pacing and the first second are built for how people actually scroll, with the same lighting and styling standards as our campaign work.',
    who: 'We produce reels for fashion labels, designers, jewellers and lifestyle brands — collection drops, styling and product reels, and ongoing social content.',
  },
  'Celebrities': {
    pitch: 'Celebrity shoots run on tight windows and high expectations. We plan the day so talent time goes into the frames that matter, and we shoot for the person behind the persona — presence and personality, not just a famous face holding a product.',
    who: 'We shoot celebrity campaigns, talent-led brand films and editorial videos for fashion, jewellery and lifestyle brands, including multi-talent series.',
  },
  'Editorials': {
    pitch: 'Editorial films are about people — their truth and their world. We shoot fashion editorials, cover stories and portrait films with the intimacy of a magazine story and the craft of a campaign, for print-led titles and digital platforms alike.',
    who: 'We make fashion editorials, cover and feature films, and portrait videos for magazines, designers and brands.',
  },
  'Beauty': {
    pitch: 'Beauty films live in close-up: skin, texture, colour and the way a product moves. We light and grade for true colour so shades and finishes read accurately, and we shoot both the product and the person wearing it.',
    who: 'We make beauty campaign films, product launches and social content for beauty, cosmetics and personal-care brands.',
  },
  'Architecture': {
    pitch: 'In architecture and corporate films the building is the subject, not the backdrop. We plan around light and time of day to show space, material and scale, and to tell the story of the people and the work inside it.',
    who: 'We make architecture films, corporate and facility films, and company profiles for businesses.',
  },
  'Product': {
    pitch: 'Product films need every surface and reflection under control. We shoot products to feel tangible and desirable — texture, detail and scale — for launches, e-commerce listings and social.',
    who: 'We make product films for jewellery, fashion, beauty and consumer brands, for launches, product pages and social.',
  },
};

/* ── helpers ─────────────────────────────────────────── */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const slugify = (s) => clean(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function isoDuration(d) {
  const m = /^(?:(\d+):)?(\d+):(\d{1,2})$/.exec(clean(d));
  if (!m) return undefined;
  const h = Number(m[1] || 0), min = Number(m[2]), s = Number(m[3]);
  return `PT${h ? h + 'H' : ''}${min ? min + 'M' : ''}${s}S`;
}

function categoryPage(cat) {
  const c = clean(cat) || 'Films';
  return CATEGORY_PAGES[c] || { slug: `${slugify(c)}-films`, h1: c, title: `${c} Video Production, New Delhi`, service: c };
}

/** "a" or "an" before a lower-cased category label. */
function article(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }

/** Singular, lower-case noun for a project's category ("a jewellery film"). */
function kindOf(cat) {
  const map = {
    'Jewellery': 'jewellery film', 'Fashion Campaign': 'fashion campaign film', 'Brand Film': 'brand film',
    'Reels': 'reel', 'Celebrities': 'celebrity shoot', 'Editorials': 'editorial film', 'Beauty': 'beauty campaign',
    'Architecture': 'corporate film', 'Product': 'product film',
  };
  return map[clean(cat)] || 'film';
}

/**
 * Clean, stable URL slugs. CMS slugs end in a random 4-char suffix
 * ("kalki-ghar-ki-diwali-jjlk"); strip it, and on a collision keep the
 * clean slug for the oldest project and suffix the others with the year,
 * falling back to the original CMS slug.
 */
function assignSlugs(projects) {
  const base = (p) => (clean(p.slug) ? clean(p.slug).replace(/-[a-z0-9]{4}$/, '') : slugify(p.title)) || slugify(p.title);
  const groups = new Map();
  for (const p of projects) {
    const b = base(p);
    if (!groups.has(b)) groups.set(b, []);
    groups.get(b).push(p);
  }
  const used = new Set();
  for (const [b, list] of groups) {
    list.sort((x, y) => String(x.created_at || '').localeCompare(String(y.created_at || '')) || String(x.slug).localeCompare(String(y.slug)));
    list.forEach((p, i) => {
      let s = i === 0 ? b : `${b}-${p.year || ''}`.replace(/-$/, '');
      if (used.has(s)) s = clean(p.slug) || `${b}-${i + 1}`;
      used.add(s);
      p._slug = s;
      p._url = `/work/${s}/`;
    });
  }
}

/* ── shared chrome ───────────────────────────────────── */

function head({ title, description, canonical, image, imageAlt, type = 'website', extra = '' }) {
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE_URL}${canonical}">
<meta name="theme-color" content="#080808">
<meta property="og:site_name" content="${STUDIO}">
<meta property="og:locale" content="en_IN">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE_URL}${canonical}">
${image ? `<meta property="og:image" content="${esc(image)}">
<meta property="og:image:alt" content="${esc(imageAlt || title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(image)}">` : '<meta name="twitter:card" content="summary">'}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}">
<link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<link rel="stylesheet" href="/css/pages.css">
${extra}
</head>`;
}

function topbar(activeSlug, categories) {
  const links = categories
    .map((c) => `<a href="/${c.slug}/"${c.slug === activeSlug ? ' aria-current="page"' : ''}>${esc(c.short)}</a>`)
    .join('');
  return `<header class="bar">
  <a class="brand" href="/">Studio Thirty6 Films</a>
  <nav class="cats" aria-label="Film categories"><a href="/work/"${activeSlug === 'work' ? ' aria-current="page"' : ''}>All work</a>${links}<a href="/about/"${activeSlug === 'about' ? ' aria-current="page"' : ''}>About</a><a href="/contact/"${activeSlug === 'contact' ? ' aria-current="page"' : ''}>Contact</a></nav>
  <a class="os" href="/">Enter Cinema OS <span aria-hidden="true">→</span></a>
</header>`;
}

function breadcrumbs(items) {
  const html = items
    .map((it, i) => (i < items.length - 1 ? `<a href="${it.url}">${esc(it.name)}</a>` : `<span aria-current="page">${esc(it.name)}</span>`))
    .join('<span class="sep" aria-hidden="true">/</span>');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.url}` })),
  };
  return { html: `<nav class="crumbs" aria-label="Breadcrumb">${html}</nav>`, ld: jsonLd(ld) };
}

function footer(categories, contact) {
  return `<footer class="foot">
  <div class="foot-cta">
    <p class="eyebrow">Transmit</p>
    <p class="foot-h">Let's make something <strong>worth watching.</strong></p>
    <p><a class="mail" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    <p class="addr"><a href="tel:${esc(contact.tel)}">${esc(contact.phone)}</a><br>${esc(contact.address)}</p>
  </div>
  <div class="foot-cols">
    <div><p class="eyebrow">Work</p>${categories.map((c) => `<a href="/${c.slug}/">${esc(c.h1)}</a>`).join('')}</div>
    <div><p class="eyebrow">Studio</p><a href="/">Cinema OS</a><a href="/work/">All work</a><a href="/about/">About</a><a href="/contact/">Contact</a>${PROFILES.map((p) => `<a href="${p.url}" rel="me">${p.name}</a>`).join('')}<span>New Delhi · India</span></div>
  </div>
  <p class="fine">© ${new Date().getFullYear()} ${STUDIO} · Fashion, jewellery &amp; brand film production house, New Delhi</p>
</footer>`;
}

function card(p, { eager = false } = {}) {
  const meta = [clean(p.client), p.year].filter(Boolean).join(' · ');
  return `<a class="card" href="${p._url}">
  <span class="thumb">${p.thumbnail ? `<img src="${esc(p.thumbnail)}" alt="${esc(`${clean(p.title)} — ${kindOf(p.category)} for ${clean(p.client)}`)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : ''}${p.duration ? `<span class="tc">${esc(clean(p.duration))}</span>` : ''}</span>
  <span class="card-t">${esc(clean(p.title))}</span>
  <span class="card-m">${esc(meta)}</span>
</a>`;
}

/* ── page renderers ──────────────────────────────────── */

function renderProject(p, ctx) {
  const cat = categoryPage(p.category);
  const kind = kindOf(p.category);
  const title = clean(p.title);
  const client = clean(p.client);
  const desc = clean(p.description);
  const sentence = (t) => (t && !/[.!?…]$/.test(t) ? `${t}.` : t);
  // The CMS description leads when it says more than the title; the
  // production credit follows, so the two never repeat each other.
  const ownDesc = desc && desc.toLowerCase() !== title.toLowerCase() ? sentence(desc) : '';
  const credit = `Produced by ${STUDIO} in New Delhi${client ? ` for ${client}` : ''}${p.year ? `, ${p.year}` : ''}.`;
  const lead = ownDesc || `${title} is ${article(kind)} ${kind} produced by ${STUDIO}${client ? ` for ${client}` : ''}${p.year ? ` in ${p.year}` : ''}.`;
  const extraDesc = ownDesc ? credit : '';
  const metaDescription = `${lead} ${ownDesc ? credit : 'Fashion, jewellery and brand film production from New Delhi.'}`.slice(0, 300);

  const related = ctx.projects
    .filter((x) => x !== p && clean(x.category) === clean(p.category))
    .slice(0, 6);
  const sameClient = client
    ? ctx.projects.filter((x) => x !== p && clean(x.client).toLowerCase() === client.toLowerCase() && !related.includes(x)).slice(0, 3)
    : [];
  const more = [...sameClient, ...related].slice(0, 6);

  const crumbs = breadcrumbs([
    { name: 'Home', url: '/' },
    { name: 'Work', url: '/work/' },
    { name: cat.h1, url: `/${cat.slug}/` },
    { name: title, url: p._url },
  ]);

  const video = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: `${lead}${extraDesc ? ` ${extraDesc}` : ''}`,
    thumbnailUrl: p.thumbnail || undefined,
    contentUrl: p.video || undefined,
    uploadDate: p.created_at || undefined,
    duration: isoDuration(p.duration),
    genre: clean(p.category) || undefined,
    url: `${SITE_URL}${p._url}`,
    creator: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: STUDIO },
    ...(client ? { sponsor: { '@type': 'Organization', name: client } } : {}),
  };

  return `${head({
    title: `${title}${ctx.titleSuffix.get(p) || ''} — ${cat.h1.replace(/s$/, '')} by ${STUDIO}`,
    description: metaDescription,
    canonical: p._url,
    image: p.thumbnail,
    imageAlt: `Still from ${title}`,
    type: 'video.other',
    extra: `${p.video ? `<meta property="og:video" content="${esc(p.video)}">\n<meta property="og:video:type" content="video/mp4">` : ''}\n${p.video ? jsonLd(video) : ''}\n${crumbs.ld}`,
  })}
<body>
${topbar(cat.slug, ctx.categories)}
<main class="wrap">
  ${crumbs.html}
  <article class="project">
    <p class="eyebrow">${esc([clean(p.category), p.year, clean(p.duration)].filter(Boolean).join(' · '))}</p>
    <h1>${esc(title)}</h1>
    ${p.video ? `<figure class="player">
      <video controls playsinline preload="none"${p.thumbnail ? ` poster="${esc(p.thumbnail)}"` : ''}>
        <source src="${esc(p.video)}" type="video/mp4">
      </video>
    </figure>` : p.thumbnail ? `<figure class="player"><img src="${esc(p.thumbnail)}" alt="Still from ${esc(title)}"></figure>` : ''}
    <div class="facts">
      <dl>
        ${client ? `<div><dt>Client</dt><dd>${esc(client)}</dd></div>` : ''}
        <div><dt>Category</dt><dd><a href="/${cat.slug}/">${esc(cat.h1)}</a></dd></div>
        ${p.year ? `<div><dt>Year</dt><dd>${esc(p.year)}</dd></div>` : ''}
        ${p.duration ? `<div><dt>Runtime</dt><dd>${esc(clean(p.duration))}</dd></div>` : ''}
        <div><dt>Production</dt><dd>${STUDIO}, New Delhi</dd></div>
      </dl>
      <div class="copy">
        <p>${esc(lead)}</p>
        ${extraDesc ? `<p>${esc(extraDesc)}</p>` : ''}
        <p><a class="os-link" href="/">Watch the full reel in the Cinema OS <span aria-hidden="true">→</span></a></p>
      </div>
    </div>
  </article>
  ${more.length ? `<section class="more">
    <h2>More ${esc(cat.h1.toLowerCase())}</h2>
    <div class="grid">${more.map((x) => card(x)).join('\n')}</div>
    <p><a class="os-link" href="/${cat.slug}/">All ${esc(cat.h1.toLowerCase())} <span aria-hidden="true">→</span></a></p>
  </section>` : ''}
</main>
${footer(ctx.categories, ctx.contact)}
</body>
</html>
`;
}

function renderCategory(cat, list, ctx) {
  const service = ctx.services.find((s) => clean(s.title).toLowerCase() === clean(cat.service).toLowerCase());
  const clients = [...new Set(list.map((p) => clean(p.client)).filter(Boolean))];
  const years = list.map((p) => p.year).filter(Boolean);
  const span = years.length ? (Math.min(...years) === Math.max(...years) ? `${Math.min(...years)}` : `${Math.min(...years)}–${Math.max(...years)}`) : '';
  const clientLine = clients.length
    ? `${clients.slice(0, 8).join(', ')}${clients.length > 8 ? ` and ${clients.length - 8} more` : ''}`
    : '';
  const intro = `${STUDIO} is a New Delhi production house making ${cat.h1.toLowerCase()} for fashion, jewellery and lifestyle brands. ${list.length} ${list.length === 1 ? 'film' : 'films'}${span ? ` from ${span}` : ''}${clientLine ? `, for clients including ${clientLine}` : ''}.`;
  const description = `${cat.h1} by ${STUDIO}, New Delhi — ${list.length} ${list.length === 1 ? 'film' : 'films'}${clientLine ? ` for ${clients.slice(0, 4).join(', ')}` : ''}. ${clean(service && service.description)}`.slice(0, 300);

  const crumbs = breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Work', url: '/work/' }, { name: cat.h1, url: `/${cat.slug}/` }]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.h1} — ${STUDIO}`,
    url: `${SITE_URL}/${cat.slug}/`,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${p._url}`, name: clean(p.title) })),
    },
  };
  const hero = list.find((p) => p.featured && p.thumbnail) || list.find((p) => p.thumbnail);

  // Landing copy + FAQ. Every answer is built from CMS facts (clients,
  // contact details) or the studio's stated way of working.
  const copy = CATEGORY_COPY[cat.key];
  const label = cat.h1.toLowerCase();
  const c = ctx.contact;
  const faqs = [
    clients.length && {
      q: `Which brands has ${STUDIO} made ${label} for?`,
      a: `${clients.slice(0, 12).join(', ')}${clients.length > 12 ? `, and ${clients.length - 12} more` : ''}. Every film is listed on this page${span ? (span.includes('–') ? `, made between ${span.replace('–', ' and ')}` : `, made in ${span}`) : ''}.`,
    },
    {
      q: `What does a ${kindOf(cat.key)} project with ${STUDIO} include?`,
      a: `Direction, production and post-production — edit and colour grade — are handled in-house by the studio in New Delhi. Deliverables are cut for where the film will run, from the main campaign film to social edits and vertical reels.`,
    },
    {
      q: `Where is ${STUDIO} based?`,
      a: `The studio is at ${c.address}.${ctx.stats.countries ? ` ${STUDIO} has worked on projects in ${ctx.stats.countries} countries.` : ''}`,
    },
    {
      q: `How do I get a quote for ${article(kindOf(cat.key))} ${kindOf(cat.key)}?`,
      a: `Email ${c.email} or call ${c.phone} with your brief, timeline and where the film will run. The studio replies to enquiries within 24 hours.`,
    },
  ].filter(Boolean);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return `${head({
    title: `${cat.title} | ${STUDIO}`,
    description,
    canonical: `/${cat.slug}/`,
    image: hero && hero.thumbnail,
    imageAlt: hero && `Still from ${clean(hero.title)}`,
    extra: `${jsonLd(collection)}\n${crumbs.ld}\n${jsonLd(faqLd)}`,
  })}
<body>
${topbar(cat.slug, ctx.categories)}
<main class="wrap">
  ${crumbs.html}
  <header class="intro">
    <p class="eyebrow">${esc(cat.service)} · ${list.length} ${list.length === 1 ? 'film' : 'films'}</p>
    <h1>${esc(cat.h1)}</h1>
    ${service && clean(service.description) ? `<p class="lede">${esc(clean(service.description))}</p>` : ''}
    <p>${esc(intro)}</p>
  </header>
  <div class="grid">${list.map((p, i) => card(p, { eager: i < 4 })).join('\n')}</div>
  ${copy ? `<section class="prose">
    <h2>${esc(cat.title.replace(/, New Delhi$/, ''))} in New Delhi</h2>
    <p>${esc(copy.pitch)}</p>
    <p>${esc(copy.who)}</p>
    <p>Based in Kirti Nagar, New Delhi, ${STUDIO}${ctx.stats.projects ? ` has produced ${esc(ctx.stats.projects)} projects` : ' has been making films'}${ctx.stats.brands ? ` for ${esc(ctx.stats.brands)} brands` : ''} since 2018. See <a href="/work/">all our work</a>, read <a href="/about/">about the studio</a> or <a href="/contact/">get in touch</a>.</p>
  </section>` : ''}
  <section class="faq">
    <h2>Questions</h2>
    ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n    ')}
  </section>
</main>
${footer(ctx.categories, ctx.contact)}
</body>
</html>
`;
}

function renderWorkIndex(ctx) {
  const crumbs = breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Work', url: '/work/' }]);
  const sections = ctx.categories
    .map((c) => {
      const list = ctx.byCategory.get(c.key) || [];
      return `<section class="more">
    <h2><a href="/${c.slug}/">${esc(c.h1)}</a> <span class="count">${list.length}</span></h2>
    <div class="grid">${list.slice(0, 4).map((p) => card(p)).join('\n')}</div>
    ${list.length > 4 ? `<p><a class="os-link" href="/${c.slug}/">All ${list.length} ${esc(c.h1.toLowerCase())} <span aria-hidden="true">→</span></a></p>` : ''}
  </section>`;
    })
    .join('\n');
  const description = `Work by ${STUDIO}, New Delhi — ${ctx.projects.length} fashion, jewellery, beauty, celebrity and brand films for ${[...new Set(ctx.projects.map((p) => clean(p.client)))].slice(0, 5).join(', ')} and more.`;
  const hero = ctx.projects.find((p) => p.featured && p.thumbnail) || ctx.projects.find((p) => p.thumbnail);

  return `${head({
    title: `Work — Fashion, Jewellery & Brand Films | ${STUDIO}`,
    description,
    canonical: '/work/',
    image: hero && hero.thumbnail,
    extra: crumbs.ld,
  })}
<body>
${topbar('work', ctx.categories)}
<main class="wrap">
  ${crumbs.html}
  <header class="intro">
    <p class="eyebrow">Production archive · ${ctx.projects.length} films</p>
    <h1>Work</h1>
    <p class="lede">Fashion campaigns, jewellery films, brand films, celebrity shoots and reels — produced in New Delhi by ${STUDIO}.</p>
  </header>
${sections}
  <section class="index">
    <h2>Every film</h2>
    <ul>${ctx.projects.map((p) => `<li><a href="${p._url}">${esc(clean(p.title))}</a> <span>${esc([clean(p.client), p.year].filter(Boolean).join(' · '))}</span></li>`).join('')}</ul>
  </section>
</main>
${footer(ctx.categories, ctx.contact)}
</body>
</html>
`;
}

function clientNames(ctx) {
  const seen = new Set();
  return ['Vogue', 'Bvlgari', 'Bose', 'Kiko Milano', 'Tira', 'Amazon', 'Max Fashion', ...ctx.projects.map((p) => clean(p.client))]
    .filter((n) => { const k = n.toLowerCase(); if (!n || seen.has(k)) return false; seen.add(k); return true; });
}

function contactBlock(c) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${STUDIO}, ${c.address}`)}`;
  return `<dl class="contact">
      <div><dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd></div>
      <div><dt>Phone</dt><dd><a href="tel:${esc(c.tel)}">${esc(c.phone)}</a></dd></div>
      <div><dt>Studio</dt><dd>${esc(c.address)}<br><a href="${maps}" rel="noopener">Open in Google Maps <span aria-hidden="true">↗</span></a></dd></div>
      <div><dt>Follow</dt><dd>${PROFILES.map((p) => `<a href="${p.url}" rel="me">${p.name}</a>`).join(' · ')}</dd></div>
    </dl>`;
}

function renderAbout(ctx) {
  const a = ctx.archive;
  const about = [a.studio_description_1, a.studio_description_2].map(clean).filter(Boolean);
  const clients = clientNames(ctx);
  const statLine = [
    ctx.stats.projects && `${ctx.stats.projects} projects`,
    ctx.stats.brands && `${ctx.stats.brands} brand partners`,
    ctx.stats.countries && `${ctx.stats.countries} countries`,
  ].filter(Boolean);
  const description = `${STUDIO} is a fashion, jewellery and brand film production house in Kirti Nagar, New Delhi, founded in 2018 by ${FOUNDER}${statLine.length ? ` — ${statLine.join(', ')}` : ''}. Clients include ${clients.slice(0, 6).join(', ')}.`;
  const crumbs = breadcrumbs([{ name: 'Home', url: '/' }, { name: 'About', url: '/about/' }]);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${STUDIO}`,
    url: `${SITE_URL}/about/`,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
  };
  const hero = ctx.projects.find((p) => p.featured && p.thumbnail) || ctx.projects.find((p) => p.thumbnail);

  return `${head({
    title: `About — Fashion & Brand Film Production House, New Delhi | ${STUDIO}`,
    description: description.slice(0, 300),
    canonical: '/about/',
    image: hero && hero.thumbnail,
    extra: `${jsonLd(ld)}\n${crumbs.ld}`,
  })}
<body>
${topbar('about', ctx.categories)}
<main class="wrap">
  ${crumbs.html}
  <header class="intro">
    <p class="eyebrow">Studio · New Delhi · Since 2018</p>
    <h1>About ${STUDIO}</h1>
    ${about.map((p, i) => `<p${i === 0 ? ' class="lede"' : ''}>${esc(p)}</p>`).join('\n    ')}
  </header>
  ${statLine.length ? `<ul class="stats">${statLine.map((s) => { const [n, ...rest] = s.split(' '); return `<li><strong>${esc(n)}</strong> ${esc(rest.join(' '))}</li>`; }).join('')}</ul>` : ''}
  <section class="prose">
    <h2>Founder</h2>
    <p>${STUDIO} was founded in 2018 by director and cinematographer ${FOUNDER}. His work includes <a href="/work/max-urbn-alaya-f/">How New Is Your Now</a>, a campaign film for Max Urb_n with Alaya F, which he directed and shot.</p>
  </section>
  <section class="prose">
    <h2>What we make</h2>
    <p>${STUDIO} makes fashion campaigns, jewellery films, brand films, editorials, beauty campaigns, celebrity shoots, product films and reels for fashion, jewellery, beauty and lifestyle brands. Direction, production and post-production are handled in-house from the studio in Kirti Nagar, New Delhi.</p>
    <ul class="links">
      ${ctx.categories.map((c) => { const s = ctx.services.find((x) => clean(x.title).toLowerCase() === clean(c.service).toLowerCase()); return `<li><a href="/${c.slug}/">${esc(c.h1)}</a>${s && clean(s.description) ? ` — ${esc(clean(s.description))}` : ''}</li>`; }).join('\n      ')}
    </ul>
  </section>
  <section class="prose">
    <h2>Clients</h2>
    <p>${clients.map(esc).join(', ')}.</p>
  </section>
  <section class="prose">
    <h2>Work with us</h2>
    ${contactBlock(ctx.contact)}
  </section>
</main>
${footer(ctx.categories, ctx.contact)}
</body>
</html>
`;
}

function renderContact(ctx) {
  const c = ctx.contact;
  const description = `Contact ${STUDIO}, New Delhi: ${c.email} · ${c.phone} · ${c.address}. Fashion, jewellery and brand film production — enquiries answered within 24 hours.`;
  const crumbs = breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact/' }]);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${STUDIO}`,
    url: `${SITE_URL}/contact/`,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
  };

  return `${head({
    title: `Contact — ${STUDIO}, Kirti Nagar, New Delhi`,
    description: description.slice(0, 300),
    canonical: '/contact/',
    extra: `${jsonLd(ld)}\n${crumbs.ld}`,
  })}
<body>
${topbar('contact', ctx.categories)}
<main class="wrap">
  ${crumbs.html}
  <header class="intro">
    <p class="eyebrow">Transmit</p>
    <h1>Contact ${STUDIO}</h1>
    <p class="lede">Tell us about the film — the brand, the timeline and where it will run. We reply to every enquiry within 24 hours.</p>
  </header>
  <section class="prose">
    ${contactBlock(c)}
  </section>
  <section class="prose">
    <h2>What to send</h2>
    <p>A few lines on the brand and the product or collection, the kind of film you have in mind (campaign film, reels, product film, celebrity shoot), your timeline, and any references you like. Not sure yet? Browse <a href="/work/">our work</a> by category and point us to the films closest to what you need.</p>
    <p>You can also send a brief from the <a href="/">Cinema OS</a> — open Transmit on the homepage.</p>
  </section>
</main>
${footer(ctx.categories, ctx.contact)}
</body>
</html>
`;
}

/* ── entry point ─────────────────────────────────────── */

/**
 * Builds every page into dist/ and returns the URL list for the sitemap,
 * plus lookups the homepage SEO block uses for its links.
 */
function buildPages(dist, data) {
  const projects = data.projects.filter((p) => clean(p.title));
  assignSlugs(projects);

  const byCategory = new Map();
  for (const p of projects) {
    const key = clean(p.category) || 'Films';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(p);
  }
  const keys = [...byCategory.keys()].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const categories = keys.map((key) => {
    const c = categoryPage(key);
    return { key, ...c, short: c.h1.replace(/ Films$| Shoots$| Campaigns$/, '').replace('Fashion Campaign', 'Fashion').replace('Architecture & Corporate', 'Corporate').replace('Fashion & Brand Reels', 'Reels') };
  });

  // Two CMS projects can share a title (e.g. two "Amazon Beauty" reels);
  // give their <title>s a distinguishing suffix so no two pages match.
  const titleSuffix = new Map();
  const byTitle = new Map();
  for (const p of projects) {
    const k = clean(p.title).toLowerCase();
    if (!byTitle.has(k)) byTitle.set(k, []);
    byTitle.get(k).push(p);
  }
  for (const list of byTitle.values()) {
    if (list.length < 2) continue;
    for (const p of list) {
      const sameYear = list.filter((x) => x.year === p.year).length > 1;
      titleSuffix.set(p, ` (${[p.year, sameYear ? clean(p.duration) : ''].filter(Boolean).join(', ')})`);
    }
    // Still identical (same title, year and runtime — e.g. alternate cuts)? Number them.
    const base = new Map(list.map((p) => [p, titleSuffix.get(p)]));
    const seen = new Map();
    for (const p of list) {
      const sfx = base.get(p);
      const total = list.filter((x) => base.get(x) === sfx).length;
      if (total < 2) continue;
      const n = (seen.get(sfx) || 0) + 1;
      seen.set(sfx, n);
      titleSuffix.set(p, `${sfx.replace(/\)$/, '')}, cut ${n})`);
    }
  }

  // Archive stats from the CMS ("1000+ Projects" → stats.projects = "1,000+").
  const stat = (re) => {
    const s = ((data.archive && data.archive.stats) || []).find((x) => re.test(clean(x.label)));
    return s ? clean(s.value).replace(/^(\d)(\d{3})/, '$1,$2') : '';
  };
  const stats = { projects: stat(/^projects$/i), brands: stat(/brand/i), countries: stat(/countr/i) };

  const ctx = { projects, services: data.services || [], byCategory, categories, titleSuffix, contact: data.contact, archive: data.archive || {}, stats };
  const write = (rel, html) => {
    const file = path.join(dist, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  };

  const urls = [];
  write('work', renderWorkIndex(ctx));
  urls.push({ loc: '/work/', lastmod: latest(projects) });
  write('about', renderAbout(ctx));
  urls.push({ loc: '/about/', lastmod: latest(projects) });
  write('contact', renderContact(ctx));
  urls.push({ loc: '/contact/', lastmod: latest(projects) });

  for (const c of categories) {
    const list = byCategory.get(c.key);
    write(c.slug, renderCategory(c, list, ctx));
    urls.push({ loc: `/${c.slug}/`, lastmod: latest(list) });
  }
  for (const p of projects) {
    write(path.join('work', p._slug), renderProject(p, ctx));
    urls.push({ loc: p._url, lastmod: p.updated_at || p.created_at, project: p });
  }

  return { urls, categories, categoryUrl: (cat) => `/${categoryPage(cat).slug}/` };
}

function latest(list) {
  return list.map((p) => p.updated_at || p.created_at).filter(Boolean).sort().pop();
}

module.exports = { buildPages, categoryPage, PROFILES, FOUNDER };
