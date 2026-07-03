/**
 * STUDIO THIRTY6 · js/modules/mode.js
 * ─────────────────────────────────────
 * Mode switching — owns all .mode-tab event listeners.
 *
 * Uses a SINGLE delegated 'click' listener on the <nav> element
 * instead of per-button listeners. This is:
 *   - Safer: no duplicate handlers if initModes is called twice
 *   - More reliable on mobile: the nav element is a larger tap target
 *   - Cleaner: mode tab buttons added later (e.g. dynamically) still work
 *
 * The mobile nav close is handled here by calling closeNav()
 * via a CustomEvent — mode.js doesn't import ui.js to avoid
 * circular dependencies.
 */

export function initModes(app) {
  const nav = document.getElementById('top-nav') || document.querySelector('.top-nav');
  if (!nav) return;

  /* Single delegated listener on the nav container.
     Works correctly on iOS/Android — no per-button binding needed. */
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.mode-tab');
    if (!btn) return;

    const modeIndex = Number(btn.dataset.m);
    app.switchMode(modeIndex);

    /* Close the mobile drawer after a mode is selected.
       Dispatch a custom event so ui.js can respond without
       creating a circular import. */
    document.dispatchEvent(new CustomEvent('t36:close-nav'));
  });

  /* ── "Enter Playback" hero CTA ───────────────────────
     This button lives inside #p-shoot and switches to
     Playback mode (index 1). It was never wired in any
     module — wired here as the single owner of mode switching.
  ──────────────────────────────────────────────────────── */
  const enterBtn = document.getElementById('lv-enter');
  if (enterBtn) {
    enterBtn.addEventListener('click', e => {
      e.preventDefault();
      app.switchMode(1);
    });
  }
}

export function switchMode(app, n) {
  const next = Number(n);
  if (Number.isNaN(next) || next === app.S.mode) return;

  app.S.mode = next;

  /* Toggle page visibility */
  app.PAGE_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', i === next);
  });

  /* ── Transmit page isolation fix ─────────────────────
     Once the transmit monitor powers on, .tx-form gains
     class "on" which sets pointer-events:all. That state
     persists even when we switch away from the transmit
     page. The CSS rule `.page:not(.on) * { pointer-events:none }`
     is the primary fix, but we also defensively reset the
     element's inline style here to ensure no residual
     style attribute from JS overrides the CSS cascade.
  ──────────────────────────────────────────────────────── */
  if (next !== 5) {
    // Leaving transmit — ensure its form can't steal events
    const txForm = document.getElementById('tx-form');
    if (txForm) txForm.style.pointerEvents = '';

    const txNosig = document.getElementById('tx-nosig');
    if (txNosig) txNosig.style.pointerEvents = '';
  }

  /* Update active tab indicator */
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('on', Number(tab.dataset.m) === next);
  });

  /* Update bottom bar label */
  const bbMode = document.getElementById('bb-mode');
  if (bbMode) bbMode.textContent = app.MODES[next];

  app.toast(app.MODES[next]);
}
