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

  const lvEnter = document.getElementById('lv-enter');
  if (lvEnter) {
    let suppressNextClick = false;
    const goPlayback = event => {
      event.stopPropagation();

      if (event.type === 'touchend') {
        suppressNextClick = true;
      } else if (event.type === 'click' && suppressNextClick) {
        suppressNextClick = false;
        return;
      }

      app.switchMode(1);

      if (window.innerWidth <= 768) {
        const topNav = document.querySelector('.top-nav');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        topNav?.classList.remove('open');
        mobileBtn?.classList.remove('open');
        mobileBtn?.setAttribute('aria-expanded', 'false');
      }
    };

    lvEnter.addEventListener('touchend', goPlayback, { passive: true });
    lvEnter.addEventListener('click', goPlayback, { passive: true });
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
