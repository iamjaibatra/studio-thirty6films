import { loadProjectGallery } from './data-loader.js';
import { ICON_PLAY, ICON_PAUSE } from './icons.js';

function applyStill(el, p, { crop = true } = {}) {
  if (p.thumbnail) {
    el.style.backgroundImage = `url("${p.thumbnail}")`;
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';

    if (!crop) {
      // Grid thumbnails: only letterbox when the source image's own aspect
      // ratio is genuinely far from the card's 16:9 box (logos, portraits,
      // square graphics). Photography that's already close to 16:9 uses
      // cover instead — cropping a few percent off a photo is invisible,
      // but letterbox bars on every card (even ones that don't need them)
      // read as visual noise/false "overlap" between rows.
      el.style.backgroundSize = 'cover';
      el.style.backgroundColor = 'var(--panel)';
      const img = new Image();
      img.onload = () => {
        const cardRatio = 16 / 9;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const mismatch = Math.abs(imgRatio - cardRatio) / cardRatio;
        if (mismatch > 0.25) {
          el.style.backgroundSize = 'contain';
        }
      };
      img.src = p.thumbnail;
    } else {
      el.style.backgroundSize = 'cover';
    }
  } else if (p.still) {
    el.classList.add(p.still);
  }
}

function buildFilters(projects) {
  const bar = document.getElementById('pb-filters');
  if (!bar) return;

  const seen = new Map();
  projects.forEach(p => {
    if (!seen.has(p.categorySlug)) seen.set(p.categorySlug, p.category);
  });

  const hasFeatured = projects.some(p => p.featured);

  bar.innerHTML = '';
  bar.appendChild(makeFilterButton('all', 'All', true));
  if (hasFeatured) bar.appendChild(makeFilterButton('featured', 'Featured', false));
  [...seen.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([slug, label]) => bar.appendChild(makeFilterButton(slug, label, false)));
}

function makeFilterButton(value, label, active) {
  const btn = document.createElement('button');
  btn.className = active ? 'pf on' : 'pf';
  btn.dataset.f = value;
  btn.textContent = label;
  return btn;
}

function renderEmptyState(grid) {
  const empty = document.createElement('div');
  empty.className = 'pb-empty';
  empty.setAttribute('role', 'status');
  empty.style.cssText =
    'grid-column:1/-1;display:flex;align-items:center;justify-content:center;' +
    'min-height:240px;font-family:"JetBrains Mono",monospace;font-size:11px;' +
    'letter-spacing:.05em;color:var(--t3);text-transform:uppercase;';
  empty.textContent = 'No productions published yet — check back soon.';
  grid.appendChild(empty);
}

export function initPlayback(app) {
  const grid = document.getElementById('pb-grid');
  if (!grid || !window.T36?.PROJECTS) return;

  const projects = window.T36.PROJECTS;

  const countEl = document.getElementById('pb-count');
  if (countEl) {
    countEl.textContent = projects.length
      ? `${projects.length} CLIP${projects.length === 1 ? '' : 'S'}`
      : '0 CLIPS';
  }

  buildFilters(projects);

  if (!projects.length) {
    renderEmptyState(grid);
    return;
  }

  const scheduleIdle = callback => {
    if (typeof window.requestIdleCallback === 'function') {
      return window.requestIdleCallback(callback);
    }
    return window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
  };

  projects.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'clip';
    applyStill(d, p, { crop: false });
    d.dataset.cat = p.categorySlug;
    d.dataset.featured = p.featured ? '1' : '0';
    d.dataset.idx = i;
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.innerHTML = `
      <div class="clip-grain"></div>
      <div class="clip-idx">${String(i + 1).padStart(3, '0')}</div>
      <div class="clip-tc">${p.duration}</div>
      <div class="clip-ov"><div class="clip-play"><svg viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12"/></svg></div></div>
      <div class="clip-wv" id="cw${i}"></div>
      <div class="clip-meta">
        <span class="clip-title">${p.title}</span>
        <span class="clip-spec">${p.spec}</span>
      </div>`;

    if (p.hoverVideo) {
      const vid = document.createElement('video');
      vid.src = p.hoverVideo;
      vid.poster = p.poster || '';
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = 'none';
      d.appendChild(vid);

      const io = typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                vid.preload = 'metadata';
                io.unobserve(d);
              }
            });
          }, { rootMargin: '200px' })
        : null;
      if (io) {
        io.observe(d);
      } else {
        vid.preload = 'metadata';
      }

      d.addEventListener('mouseenter', () => {
        vid.play().catch(() => {});
      });
      d.addEventListener('mouseleave', () => {
        vid.pause();
        vid.currentTime = 0;
      });
    }

    scheduleIdle(() => {
      const wv = document.getElementById(`cw${i}`);
      if (!wv) return;
      const frag = document.createDocumentFragment();
      for (let j = 0; j < 44; j++) {
        const b = document.createElement('div');
        b.className = 'wvb';
        b.style.height = `${Math.random() * 70 + 10}%`;
        frag.appendChild(b);
      }
      wv.appendChild(frag);
    });

    d.addEventListener('mouseenter', () => {
      const psFile = document.getElementById('ps-file');
      if (psFile) psFile.textContent = String(i + 1).padStart(3, '0');
    });
    d.addEventListener('click', () => app.openClip(i));
    d.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') app.openClip(i);
    });
    grid.appendChild(d);
  });

  document.getElementById('pb-filters')?.addEventListener('click', e => {
    const btn = e.target.closest('.pf');
    if (!btn) return;

    document.querySelectorAll('.pf').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');

    const f = btn.dataset.f;
    document.querySelectorAll('.clip').forEach(c => {
      const show = f === 'all' || (f === 'featured' ? c.dataset.featured === '1' : c.dataset.cat === f);
      c.style.opacity = show ? '1' : '0.12';
      c.style.pointerEvents = show ? 'all' : 'none';
      c.style.transition = 'opacity .18s';
    });
  });

  document.getElementById('fp-close')?.addEventListener('click', () => app.closeClip());
  document.getElementById('fp-info')?.addEventListener('click', () => {
    document.getElementById('fp-info-panel')?.classList.toggle('on');
  });
  document.getElementById('fp-play')?.addEventListener('click', () => app.togglePlay());
  document.getElementById('fp-next')?.addEventListener('click', () => app.openClip((app.S.playClip + 1) % window.T36.PROJECTS.length));
  document.getElementById('fp-prev')?.addEventListener('click', () => app.openClip((app.S.playClip - 1 + window.T36.PROJECTS.length) % window.T36.PROJECTS.length));
  document.getElementById('fp-prog')?.addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    app.S.playProg = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const fill = document.getElementById('fp-fill');
    if (fill) fill.style.width = `${app.S.playProg * 100}%`;

    const vid = document.getElementById('fp')?.querySelector('video');
    if (vid && vid.duration) {
      vid.currentTime = app.S.playProg * vid.duration;
    }
  });

  document.getElementById('fp-back')?.addEventListener('click', () => seekRelative(app, -10));
  document.getElementById('fp-fwd')?.addEventListener('click', () => seekRelative(app, 10));

  const fpEl = document.getElementById('fp');
  fpEl?.addEventListener('mousemove', resetTitleIdleTimer);
  fpEl?.addEventListener('touchstart', resetTitleIdleTimer, { passive: true });
}

let titleIdleTimer = null;

function seekRelative(app, deltaSeconds) {
  const vid = document.getElementById('fp')?.querySelector('video');

  if (vid && vid.duration) {
    vid.currentTime = Math.max(0, Math.min(vid.duration, vid.currentTime + deltaSeconds));
  } else {
    app.S.playProg = Math.max(0, Math.min(1, app.S.playProg + deltaSeconds * 0.01));
    const fill = document.getElementById('fp-fill');
    if (fill) fill.style.width = `${app.S.playProg * 100}%`;
  }
}

/** Shows the fullscreen title and restarts the ~1s countdown before it fades again. */
function resetTitleIdleTimer() {
  clearTimeout(titleIdleTimer);
  document.getElementById('fp-title')?.classList.remove('fp-idle');
  titleIdleTimer = setTimeout(() => {
    document.getElementById('fp-title')?.classList.add('fp-idle');
  }, 1000);
}

export function openClip(app, idx) {
  const p = window.T36.PROJECTS[idx];
  if (!p) return;

  app.S.playClip = idx;
  app.S.playing = true;
  setProjectNavVisible(true);

  const fp = document.getElementById('fp');
  if (!fp) return;
  fp.classList.add('on');

  const fpBg = document.getElementById('fp-bg');
  if (fpBg) {
    fpBg.className = 'fp-bg';
    fpBg.style.backgroundImage = '';
    applyStill(fpBg, p);
  }

  if (p.video) {
    let vid = fp.querySelector('video');
    if (!vid) {
      vid = document.createElement('video');
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1;';
      fp.querySelector('.fp-scr').appendChild(vid);
    }
    vid.src = p.video;
    vid.muted = false;
    vid.loop = true;
    vid.play().catch(() => {});
  }

  const title = document.getElementById('fp-title');
  if (title) title.textContent = p.title;
  resetTitleIdleTimer();

  const playBtn = document.getElementById('fp-play');
  if (playBtn) playBtn.innerHTML = ICON_PAUSE;

  document.getElementById('fp-info-panel')?.classList.remove('on');
  renderCredits(p.credits);
  loadProjectGallery(p.id).then(renderGallery).catch(() => renderGallery([]));

  app.startPlay();
}

function setProjectNavVisible(visible) {
  const display = visible ? '' : 'none';
  const prev = document.getElementById('fp-prev');
  const next = document.getElementById('fp-next');
  if (prev) prev.style.display = display;
  if (next) next.style.display = display;
}

/**
 * Opens a standalone video in the same fullscreen player used for
 * projects (Lenses service videos) — reuses the existing #fp overlay
 * rather than introducing a separate lightbox UI. Prev/next (which only
 * make sense for the projects list) are hidden, and the credits/gallery
 * panel is empty since a service isn't a project.
 */
export function openLightbox(app, { title, videoUrl }) {
  if (!videoUrl) return;

  const fp = document.getElementById('fp');
  if (!fp) return;
  fp.classList.add('on');

  app.S.playClip = null;
  app.S.playing = true;
  setProjectNavVisible(false);

  const fpBg = document.getElementById('fp-bg');
  if (fpBg) {
    fpBg.className = 'fp-bg';
    fpBg.style.backgroundImage = '';
  }

  let vid = fp.querySelector('video');
  if (!vid) {
    vid = document.createElement('video');
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1;';
    fp.querySelector('.fp-scr').appendChild(vid);
  }
  vid.src = videoUrl;
  vid.muted = false;
  vid.loop = true;
  vid.play().catch(() => {});

  const titleEl = document.getElementById('fp-title');
  if (titleEl) titleEl.textContent = title || '';
  resetTitleIdleTimer();

  const playBtn = document.getElementById('fp-play');
  if (playBtn) playBtn.innerHTML = ICON_PAUSE;

  document.getElementById('fp-info-panel')?.classList.remove('on');
  renderCredits([]);
  renderGallery([]);

  app.startPlay();
}

function renderCredits(credits) {
  const el = document.getElementById('fp-credits');
  const section = document.getElementById('fp-credits-section');
  if (!el || !section) return;

  el.innerHTML = '';
  if (!credits || !credits.length) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  credits.forEach(c => {
    if (!c.role && !c.name) return;
    const span = document.createElement('span');
    span.innerHTML = `<span class="role">${c.role || ''}</span>${c.name || ''}`;
    el.appendChild(span);
  });
}

function renderGallery(images) {
  const el = document.getElementById('fp-gallery');
  const section = document.getElementById('fp-gallery-section');
  if (!el || !section) return;

  el.innerHTML = '';
  if (!images || !images.length) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  images.forEach(img => {
    const image = document.createElement('img');
    image.src = img.url;
    image.alt = img.alt_text || img.name || '';
    image.loading = 'lazy';
    el.appendChild(image);
  });
}

export function closeClip(app) {
  const fp = document.getElementById('fp');
  fp?.classList.remove('on');
  fp?.querySelector('video')?.pause();
  document.getElementById('fp-info-panel')?.classList.remove('on');
  clearTimeout(titleIdleTimer);
  document.getElementById('fp-title')?.classList.remove('fp-idle');
  setProjectNavVisible(true);
  app.S.playing = false;
  clearInterval(app.S.playTimer);
  app.S.playProg = 0;

  const fill = document.getElementById('fp-fill');
  if (fill) fill.style.width = '0%';
}

export function togglePlay(app) {
  app.S.playing = !app.S.playing;
  const btn = document.getElementById('fp-play');
  if (btn) btn.innerHTML = app.S.playing ? ICON_PAUSE : ICON_PLAY;

  app.S.playing ? app.startPlay() : clearInterval(app.S.playTimer);

  const vid = document.getElementById('fp')?.querySelector('video');
  if (vid) {
    if (app.S.playing) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }
}

export function startPlay(app) {
  clearInterval(app.S.playTimer);
  app.S.playTimer = setInterval(() => {
    const vid = document.getElementById('fp')?.querySelector('video');
    const hasRealVideo = vid && vid.duration;

    if (hasRealVideo) {
      app.S.playProg = vid.currentTime / vid.duration;
    } else {
      app.S.playProg = Math.min(1, app.S.playProg + 0.0014);
    }

    const fill = document.getElementById('fp-fill');
    if (fill) fill.style.width = `${app.S.playProg * 100}%`;

    const s = hasRealVideo ? Math.floor(vid.currentTime) : Math.floor(app.S.playProg * 324);
    const tc = document.getElementById('fp-tc');
    if (tc) tc.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:00`;

    if (!hasRealVideo && app.S.playProg >= 1) app.S.playProg = 0;
  }, 100);
}
