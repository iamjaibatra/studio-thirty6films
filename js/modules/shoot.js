export function initShoot(app) {
  const shoot = document.getElementById('p-shoot');
  const fbox = document.getElementById('focus-box');
  const hist = document.querySelectorAll('.hh');
  const scope = document.querySelectorAll('.sc');
  if (!shoot || !fbox) return;

  shoot.addEventListener('mousemove', e => {
    const r = shoot.getBoundingClientRect();
    const rx = (e.clientX - r.left) / r.width;
    const ry = (e.clientY - r.top) / r.height;

    if (!app.S.focusLocked) {
      fbox.style.left = `${rx * 100}%`;
      fbox.style.top = `${ry * 100}%`;
    }

    hist.forEach((h, i) => {
      const p = Math.sin((i / hist.length + rx) * Math.PI) * 72 + 8;
      h.style.height = `${Math.max(4, p)}%`;
    });

    scope.forEach((sc, i) => {
      const h = 20 + (1 - ry) * 54 + Math.sin(i * 1.1 + rx * 4) * 9;
      sc.style.height = `${Math.max(5, Math.min(86, h))}%`;
    });
  }, { passive: true });

  shoot.addEventListener('click', e => {
    if (e.target.closest('.hs-ctrl,.hud-rec,.lv-enter,.r-btn')) return;
    app.S.focusLocked = !app.S.focusLocked;
    fbox.classList.toggle('locked', app.S.focusLocked);
    app.toast(app.S.focusLocked ? 'AF LOCKED' : 'AF RELEASED');
  });

  const hudRec = document.getElementById('hud-rec');
  if (hudRec) {
    hudRec.addEventListener('click', e => {
      e.stopPropagation();
      app.toggleREC();
    });
  }

  const enterBtn = document.getElementById('lv-enter');
  if (enterBtn) {
    enterBtn.addEventListener('click', e => {
      e.stopPropagation();
      const link = enterBtn.dataset.link || 'playback';
      const modeIndex = app.MODES?.findIndex(m => m.toLowerCase() === link.toLowerCase());
      if (modeIndex >= 0) {
        app.switchMode(modeIndex);
      } else if (/^(https?:|mailto:|tel:|\/)/i.test(link)) {
        window.location.href = link;
      } else {
        app.switchMode(1); // default: Playback
      }
    });
  }

  const bindScroll = (id, arr, get, set, render) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('wheel', e => {
      e.preventDefault();
      e.stopPropagation();
      const cur = arr.indexOf(get());
      const next = Math.max(0, Math.min(arr.length - 1, cur + (e.deltaY > 0 ? 1 : -1)));
      set(arr[next]);
      render(arr[next]);
      app.updateLV();
    }, { passive: false });

    el.addEventListener('mouseenter', () => app.toast('Scroll to adjust'));
  };

  bindScroll('h-iso', app.ISO_S, () => app.S.iso, v => {
    app.S.iso = v;
    app._setTb('tb-iso', v);
    app._setTb('bb-iso', v);
  }, v => app._hEl('h-iso', `ISO <span class="v">${v}</span>`));

  bindScroll('h-ap', app.AP_S, () => app.S.ap, v => {
    app.S.ap = v;
    app._setTb('tb-ap', v);
    app._setTb('bb-ap', v);
  }, v => app._hEl('h-ap', `f/<span class="v">${v}</span>`));

  bindScroll('h-wb', app.WB_S, () => app.S.wb, v => {
    app.S.wb = v;
  }, v => app._hEl('h-wb', `WB <span class="v">${v}K</span>`));

  bindScroll('h-ss', app.SS_S, () => app.S.ss, v => {
    app.S.ss = v;
  }, v => app._hEl('h-ss', `1/<span class="v">${v}</span>s`));
}

export function updateLV(app) {
  const bg = document.getElementById('lv-bg');
  const grain = document.getElementById('lv-grain');
  if (!bg) return;

  const isoIdx = app.ISO_S.indexOf(app.S.iso);
  const wbIdx = app.WB_S.indexOf(app.S.wb);
  const hue = (wbIdx - (app.WB_S.length - 1) / 2) * -3.2;
  const bri = 0.8 + isoIdx * 0.038;
  bg.style.filter = `hue-rotate(${hue}deg) brightness(${Math.min(1.52, bri)})`;

  if (grain) {
    grain.style.opacity = Math.max(0, (isoIdx - 2) * 0.06);
  }
}

export function toggleREC(app) {
  app.S.rec = !app.S.rec;
  const btn = document.getElementById('hud-rec');
  const dot = document.getElementById('tb-recdot');
  const wrap = document.getElementById('tb-rec');

  if (btn) btn.classList.toggle('live', app.S.rec);
  if (dot) dot.classList.toggle('live', app.S.rec);
  if (wrap) wrap.style.color = app.S.rec ? 'var(--red)' : 'var(--t3)';

  app.toast(app.S.rec ? '● RECORDING' : '■ STOPPED');
}

/**
 * Applies CMS-driven content (page_content: shoot/hero, shoot/hud) to the
 * DOM. Falls back to sensible copy only if the fetch failed entirely —
 * normal empty fields just render blank rather than showing stale
 * hardcoded text.
 */
export function applyShootContent(app, hero = {}, hud = {}) {
  setText('lv-eye', hero.eyebrow);

  const h1 = document.getElementById('lv-h1');
  if (h1) {
    h1.textContent = '';
    if (hero.headline_plain) h1.appendChild(document.createTextNode(hero.headline_plain));
    if (hero.headline_bold) {
      const strong = document.createElement('strong');
      strong.textContent = hero.headline_bold;
      h1.appendChild(strong);
    }
  }

  setText('lv-sub', hero.subheading);

  const enterBtn = document.getElementById('lv-enter');
  if (enterBtn) {
    enterBtn.textContent = hero.button_text || 'Enter →';
    enterBtn.dataset.link = hero.button_link || 'playback';
  }

  applyBackgroundMedia(hero);
  applyHud(app, hud);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

function applyBackgroundMedia(hero) {
  const container = document.getElementById('lv-img');
  const gradientBg = document.getElementById('lv-bg');
  if (!container) return;

  const isMobile = window.innerWidth <= 768;
  const videoUrl = (isMobile && hero.background_video_mobile_url) || hero.background_video_url;

  if (videoUrl) {
    gradientBg?.style.setProperty('display', 'none');
    const video = document.createElement('video');
    video.className = 'lv-real-bg';
    video.src = videoUrl;
    if (hero.fallback_image_url) video.poster = hero.fallback_image_url;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    container.insertBefore(video, container.firstChild);
  } else if (hero.fallback_image_url) {
    gradientBg?.style.setProperty('display', 'none');
    const img = document.createElement('img');
    img.className = 'lv-real-bg';
    img.src = hero.fallback_image_url;
    img.alt = '';
    container.insertBefore(img, container.firstChild);
  }

  if (hero.ambient_video_url) {
    const ambient = document.createElement('video');
    ambient.className = 'lv-ambient';
    ambient.src = hero.ambient_video_url;
    ambient.autoplay = true;
    ambient.muted = true;
    ambient.loop = true;
    ambient.playsInline = true;
    container.appendChild(ambient);
  }
}

function applyHud(app, hud) {
  if (hud.iso) app.S.iso = hud.iso;
  if (hud.aperture) app.S.ap = hud.aperture;
  if (hud.shutter) app.S.ss = hud.shutter;
  if (hud.white_balance) app.S.wb = hud.white_balance;

  const iso = document.getElementById('h-iso');
  if (iso && hud.iso) iso.innerHTML = `ISO <span class="v">${hud.iso}</span>`;
  const ap = document.getElementById('h-ap');
  if (ap && hud.aperture) ap.innerHTML = `f/<span class="v">${hud.aperture}</span>`;
  const ss = document.getElementById('h-ss');
  if (ss && hud.shutter) ss.innerHTML = `1/<span class="v">${hud.shutter}</span>s`;
  const wb = document.getElementById('h-wb');
  if (wb && hud.white_balance) wb.innerHTML = `WB <span class="v">${hud.white_balance}K</span>`;

  const lens = document.getElementById('h-lens');
  if (lens && hud.lens) lens.textContent = hud.lens;

  const bat = document.getElementById('h-bat');
  const batFill = document.getElementById('h-bat-fill');
  if (hud.battery_percent != null) {
    if (bat) bat.textContent = `${hud.battery_percent}%`;
    if (batFill) batFill.style.width = `${hud.battery_percent}%`;
  }
}
