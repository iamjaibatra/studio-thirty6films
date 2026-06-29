export function initRail(app) {
  const tog = (id, key, onFn) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      app.S[key] = !app.S[key];
      el.classList.toggle('on', app.S[key]);
      onFn(app.S[key]);
    });
  };

  tog('rb-peak', 'peak', on => {
    document.getElementById('lv-peak')?.classList.toggle('on', on);
    app.toast(on ? 'Focus Peaking ON' : 'Focus Peaking OFF');
  });
  tog('rb-zebra', 'zebra', on => {
    document.getElementById('lv-zebra')?.classList.toggle('on', on);
    app.toast(on ? 'Zebras ON' : 'Zebras OFF');
  });
  tog('rb-false', 'false', on => {
    document.getElementById('lv-false')?.classList.toggle('on', on);
    app.toast(on ? 'False Colour ON' : 'False Colour OFF');
  });
  tog('rb-safe', 'safe', on => {
    document.getElementById('lv-safe')?.classList.toggle('on', on);
    app.toast(on ? 'Safe Area ON' : 'Safe Area OFF');
  });

  document.getElementById('rb-rec')?.addEventListener('click', () => app.toggleREC());
  document.getElementById('rb-hide')?.addEventListener('click', () => app.toggleUI());
  document.getElementById('rb-sh')?.addEventListener('click', () => app.toggleShortcuts());
}

export function initShortcuts(app) {
  document.getElementById('sh-close')?.addEventListener('click', () => app.toggleShortcuts());
}

export function toggleUI(app) {
  app.S.uiHidden = !app.S.uiHidden;
  ['topbar', 'botbar', 'rail-l', 'rail-r'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = app.S.uiHidden ? '0' : '1';
  });
  document.getElementById('lv-hud')?.style && (document.getElementById('lv-hud').style.opacity = app.S.uiHidden ? '0' : '1');
  app.toast(app.S.uiHidden ? 'UI Hidden · H to restore' : 'UI Visible');
}

export function toggleShortcuts(app) {
  document.getElementById('shorts')?.classList.toggle('on');
}

export function toggleNight(app) {
  app.S.night = !app.S.night;
  document.body.classList.toggle('night', app.S.night);
  app.toast(app.S.night ? 'Night Mode activated' : 'Day Mode restored');
}

export function toggleAnamorphic(app) {
  app.S.anamorphic = !app.S.anamorphic;
  document.body.classList.toggle('anamorphic', app.S.anamorphic);
  app.toast(app.S.anamorphic ? 'Anamorphic · 2.39:1' : 'Spherical · 1.78:1');
}

export function toggleGrain(app) {
  app.S.grain = !app.S.grain;
  const g = document.getElementById('lv-grain');
  if (g) g.style.opacity = app.S.grain ? '.34' : '0';
  app.toast(app.S.grain ? 'Grain Mode ON' : 'Grain Mode OFF');
}

export function initMobileNav(app) {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const topNav = document.querySelector('.top-nav');
  if (!mobileBtn || !topNav) return;

  let suppressNextClick = false;

  const closeMenu = () => {
    topNav.classList.remove('open');
    mobileBtn.classList.remove('open');
    mobileBtn.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    topNav.classList.add('open');
    mobileBtn.classList.add('open');
    mobileBtn.setAttribute('aria-expanded', 'true');
  };

  const toggleMenu = (event) => {
    if (event.type === 'touchend') {
      suppressNextClick = true;
    }

    event.preventDefault();
    event.stopPropagation();

    if (topNav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const activateMenu = event => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    toggleMenu(event);
  };

  mobileBtn.addEventListener('pointerup', activateMenu, { passive: false });
  mobileBtn.addEventListener('touchend', activateMenu, { passive: false });
  mobileBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
  }, { passive: false });

  document.addEventListener('click', e => {
    if (suppressNextClick) {
      suppressNextClick = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!topNav.classList.contains('open')) return;
    const clickInside = topNav.contains(e.target) || mobileBtn.contains(e.target);
    if (!clickInside) {
      closeMenu();
    }
  });

  document.addEventListener('touchstart', e => {
    if (!topNav.classList.contains('open')) return;
    const clickInside = topNav.contains(e.target) || mobileBtn.contains(e.target);
    if (!clickInside) {
      closeMenu();
    }
  }, { passive: true });
}
