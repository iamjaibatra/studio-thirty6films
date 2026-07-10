/**
 * STUDIO THIRTY6 — CONTENT LAYER
 * ─────────────────────────────────────────────────────
 * Edit this file to update site copy (services, studio info, boot
 * messages). Projects are no longer edited here — add/edit/publish
 * them from the Studio Thirty6 OS CMS; this site fetches published
 * projects live from Supabase at load time (js/modules/data-loader.js).
 * ─────────────────────────────────────────────────────
 */

window.T36 = window.T36 || {};

/* ── PROJECTS ───────────────────────────────────────────
 * Populated at runtime from Supabase — see
 * js/modules/data-loader.js and js/app.js (loadProjects()).
 * This used to be a hardcoded array of mock projects; that's been
 * removed in favor of the live `projects` table (published = true).
 * ──────────────────────────────────────────────────────── */
T36.PROJECTS = [];

/* ── SERVICES (LENS CABINET) ────────────────────────── */
/* ── SERVICES ───────────────────────────────────────────
 * Populated at runtime from Supabase — see
 * js/modules/lenses.js and js/app.js (loadServices()).
 * ──────────────────────────────────────────────────────── */
T36.SERVICES = [];

/* ── STUDIO INFO ────────────────────────────────────── */
T36.STUDIO = {
  name: 'Studio Thirty6',
  director: 'Gimmy Kohli',
  location: 'New Delhi, India',
  founded: 2018,
  email: 'hello@studiothirty6.com',
  instagram: 'https://instagram.com/studiothirty6_films',
  vimeo: 'https://vimeo.com/user50115456',
  phone: '+91 9999221822',

  // Stats — update as portfolio grows
  stats: [
    { value: '72',   label: 'Projects' },
    { value: '6',    label: 'Countries' },
    { value: '180+', label: 'Shoot Days' },
    { value: '36',   label: 'Brand Partners' },
  ],

  // Process stages — edit titles/descriptions freely
  process: [
    { title: 'Brief',       desc: 'We listen before proposing. Brand language, audience, singular objective.' },
    { title: 'Research',    desc: 'Reference deep-dives. Visual precedents. What has been done — and what has not.' },
    { title: 'Treatment',   desc: 'Tone, pacing, lenses, light, locations — written and visual document.' },
    { title: 'Storyboard',  desc: 'Frame-by-frame composition. Shot list locked. Lighting finalised.' },
    { title: 'Production',  desc: 'On set. Camera, light, sound. Planning meets reality.' },
    { title: 'Edit',        desc: 'Assembly → rough → fine cut. Story, pacing, rhythm.' },
    { title: 'Grade',       desc: 'Custom grade built for the project. Colour is the final creative decision.' },
    { title: 'Sound',       desc: 'Music, design, foley, dialogue mix. The last 50% of the experience.' },
    { title: 'Delivery',    desc: 'All formats. All platforms. Delivered and documented.' },
  ],

  // Archive contact sheet — film negative descriptions
  archive: [
    { neg: 'n1', pos: 'p1', num: '36A', lens: '50mm T2.1',    location: 'New Delhi',  asa: '800',  shutter: '1/50s' },
    { neg: 'n2', pos: 'p2', num: '37A', lens: '24mm T1.5',    location: 'Mumbai',     asa: '1600', shutter: '1/48s' },
    { neg: 'n3', pos: 'p3', num: '38A', lens: '85mm T1.4',    location: 'Jaipur',     asa: '3200', shutter: '1/50s' },
    { neg: 'n4', pos: 'p4', num: '39A', lens: '35mm T1.5',    location: 'Udaipur',    asa: '400',  shutter: '1/50s' },
    { neg: 'n5', pos: 'p5', num: '40A', lens: '100mm Macro',  location: 'New Delhi',  asa: '200',  shutter: '1/50s' },
    { neg: 'n6', pos: 'p6', num: '41A', lens: '135mm T2',     location: 'Bangkok',    asa: '800',  shutter: '1/48s' },
  ],
};

/* ── BOOT MESSAGES (randomised each visit) ──────────── */
T36.BOOT_SEQUENCES = [
  [
    'Sensor calibration',
    'Storage · 256 GB verified',
    'Loading grade profile',
    'White balance · 5600K',
    'Stabilisation · active',
  ],
  [
    'Sensor temperature · 36°C',
    'Media verified · 2.4 TB free',
    'Codec engine · initialising',
    'LUT loaded · Thirty6 Custom',
    'Waveform engine · ready',
  ],
  [
    'Calibrating colour science',
    'CFexpress · read speed 1.7 GB/s',
    'Frame rate · 24p locked',
    'Noise reduction · adaptive',
    'System ready',
  ],
  [
    'Powering imaging pipeline',
    'Archive · 72 projects indexed',
    'Grade profile · Log-C→Rec709',
    'Audio · 32-bit float',
    'Live view · active',
  ],
];
