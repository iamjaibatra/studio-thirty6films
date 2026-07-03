/**
 * STUDIO THIRTY6 · js/modules/ui.js
 * ────────────────────────────────────
 * UI toggles, rail buttons, shortcuts overlay, and mobile navigation.
 *
 * MOBILE NAV — ROOT CAUSE ANALYSIS & FIX
 * ═══════════════════════════════════════
 * The bug: mode tabs work in Chrome DevTools mobile simulation but
 * not on real iOS Safari / Chrome Android devices.
 *
 * Why DevTools works but real mobile doesn't:
 *   DevTools simulates touch events but still fires synthetic click
 *   events with full propagation. Real mobile browsers are stricter.
 *
 * Root causes fixed in this file:
 *
 * 1. DUAL EVENT LISTENERS (touchend + click on same element)
 *    The old code attached BOTH touchend and click to #mobile-menu-btn,
 *    then tried to suppress the click after touchend with a flag.
 *    On iOS this caused the button to fire twice OR not at all depending
 *    on timing. Fixed: use ONLY click. Modern mobile browsers fire
 *    click reliably on <button> elements with touch-action:manipulation.
 *
 * 2. STACKING CONTEXT (z-index didn't work)
 *    .top-nav had z-index:998 but was a child of #topbar (z:100)
 *    inside a fixed grid (#cam). The grid items (#vp, pages) painted
 *    on top of it because they appeared later in DOM order and the
 *    grid didn't create a containing block for z-index purposes.
 *    Fixed in CSS: #topbar gets z-index:200 + isolation:isolate,
 *    .top-nav gets z-index:1100, #mobile-menu-btn gets z-index:1200.
 *
 * 3. pointer-events:none ON CLOSED NAV
 *    .top-nav had no pointer-events rule when closed. When it slid
 *    off-screen to right:-100%, it was still technically in the layout
 *    and could receive events. Fixed: pointer-events:none when closed,
 *    pointer-events:all only when .open (set in CSS).
 *
 * 4. cursor:none ON MODE TABS
 *    iOS Safari does NOT fire click events on non-interactive elements
 *    that have cursor:none. Even <button> elements can be affected
 *    when the cursor style is explicitly set to a non-pointer value.
 *    Fixed in CSS: .mode-tab inside mobile nav gets cursor:pointer +
 *    touch-action:manipulation + -webkit-tap-highlight-color:transparent.
 *
 * 5. BACKDROP FOR OUTSIDE-TAP CLOSE
 *    The old code used a document click listener to detect taps outside
 *    the nav. On iOS, taps on non-interactive elements don't bubble to
 *    document. Fixed: inject a full-screen backdrop element (z:1050)
 *    that sits between the pages and the nav drawer, and listen on it.
 */

/* ── Rail buttons ─────────────────────────────────────── */
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

  tog('rb-peak',  'peak',  on => { document.getElementById('lv-peak')?.classList.toggle('on', on);  app.toast(on ? 'Focus Peaking ON'  : 'Focus Peaking OFF'); });
  tog('rb-zebra', 'zebra', on => { document.getElementById('lv-zebra')?.classList.toggle('on', on); app.toast(on ? 'Zebras ON'          : 'Zebras OFF'); });
  tog('rb-false', 'false', on => { document.getElementById('lv-false')?.classList.toggle('on', on); app.toast(on ? 'False Colour ON'   : 'False Colour OFF'); });
  tog('rb-safe',  'safe',  on => { document.getElementById('lv-safe')?.classList.toggle('on', on);  app.toast(on ? 'Safe Area ON'      : 'Safe Area OFF'); });

  document.getElementById('rb-rec')?.addEventListener('click', () => app.toggleREC());
  document.getElementById('rb-hide')?.addEventListener('click', () => app.toggleUI());
  document.getElementById('rb-sh')?.addEventListener('click',  () => app.toggleShortcuts());
}

/* ── Shortcuts overlay ────────────────────────────────── */
export function initShortcuts(app) {
  document.getElementById('sh-close')?.addEventListener('click', () => app.toggleShortcuts());
}

/* ── Global UI toggles ────────────────────────────────── */
export function toggleUI(app) {
  app.S.uiHidden = !app.S.uiHidden;
  const opacity = app.S.uiHidden ? '0' : '1';
  ['topbar', 'botbar', 'rail-l', 'rail-r'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = opacity;
  });
  const hud = document.getElementById('lv-hud');
  if (hud) hud.style.opacity = opacity;
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

/* ── Mobile navigation ────────────────────────────────── */
export function initMobileNav(app) {
  const btn    = document.getElementById('mobile-menu-btn');
  const topNav = document.getElementById('top-nav') || document.querySelector('.top-nav');

  if (!btn || !topNav) return;

  /* ── Create and inject the backdrop element ───────────
     A full-screen div that sits between pages and the nav.
     Tapping it closes the drawer on ALL mobile browsers,
     including iOS Safari where document-level click listeners
     don't fire on non-interactive areas.
  ──────────────────────────────────────────────────────── */
  let backdrop = document.getElementById('nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  /* ── Open / close helpers ───────────────────────────── */
  const openNav = () => {
    topNav.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('visible');
    /* Prevent body scroll while drawer is open (iOS fix) */
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    topNav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  };

  /* ── Hamburger button ───────────────────────────────────
     Use ONLY 'click'. Modern iOS/Android fire click reliably
     on <button> elements when touch-action:manipulation is set.
     Using touchend+click creates double-fire or suppression bugs.
  ──────────────────────────────────────────────────────── */
  btn.addEventListener('click', () => {
    if (topNav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  /* ── Backdrop tap closes drawer ─────────────────────── */
  backdrop.addEventListener('click', closeNav);

  /* ── Keyboard ESC closes drawer ─────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && topNav.classList.contains('open')) {
      closeNav();
    }
  });
}
