const FALLBACK_COUNT = 6; // .n1–.n6 / .p1–.p6 gradient classes exist in css/modes.css

export function buildArchive() {
  // Intentionally a no-op now — populated by applyArchiveContent() once
  // page_content + archive_items load (see app.js). Kept as a named
  // export so core.js's init() call site doesn't need to change.
}

/**
 * Applies CMS-driven content (page_content: archive/content) and the
 * archive_items list to the Archive page.
 */
export function applyArchiveContent(content = {}, items = []) {
  renderContactSheet(items);
  renderDesk(content);
  renderClapper(content);
  renderAboutPanel(content);
}

function renderContactSheet(items) {
  const csGrid = document.getElementById('cs-grid');
  if (!csGrid) return;

  csGrid.innerHTML = '';
  items.forEach((item, i) => {
    const m = item.metadata || {};
    const neg = document.createElement('div');
    neg.className = 'neg';

    const negLayer = document.createElement('div');
    negLayer.className = `neg-neg n${(i % FALLBACK_COUNT) + 1}`;

    const posLayer = document.createElement('div');
    if (item.imageUrl) {
      posLayer.className = 'neg-pos';
      posLayer.style.backgroundImage = `url("${item.imageUrl}")`;
      posLayer.style.backgroundSize = 'cover';
      posLayer.style.backgroundPosition = 'center';
    } else {
      posLayer.className = `neg-pos p${(i % FALLBACK_COUNT) + 1}`;
    }

    neg.appendChild(negLayer);
    neg.appendChild(posLayer);

    const info = document.createElement('div');
    info.className = 'neg-info';
    info.innerHTML = `
      ${m.lens ? `<div class="ni"><span>Lens</span> ${m.lens}</div>` : ''}
      ${m.location ? `<div class="ni"><span>Location</span> ${m.location}</div>` : ''}
      ${m.asa ? `<div class="ni"><span>ASA</span> ${m.asa}${m.shutter ? ` · <span>${m.shutter}</span>` : ''}</div>` : ''}`;
    neg.appendChild(info);

    const num = document.createElement('div');
    num.className = 'neg-num';
    num.textContent = item.title || '';
    neg.appendChild(num);

    csGrid.appendChild(neg);
  });
}

function renderDesk(content) {
  const deskEl = document.getElementById('desk-items');
  if (!deskEl) return;

  deskEl.innerHTML = '';
  [
    ['Director · DP', content.director],
    ['Primary Camera', content.camera],
    ['Lenses', content.lenses],
    ['Grade Suite', content.grade_suite],
  ].forEach(([label, value]) => {
    if (!value) return;
    const c = document.createElement('div');
    c.className = 'desk-c';
    c.innerHTML = `<div class="dc-l">${label}</div><div class="dc-v">${value}</div>`;
    deskEl.appendChild(c);
  });
}

function renderClapper(content) {
  setText('cf-production', content.production_name);
  setText('cf-director', content.director);
  setText('cf-scene', content.scene);
  setText('cf-take', content.take);
}

function renderAboutPanel(content) {
  const h = document.getElementById('ap-h');
  if (h) {
    h.textContent = '';
    if (content.about_headline_prefix) h.appendChild(document.createTextNode(`${content.about_headline_prefix} `));
    if (content.about_headline_bold) {
      const strong = document.createElement('strong');
      strong.textContent = content.about_headline_bold;
      h.appendChild(strong);
    }
    if (content.about_headline_line2) {
      h.appendChild(document.createElement('br'));
      h.appendChild(document.createTextNode(content.about_headline_line2));
    }
    if (content.about_headline_line3) {
      h.appendChild(document.createElement('br'));
      h.appendChild(document.createTextNode(content.about_headline_line3));
    }
  }

  setText('ap-b1', content.studio_description_1);
  setText('ap-b2', content.studio_description_2);
  setText('ap-footer', content.footer_text);

  const statsEl = document.getElementById('ap-stats');
  if (statsEl) {
    statsEl.innerHTML = '';
    (content.stats || []).forEach(s => {
      const c = document.createElement('div');
      c.className = 'ap-stat';
      c.innerHTML = `<div class="as-n">${s.value}</div><div class="as-l">${s.label}</div>`;
      statsEl.appendChild(c);
    });
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}
