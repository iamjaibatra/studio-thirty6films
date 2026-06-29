export function initModes(app) {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    let suppressNextClick = false;
    const activate = event => {
      event.stopPropagation();

      if (event.type === 'touchend') {
        suppressNextClick = true;
      } else if (event.type === 'click' && suppressNextClick) {
        suppressNextClick = false;
        return;
      }

      app.switchMode(Number(btn.dataset.m));

      if (window.innerWidth <= 768) {
        const topNav = document.querySelector('.top-nav');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        topNav?.classList.remove('open');
        mobileBtn?.classList.remove('open');
        mobileBtn?.setAttribute('aria-expanded', 'false');
      }
    };

    btn.addEventListener('touchend', activate, { passive: true });
    btn.addEventListener('click', activate, { passive: true });
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
