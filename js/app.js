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
import { buildArchive } from './modules/archive.js';
import { buildEdit, selectStage, initPlayhead, initSliders, applyGrade } from './modules/edit.js';
import { buildLenses } from './modules/lenses.js';
import { initTransmit, initScopes, applyTransmitContent } from './modules/transmit.js';
import { initShortcuts, toggleUI, toggleShortcuts, toggleNight, toggleAnamorphic, toggleGrain, initMobileNav, initRail } from './modules/ui.js';
import { initKeyboard } from './modules/keyboard.js';
import { initMobileInteractions } from './modules/events.js';
import { loadProjects } from './modules/data-loader.js';
import { loadPageContent, loadServices } from './modules/content-loader.js';

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

document.addEventListener('DOMContentLoaded', async () => {
  let loadFailed = false;
  let shootContent = {};
  let transmitContent = {};
  let services = [];

  try {
    const [projectsResult, shootResult, transmitResult, servicesResult] = await Promise.allSettled([
      withTimeout(loadProjects(), 8000),
      withTimeout(loadPageContent('shoot'), 8000),
      withTimeout(loadPageContent('transmit'), 8000),
      withTimeout(loadServices(), 8000),
    ]);

    if (projectsResult.status === 'fulfilled') {
      window.T36.PROJECTS = projectsResult.value.projects;
      loadFailed = Boolean(projectsResult.value.error);
      if (projectsResult.value.error) console.error('[T36] Failed to load projects:', projectsResult.value.error);
    } else {
      console.error('[T36] Failed to load projects:', projectsResult.reason);
      window.T36.PROJECTS = [];
      loadFailed = true;
    }

    if (shootResult.status === 'fulfilled') {
      shootContent = shootResult.value;
    } else {
      console.error('[T36] Failed to load shoot content:', shootResult.reason);
    }

    if (transmitResult.status === 'fulfilled') {
      transmitContent = transmitResult.value;
    } else {
      console.error('[T36] Failed to load transmit content:', transmitResult.reason);
    }

    if (servicesResult.status === 'fulfilled') {
      services = servicesResult.value;
    } else {
      console.error('[T36] Failed to load services:', servicesResult.reason);
    }
  } catch (err) {
    console.error('[T36] Unexpected error during initial load:', err);
    window.T36.PROJECTS = window.T36.PROJECTS || [];
    loadFailed = true;
  }

  CinemaOS.init();
  applyShootContent(CinemaOS, shootContent.hero, shootContent.hud);
  applyTransmitContent(CinemaOS, transmitContent.content, services);

  if (loadFailed) {
    // Genuinely empty (no published projects yet) is a normal state
    // handled by the grid's own empty message — this toast is only for
    // an actual fetch failure, so it's worth surfacing to the visitor.
    CinemaOS.toast('Some work couldn\u2019t load — refresh to try again', 3200);
  }
});

window.CinemaOS = CinemaOS;
