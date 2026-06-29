export function initMobileInteractions() {
  const selector = 'button, a[href], [role="button"], .mode-tab, .r-btn, .pf, .fp-btn, .epc, .sh-close, .lv-enter';

  document.addEventListener('touchend', event => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();

    if (typeof target.click === 'function') {
      target.click();
    }
  }, { passive: false });
}
