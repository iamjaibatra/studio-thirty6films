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

/* Note: a T36.STUDIO object with studio contact info, stats, process
 * stages, and archive contact-sheet data used to live here. All of that
 * content has since moved to Supabase (page_content, timeline_stages,
 * archive_items — see archive.js and edit.js) and nothing in the
 * codebase referenced T36.STUDIO anymore, so it's been removed rather
 * than left as unused dead weight. */

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
