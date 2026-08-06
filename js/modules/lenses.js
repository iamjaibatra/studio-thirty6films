import { ICON_PLAY } from './icons.js';
import { slugify } from './data-loader.js';

/**
 * Lens Cabinet — one card per project CATEGORY (not per "service" as in
 * earlier versions of this page). Each card shows a representative video
 * from a real published project in that category (the first one, in the
 * site's existing display order); categories with no projects yet still
 * get a card (per explicit request — "make sure lenses page has all
 * categories"), just with the decorative fallback instead of real media.
 * Clicking a card navigates to Playback filtered to that category.
 *
 * @param {Array} categories - from loadCategories(): [{ id, name, color }]
 * @param {Array} projects - from loadProjects(), already fetched/ordered
 *   elsewhere in the parallel fetch — reused here to avoid a second
 *   network round-trip just to find one representative clip per category.
 * @param {object} app - CinemaOS, for navigating to Playback on click.
 */
export function buildLenses(categories = [], projects = [], app) {
  const shelf = document.getElementById('lens-shelf');
  if (!shelf) return;

  shelf.innerHTML = '';

  categories.forEach(cat => {
    const slug = slugify(cat.name);
    const repProject = projects.find(p => p.categorySlug === slug);
    const hasVideo = Boolean(repProject?.video);

    const d = document.createElement('div');
    d.className = hasVideo ? 'lens-card has-video' : 'lens-card';

    let mediaHtml = '';
    if (hasVideo) {
      const posterAttr = repProject.thumbnail ? ` poster="${repProject.thumbnail}"` : '';
      mediaHtml = `<video class="lens-vis-media" src="${repProject.video}"${posterAttr} autoplay muted loop playsinline preload="metadata"></video>`;
    } else if (repProject?.thumbnail) {
      mediaHtml = `<img class="lens-vis-media" src="${repProject.thumbnail}" alt="" />`;
    }

    const playHintHtml = hasVideo ? `<div class="lens-play-hint">${ICON_PLAY}</div>` : '';
    const projectCount = projects.filter(p => p.categorySlug === slug).length;

    d.innerHTML = `
      <div class="lens-vis">
        ${mediaHtml}
        ${playHintHtml}
        <div class="l-flare"></div><div class="l-gloss"></div>
        <div class="lens-optic">
          <div class="lo"></div><div class="lo"></div>
          <div class="lo"></div><div class="lo"></div>
          <div class="lo-c"><span class="lo-f" style="color:${cat.color || 'inherit'}">${projectCount || ''}</span></div>
        </div>
      </div>
      <div class="lens-body">
        <div class="lb-sp" style="color:${cat.color || 'var(--t3)'}">Category</div>
        <div class="lb-ti">${cat.name}</div>
        <div class="lb-de">${projectCount ? `${projectCount} project${projectCount === 1 ? '' : 's'}` : 'No projects yet'}</div>
      </div>`;
    shelf.appendChild(d);

    if (hasVideo) {
      const videoEl = d.querySelector('video');
      videoEl?.play().catch(() => {});
    }

    if (app) {
      d.addEventListener('click', () => {
        app.switchMode(1); // Playback
        // The filter pills are (re)built each time Playback's project
        // grid renders; give it a beat to exist before clicking one.
        setTimeout(() => {
          const pill = document.querySelector(`.pf[data-f="${slug}"]`);
          pill?.click();
        }, 50);
      });
    }
  });

  if (!categories.length) {
    const empty = document.createElement('p');
    empty.className = 'lens-empty';
    empty.textContent = 'No categories yet.';
    shelf.appendChild(empty);
    return;
  }

  applyLensVisHeights();
  window.removeEventListener('resize', applyLensVisHeights);
  window.addEventListener('resize', applyLensVisHeights, { passive: true });
}

/**
 * Sets each .lens-vis box's height explicitly, in px, to match its own
 * actual rendered width (1:1 square) — see the comment on .lens-vis in
 * css/modes.css for why this is done in JS rather than via CSS
 * aspect-ratio or padding-percentage.
 */
function applyLensVisHeights() {
  document.querySelectorAll('.lens-vis').forEach(el => {
    const width = el.getBoundingClientRect().width;
    if (width > 0) el.style.height = `${width}px`;
  });
}
