/**
 * Renders the Lens Cabinet from real service data. The decorative
 * "lens optic" graphic (rings + focal number) stays exactly as-is by
 * default; a real image/video is shown as a backdrop behind it when
 * set, and an icon renders as a small badge — none of that existing
 * decoration is removed, only enriched when content is provided.
 */
export function buildLenses(services = []) {
  const shelf = document.getElementById('lens-shelf');
  if (!shelf) return;

  shelf.innerHTML = '';

  services.forEach(l => {
    const specs = l.specs || {};
    const deliverables = Array.isArray(specs.deliverables) ? specs.deliverables : [];

    const d = document.createElement('div');
    d.className = 'lens-card';

    let mediaHtml = '';
    if (l.videoUrl) {
      mediaHtml = `<video class="lens-vis-media" src="${l.videoUrl}" autoplay muted loop playsinline></video>`;
    } else if (l.imageUrl) {
      mediaHtml = `<img class="lens-vis-media" src="${l.imageUrl}" alt="" />`;
    }

    const iconHtml = l.iconUrl ? `<div class="lens-icon-badge"><img src="${l.iconUrl}" alt="" /></div>` : '';

    d.innerHTML = `
      <div class="lens-vis">
        ${mediaHtml}
        ${iconHtml}
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
  });

  if (!services.length) {
    const empty = document.createElement('p');
    empty.className = 'lens-empty';
    empty.textContent = 'No services published yet.';
    shelf.appendChild(empty);
  }
}
