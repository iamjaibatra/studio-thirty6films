export function initModes(app) {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      app.switchMode(Number(btn.dataset.m));

      if (window.innerWidth <= 768) {
        const topNav = document.querySelector('.top-nav');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        topNav?.classList.remove('open');
        mobileBtn?.classList.remove('open');
        mobileBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

export function switchMode(app, n) {
  const nextMode = Number(n);
  if (Number.isNaN(nextMode) || nextMode === app.S.mode) return;

  // Dismiss any open mobile keyboard/native picker tied to a focused form
  // control on the page being left — otherwise that native UI (which is
  // outside CSS's control) can remain visible over the next page.
  const active = document.activeElement;
  if (active && typeof active.blur === 'function' && active !== document.body) {
    active.blur();
  }

  app.S.mode = nextMode;

  app.PAGE_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('on', i === nextMode);
    }
  });

  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('on', Number(btn.dataset.m) === nextMode);
  });

  const bbMode = document.getElementById('bb-mode');
  if (bbMode) {
    bbMode.textContent = app.MODES[nextMode];
  }

  app.toast(app.MODES[nextMode]);
}
