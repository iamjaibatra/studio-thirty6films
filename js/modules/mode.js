export function initModes(app) {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('pointerup', event => {
      event.preventDefault();
      event.stopPropagation();
      app.switchMode(Number(btn.dataset.m));

      if (window.innerWidth <= 768) {
        const topNav = document.querySelector('.top-nav');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        topNav?.classList.remove('open');
        mobileBtn?.classList.remove('open');
        mobileBtn?.setAttribute('aria-expanded', 'false');
      }
    });
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
    });
  });
}

export function switchMode(app, n) {
  const nextMode = Number(n);
  if (Number.isNaN(nextMode) || nextMode === app.S.mode) return;

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
