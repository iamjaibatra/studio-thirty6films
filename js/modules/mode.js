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

  // Blur any focused control before switching — handles the on-screen
  // keyboard for text inputs reliably. The deeper fix for native <select>
  // pickers is in css/main.css: .page now toggles `visibility` alongside
  // `opacity`, since visibility (not opacity) is what actually removes an
  // element from the browser's interaction/accessibility tree — which is
  // what determines whether an open native picker gets dismissed.
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
