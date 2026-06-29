export function initMobileInteractions() {
  const selector = 'button, a[href], [role="button"], .mode-tab, .r-btn, .pf, .fp-btn, .epc, .sh-close, .lv-enter';
  let suppressNextClick = false;

  document.addEventListener('touchend', event => {
    const target = event.target.closest(selector);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();
    suppressNextClick = true;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }, { passive: false });

  document.addEventListener('click', event => {
    if (suppressNextClick) {
      suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }, true);
}
