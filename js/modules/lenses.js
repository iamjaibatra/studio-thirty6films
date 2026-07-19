import { ICON_PLAY } from './icons.js';

/**
 * Renders the Lens Cabinet from real service data. The decorative
 * "lens optic" graphic (rings + focal number) stays exactly as-is by
 * default; a real image/video is shown as a backdrop behind it when
 * set, and an icon renders as a small badge — none of that existing
 * decoration is removed, only enriched when content is provided.
 */
export function buildLenses(services = [], app) {
  const shelf = document.getElementById('lens-shelf');
  if (!shelf) return;

  shelf.innerHTML = '';

  services.forEach(l => {
    const specs = l.specs || {};
    const deliverables = Array.isArray(specs.deliverables) ? specs.deliverables : [];
    const hasVideo = Boolean(l.videoUrl);

    const d = document.createElement('div');
    d.className = hasVideo ? 'lens-card has-video' : 'lens-card';

    let mediaHtml = '';
    if (hasVideo) {
      // preload="metadata" + an explicit poster (when available) ensures
      // something correct is visible even if a mobile browser's autoplay
      // policy blocks playback of several simultaneous videos — without
      // this, a blocked autoplay can render as a blank/black square that
      // looks like the card has no media at all.
      const posterAttr = l.imageUrl ? ` poster="${l.imageUrl}"` : '';
      mediaHtml = `<video class="lens-vis-media" src="${l.videoUrl}"${posterAttr} autoplay muted loop playsinline preload="metadata"></video>`;
    } else if (l.imageUrl) {
      mediaHtml = `<img class="lens-vis-media" src="${l.imageUrl}" alt="" />`;
    }

    const iconHtml = l.iconUrl ? `<div class="lens-icon-badge"><img src="${l.iconUrl}" alt="" /></div>` : '';
    const playHintHtml = hasVideo ? `<div class="lens-play-hint">${ICON_PLAY}</div>` : '';

    d.innerHTML = `
      <div class="lens-vis">
        ${mediaHtml}
        ${iconHtml}
        ${playHintHtml}
        <div class="l-flare"></div><div class="l-gloss"></div>
        <div class="lens-optic">
          <div class="lo"></div><div class="lo"></div>
          <div class="lo"></div><div class="lo"></div>
          <div class="lo-c"><span class="lo-f">${specs.focal || ''}</span></div>
        </div>
      </div>
      <div class="lens-body">
        <div class="lb-sp">${specs.aperture_spec || ''}</div>
        <div class="lb-ti">${l.title || ''}</div>
        <div class="lb-de">${l.description || ''}</div>
        <div class="lb-mt">
          <div class="lm">Format<br><span>${specs.format || '—'}</span></div>
          <div class="lm">Duration<br><span>${l.duration || '—'}</span></div>
          <div class="lm">DOF<br><span>${specs.dof || '—'}</span></div>
        </div>
        ${deliverables.length ? `<div class="lb-dl">${deliverables.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
        ${l.price ? `<div class="lb-price">${l.price}</div>` : ''}
      </div>`;
    shelf.appendChild(d);

    if (hasVideo) {
      // Explicit play() call as well as the autoplay attribute — belt and
      // suspenders for browsers that are stricter about attribute-only
      // autoplay, especially with several videos on screen at once.
      const videoEl = d.querySelector('video');
      videoEl?.play().catch(() => {});

      if (app) {
        d.querySelector('.lens-vis').addEventListener('click', () => {
          app.openLightbox({ title: l.title, videoUrl: l.videoUrl });
        });
      }
    }
  });

  if (!services.length) {
    const empty = document.createElement('p');
    empty.className = 'lens-empty';
    empty.textContent = 'No services published yet.';
    shelf.appendChild(empty);
  }
}
