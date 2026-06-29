export function bindInteractiveHandlers(root = document) {
  const activate = element => {
    if (!element || element.dataset.bound === 'true') return;
    element.dataset.bound = 'true';

    const trigger = event => {
      if (event.type === 'click' && event.detail === 0) return;
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
      if (event.type === 'pointerup' && event.button !== 0) return;

      if (typeof element.click === 'function' && !element.hasAttribute('data-manual')) {
        element.click();
      }
    };

    element.addEventListener('pointerup', trigger, { passive: false });
    element.addEventListener('click', trigger, { passive: false });
    element.addEventListener('keydown', trigger, { passive: false });
  };

  root.querySelectorAll('button, a, [role="button"], .mode-tab, .r-btn, .pf, .fp-btn, .epc, .sh-close, .lv-enter').forEach(activate);
}
