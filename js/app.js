/* ═══════════════════════════════════════════════════════
   STUDIO THIRTY6 · Cinema OS · app.js
   Built from T36 content layer (data/content.js)
═══════════════════════════════════════════════════════ */
'use strict';

import { createAppState } from './modules/state.js';
import { bootApp } from './modules/boot.js';
import { initCursor, startTimecode, initResize } from './modules/core.js';
import { initModes, switchMode } from './modules/mode.js';
import { initShoot, updateLV, toggleREC, applyShootContent } from './modules/shoot.js';
import { initPlayback, openClip, closeClip, togglePlay, startPlay } from './modules/playback.js';
import { buildArchive, applyArchiveContent } from './modules/archive.js';
import { buildEdit, selectStage, initPlayhead, initSliders, applyGrade, applyEditContent } from './modules/edit.js';
import { buildLenses } from './modules/lenses.js';
import { initTransmit, initScopes, applyTransmitContent } from './modules/transmit.js';
import { initShortcuts, toggleUI, toggleShortcuts, toggleNight, toggleAnamorphic, toggleGrain, initMobileNav, initRail } from './modules/ui.js';
import { initKeyboard } from './modules/keyboard.js';
import { initMobileInteractions } from './modules/events.js';
import { loadProjects } from './modules/data-loader.js';
import { loadPageContent, loadServices, loadArchiveItems, loadTimelineStages } from './modules/content-loader.js';

const CinemaOS = {
  S: createAppState(),

  ISO_S: [100, 200, 400, 800, 1600, 3200, 6400, 12800],
  AP_S: [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16],
  WB_S: [2500, 2800, 3200, 4300, 5600, 6500, 7500, 9000],
  SS_S: [24, 30, 48, 50, 60, 96, 100, 120, 180, 200],
  MODES: ['SHOOT', 'PLAYBACK', 'ARCHIVE', 'EDIT', 'LENSES', 'TRANSMIT'],
  KONAMI: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
  PAGE_IDS: ['p-shoot', 'p-play', 'p-media', 'p-edit', 'p-lens', 'p-tx'],

  /* ── INIT ─────────────────────────────────────────── */
  init() {
    this.boot();
    this.initCursor();
    this.initToast();
    this.buildPlayback();
    this.buildEdit();
    this.buildLenses();
    this.buildArchive();
    this.initModes();
    this.initShoot();
    this.initRail();
    this.initTransmit();
    this.initKeyboard();
    this.initShortcuts();
    this.startTimecode();
    this.initScopes();
    this.initResize();
    this.initMobileNav();
    initMobileInteractions();
  },

  /* ── BOOT ──────────────────────────────────────────── */
  boot() {
    bootApp(this);
  },

  /* ── CURSOR ────────────────────────────────────────── */
  initCursor() {
    initCursor(this);
  },

  /* ── TOAST ─────────────────────────────────────────── */
  initToast() {
    // toast() called globally below
  },
  _toastTimer: null,
  toast(msg, dur = 2000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('in');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('in'), dur);
  },

  /* ── TIMECODE ──────────────────────────────────────── */
  startTimecode() {
    startTimecode(this);
  },

  /* ── MODE SWITCHING ────────────────────────────────── */
  initModes() {
    initModes(this);
  },

  switchMode(n) {
    switchMode(this, n);
  },

  /* ── SHOOT / LIVE VIEW ─────────────────────────────── */
  initShoot() {
    initShoot(this);
  },

  _hEl(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  },

  _setTb(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  updateLV() {
    updateLV(this);
  },

  toggleREC() {
    toggleREC(this);
  },

  /* ── RAIL BUTTONS ──────────────────────────────────── */
  initRail() {
    initRail(this);
  },

  /* ── PLAYBACK ──────────────────────────────────────── */
  buildPlayback() {
    initPlayback(this);
  },

  openClip(idx) {
    openClip(this, idx);
  },

  closeClip() {
    closeClip(this);
  },

  togglePlay() {
    togglePlay(this);
  },

  startPlay() {
    startPlay(this);
  },

  /* ── ARCHIVE / ABOUT ─────────────────────────────── */
  buildArchive() {
    buildArchive();
  },

  /* ── EDIT ────────────────────────────────────────── */
  buildEdit() {
    buildEdit(this);
  },

  selectStage(i) {
    selectStage(this, i);
  },

  initPlayhead() {
    initPlayhead(this);
  },

  initSliders() {
    initSliders(this);
  },

  applyGrade() {
    applyGrade(this);
  },

  /* ── LENS CABINET ────────────────────────────────── */
  buildLenses() {
    buildLenses();
  },

  /* ── TRANSMIT ─────────────────────────────────────── */
  initTransmit() {
    initTransmit(this);
  },

  initScopes() {
    initScopes(this);
  },

  /* ── UI TOGGLES ──────────────────────────────────── */
  toggleUI() {
    toggleUI(this);
  },

  toggleShortcuts() {
    toggleShortcuts(this);
  },

  toggleNight() {
    toggleNight(this);
  },

  toggleAnamorphic() {
    toggleAnamorphic(this);
  },

  toggleGrain() {
    toggleGrain(this);
  },

  /* ── SHORTCUTS INIT ─────────────────────────────── */
  initShortcuts() {
    initShortcuts(this);
  },

  /* ── KEYBOARD ─────────────────────────────────────── */
  initKeyboard() {
    initKeyboard(this);
  },

  /* ── RESIZE ──────────────────────────────────────── */
  initResize() {
    initResize(this);
  },

  initMobileNav() {
    initMobileNav(this);
  },
};

/* ── Global toast shortcut ─────────────────────────── */
window.T36toast = (msg, dur) => CinemaOS.toast(msg, dur);

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

/**
 * Runs a set of named async loaders in parallel, each with its own
 * timeout and independent failure handling — one slow/broken loader
 * never blocks or breaks the others.
 * @param {Record<string, Promise>} entries
 * @param {Record<string, any>} fallbacks - value to use per key on failure
 */
async function loadAll(entries, fallbacks = {}) {
  const keys = Object.keys(entries);
  const settled = await Promise.allSettled(Object.values(entries));

  const results = {};
  let anyFailed = false;

  keys.forEach((key, i) => {
    const outcome = settled[i];
    if (outcome.status === 'fulfilled') {
      results[key] = outcome.value;
    } else {
      console.error(`[T36] Failed to load "${key}":`, outcome.reason);
      results[key] = fallbacks[key] ?? null;
      anyFailed = true;
    }
  });

  return { results, anyFailed };
}

document.addEventListener('DOMContentLoaded', async () => {
  const { results, anyFailed } = await loadAll(
    {
      projects: withTimeout(loadProjects(), 8000),
      shoot: withTimeout(loadPageContent('shoot'), 8000),
      transmit: withTimeout(loadPageContent('transmit'), 8000),
      services: withTimeout(loadServices(), 8000),
      archiveContent: withTimeout(loadPageContent('archive'), 8000),
      archiveItems: withTimeout(loadArchiveItems(), 8000),
      editContent: withTimeout(loadPageContent('edit'), 8000),
      timelineStages: withTimeout(loadTimelineStages(), 8000),
    },
    {
      projects: { projects: [], error: new Error('load failed') },
      shoot: {},
      transmit: {},
      services: [],
      archiveContent: {},
      archiveItems: [],
      editContent: {},
      timelineStages: [],
    }
  );

  window.T36.PROJECTS = results.projects.projects || [];
  if (results.projects.error) console.error('[T36] Projects query returned an error:', results.projects.error);

  CinemaOS.init();
  applyShootContent(CinemaOS, results.shoot.hero, results.shoot.hud);
  applyTransmitContent(CinemaOS, results.transmit.content, results.services);
  applyArchiveContent(results.archiveContent.content, results.archiveItems);
  applyEditContent(CinemaOS, results.timelineStages, results.editContent.grader_defaults);
  buildLenses(results.services);

  if (anyFailed || results.projects.error) {
    // Genuinely empty (no published projects yet) is a normal state
    // handled by the grid's own empty message — this toast is only for
    // an actual fetch failure, so it's worth surfacing to the visitor.
    CinemaOS.toast('Some work couldn\u2019t load — refresh to try again', 3200);
  }
});

window.CinemaOS = CinemaOS;
