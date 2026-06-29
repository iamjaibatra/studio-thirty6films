export function initCursor(app) {
  if (app.S.isMobile) return;

  const cur = document.getElementById('cur');
  if (!cur) return;

  document.addEventListener('mousemove', e => {
    cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, { passive: true });

  const bind = (sel, cls) => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.dataset.cursor = cls;
      });
      el.addEventListener('mouseleave', () => {
        delete document.body.dataset.cursor;
      });
    });
  };

  const ob = new MutationObserver(() => {
    const cls = document.body.dataset.cursor || '';
    document.body.className = cls ? `c-${cls}` : '';
  });
  ob.observe(document.body, { attributes: true, attributeFilter: ['data-cursor'] });

  bind('.clip', 'play');
  bind('.tl-row,.tl-ruler', 'scrub');
  bind('.lens-card', 'focus');
  bind('.hs-ctrl', 'grab');
  bind('.sl-track', 'grab');
  bind('.mode-tab,.pf,.r-btn,.fp-btn,.epc,.tl-t,.tx-k,.sh-close,.r-btn-i', 'zoom');
  bind('.neg', 'zoom');
  bind('.txg-i,.txg-s,.txg-t', 'text');
}

export function startTimecode(app) {
  let f = (4 * 3600 + 17 * 60 + 22) * 24;
  const fmt = n => {
    const fr = n % 24;
    const s = Math.floor(n / 24) % 60;
    const m = Math.floor(n / 1440) % 60;
    const h = Math.floor(n / 86400);
    return [h, m, s, fr].map(x => String(x).padStart(2, '0')).join(':');
  };

  setInterval(() => {
    f++;
    const tc = fmt(f);
    ['tb-tc', 'bb-tc', 'hud-tc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = tc;
    });
  }, 1000 / 24);
}

export function initResize(app) {
  window.addEventListener('resize', () => {
    app.S.isMobile = window.innerWidth <= 768;
  }, { passive: true });
}
