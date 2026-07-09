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
T36.SERVICES = [
  {
    focal: '24',
    spec: 'T1.5 · Ultra-wide',
    title: 'Brand Films',
    description: 'Wide environmental storytelling. The brand inside a world the audience wants to inhabit.',
    deliverables: ['Brand manifesto film', 'Campaign cutdowns', 'Social adaptations'],
    duration: '60s – 5min',
    format: '4K · ProRes',
    dof: 'Deep',
  },
  {
    focal: '35',
    spec: 'T1.5 · Classic',
    title: 'Founder Stories',
    description: 'Intimate enough to feel close. Wide enough for context. Honest and human.',
    deliverables: ['Founder documentary', 'Behind the brand', 'Long-form narrative'],
    duration: '3 – 15min',
    format: '4K · RAW',
    dof: 'Natural',
  },
  {
    focal: '50',
    spec: 'T1.2 · Standard',
    title: 'Fashion Campaigns',
    description: 'Human-eye perspective. The lens that sees what the audience sees — and makes it aspirational.',
    deliverables: ['Seasonal campaign film', 'Lookbook video', 'Editorial motion'],
    duration: '2 – 6min',
    format: '4K · Log-C',
    dof: 'Selective',
  },
  {
    focal: '85',
    spec: 'T1.4 · Portrait',
    title: 'Documentary',
    description: 'Compression that creates intimacy. For stories about people — their truth, their world.',
    deliverables: ['Character documentary', 'Process film', 'Archive project'],
    duration: '10 – 60min',
    format: '4K · RAW',
    dof: 'Shallow',
  },
  {
    focal: '100',
    spec: 'T2.8 · Macro',
    title: 'Jewellery Films',
    description: 'Every grain of metal. Every edge of stone. A love letter to craft at 1:1 reproduction.',
    deliverables: ['Product hero film', 'Craft series', 'E-commerce video'],
    duration: '90s – 4min',
    format: 'ProRes 4444',
    dof: 'Extreme',
  },
  {
    focal: '70–200',
    spec: 'T2.8 · Telephoto',
    title: 'Event Coverage',
    description: 'Distance becomes intimacy. Reaches across a room and makes a stranger look like a subject.',
    deliverables: ['Event highlight', 'Gala coverage', 'Fashion week film'],
    duration: '3 – 20min',
    format: '4K · H.265',
    dof: 'Compressed',
  },
];

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
