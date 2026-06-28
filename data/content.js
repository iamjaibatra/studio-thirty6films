/**
 * STUDIO THIRTY6 — CONTENT LAYER
 * ─────────────────────────────────────────────────────
 * Edit this file to update all site content.
 * No code changes needed to add/remove projects or services.
 *
 * To add a new project:
 *   1. Add an object to PROJECTS array below.
 *   2. Add a matching CSS class (e.g. ".s9") to css/stills.css
 *      — or drop a real <video> src in the "video" field.
 *   Done. The site rebuilds itself automatically.
 * ─────────────────────────────────────────────────────
 */

window.T36 = window.T36 || {};

/* ── PROJECTS ───────────────────────────────────────── */
T36.PROJECTS = [
  {
    id: 1,
    slug: 'goldmine',
    title: 'Goldmine',
    subtitle: 'Jewellery Campaign',
    client: 'Goldmine Jewels',
    category: 'jewellery',         // fashion | jewellery | campaign | film | social
    still: 's1',                   // CSS class for gradient still — replace src with real image/video path
    video: null,                   // Set to '/assets/goldmine.mp4' when ready
    poster: null,                  // '/assets/goldmine-poster.jpg'
    lens: '100mm Macro',
    camera: 'Thirty6 OS · FX-1',
    fps: '48p',
    duration: '03:24',
    codec: 'ProRes 4444',
    format: '4K',
    year: 2024,
    featured: true,
  },
  {
    id: 2,
    slug: 'aavaran',
    title: 'Aavaran',
    subtitle: 'Fashion Film',
    client: 'Aavaran Studio',
    category: 'fashion',
    still: 's2',
    video: null,
    poster: null,
    lens: '50mm',
    camera: 'Thirty6 OS · FX-1',
    fps: '24p',
    duration: '02:47',
    codec: 'Log-C RAW',
    format: '4K',
    year: 2024,
    featured: true,
  },
  {
    id: 3,
    slug: 'nykaa-tvc',
    title: 'Nykaa',
    subtitle: 'TVC · 30s',
    client: 'Nykaa',
    category: 'campaign',
    still: 's3',
    video: null,
    poster: null,
    lens: '16mm',
    camera: 'Thirty6 OS · FX-1',
    fps: '25p',
    duration: '00:30',
    codec: '4K ProRes',
    format: '4K',
    year: 2024,
    featured: false,
  },
  {
    id: 4,
    slug: 'pallavi',
    title: 'Pallavi',
    subtitle: 'Short Film',
    client: 'Independent',
    category: 'film',
    still: 's4',
    video: null,
    poster: null,
    lens: '35mm',
    camera: 'Thirty6 OS · MX-2',
    fps: '24p',
    duration: '08:12',
    codec: 'RAW 6K',
    format: '6K',
    year: 2023,
    featured: true,
  },
  {
    id: 5,
    slug: 'house-of-masaba',
    title: 'House of Masaba',
    subtitle: 'Lookbook Film',
    client: 'House of Masaba',
    category: 'fashion',
    still: 's5',
    video: null,
    poster: null,
    lens: '85mm',
    camera: 'Thirty6 OS · FX-1',
    fps: '24p',
    duration: '04:11',
    codec: 'Log-C 4K',
    format: '4K',
    year: 2024,
    featured: true,
  },
  {
    id: 6,
    slug: 'good-glamm',
    title: 'Good Glamm',
    subtitle: 'Brand Film',
    client: 'Good Glamm Group',
    category: 'campaign',
    still: 's6',
    video: null,
    poster: null,
    lens: '24mm',
    camera: 'Thirty6 OS · FX-1',
    fps: '30p',
    duration: '01:00',
    codec: '4K H.265',
    format: '4K',
    year: 2023,
    featured: false,
  },
  {
    id: 7,
    slug: 'rare-rabbit',
    title: 'Rare Rabbit',
    subtitle: 'Social · S01',
    client: 'Rare Rabbit',
    category: 'social',
    still: 's7',
    video: null,
    poster: null,
    lens: '35mm',
    camera: 'Thirty6 OS · FX-1',
    fps: '24p',
    duration: '00:45',
    codec: '4K ProRes',
    format: '4K · 9:16',
    year: 2024,
    featured: false,
  },
  {
    id: 8,
    slug: 'tanishq',
    title: 'Tanishq',
    subtitle: 'Product Series',
    client: 'Tanishq',
    category: 'jewellery',
    still: 's8',
    video: null,
    poster: null,
    lens: '100mm Macro',
    camera: 'Thirty6 OS · FX-1',
    fps: '48p',
    duration: '03:55',
    codec: 'ProRes 4444',
    format: '4K',
    year: 2024,
    featured: true,
  },
];

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
