import { ICON_PLAY, ICON_PAUSE } from './icons.js';

const BIN_STILLS = ['s1', 's2', 's3', 's4', 's1', 's5', 's6', 's2', 's4', 's3']; // cycles for any stage count
const NOMINAL_RUNTIME_SECONDS = 9 * 60 + 24; // ~09:24, matches the original decorative timecode range
// How long a full 0→100% playhead sweep takes in real seconds. This is a
// UI pacing choice for the decorative preview reel (not fabricated project
// data) — same category as NOMINAL_RUNTIME_SECONDS above, which was
// already an established decorative display value from the prior sprint.
const PLAYBACK_SWEEP_SECONDS = 24;
const TICK_MS = 100;
const PROG_PER_TICK = 100 / ((PLAYBACK_SWEEP_SECONDS * 1000) / TICK_MS);
const SCRUB_STEP_PCT = 100 / 24; // ~half a stage-width for a typical 9-stage project

let currentStages = [];

export function buildEdit(app) {
  // Setup that doesn't depend on CMS data — runs at init time regardless.
  // Actual stage/timeline content comes later via applyEditContent()
  // once page_content + timeline_stages load (see app.js).
  buildRuler();
  buildWaveforms();
  bindStaticTimelineClips(app);
  bindTransportControls(app);
  app.initPlayhead();
  app.initSliders();
}

/**
 * Click listeners for the V2/FX/A1/MX tracks' clips — these are static,
 * decorative HTML (not tied to real distinct content, see design note in
 * applyEditContent below), so they're bound once here rather than
 * rebuilt per stage-data load like the V1 track is.
 */
function bindStaticTimelineClips(app) {
  document.querySelectorAll('.tl-row .tl-clip').forEach(clip => {
    clip.addEventListener('click', e => {
      e.stopPropagation();
      app.selectStage(Number(clip.dataset.i || 0));
    });
  });
}

/**
 * Wires the 5 existing transport buttons to real playback behaviour.
 * These buttons already existed in the markup but had no click handlers
 * at all — clicking any of them previously did nothing.
 */
function bindTransportControls(app) {
  document.getElementById('ep-play')?.addEventListener('click', () => toggleEditPlay(app));
  document.getElementById('ep-prev-stage')?.addEventListener('click', () => stepStage(app, -1));
  document.getElementById('ep-next-stage')?.addEventListener('click', () => stepStage(app, 1));
  document.getElementById('ep-rewind')?.addEventListener('click', () => scrubEdit(app, -SCRUB_STEP_PCT));
  document.getElementById('ep-forward')?.addEventListener('click', () => scrubEdit(app, SCRUB_STEP_PCT));
}

/**
 * Applies CMS-driven content: the project bin, preview monitor
 * captions, the V1 timeline track, and the grader panel's default
 * values. The V2/FX/A1/MX tracks stay as decorative NLE-suite dressing —
 * they were never tied to real distinct content, only the stages were.
 */
export function applyEditContent(app, stages = [], graderDefaults = {}) {
  currentStages = stages;

  renderBin(app, stages);
  renderStageCaptions(stages);
  renderTimelineTrack(app, stages);
  applyGraderDefaults(app, graderDefaults);

  stopEditPlayback(app);
  if (stages.length) selectStage(app, 0);
}

function renderBin(app, stages) {
  const list = document.getElementById('bin-list');
  if (!list) return;
  list.innerHTML = '';

  stages.forEach((stage, i) => {
    const d = document.createElement('div');
    d.className = `bin-row${i === 0 ? ' sel' : ''}`;
    d.dataset.i = i;
    const stillClass = BIN_STILLS[i % BIN_STILLS.length];
    const name = `0${i + 1}_${(stage.label || '').replace(/[· ]/g, '_').toUpperCase()}`;
    const meta = stage.description ? truncate(stage.description, 42) : '';
    d.innerHTML = `<div class="bin-sw ${stillClass}"></div><div><div class="bin-name">${name}</div><div class="bin-meta">${meta}</div></div>`;
    d.addEventListener('click', () => app.selectStage(i));
    list.appendChild(d);
  });
}

function renderStageCaptions(stages) {
  const stagesWrap = document.getElementById('ep-stages');
  if (!stagesWrap) return;
  stagesWrap.innerHTML = '';

  stages.forEach((stage, i) => {
    const s = document.createElement('div');
    s.className = `ep-stage${i === 0 ? ' on' : ''}`;
    s.id = `es${i}`;
    const projectLine = stage.projectTitle
      ? `<div class="ep-s-proj">Case study: ${stage.projectTitle}${stage.projectClient ? ` · ${stage.projectClient}` : ''}</div>`
      : '';
    s.innerHTML = `<div class="ep-s-ti">${stage.label || ''}</div><div class="ep-s-de">${stage.description || ''}</div>${projectLine}`;
    stagesWrap.appendChild(s);
  });
}

function renderTimelineTrack(app, stages) {
  const row = document.getElementById('tl-v1-row');
  if (!row) return;
  row.innerHTML = '';

  const n = stages.length;
  if (!n) return;

  const gap = 1; // % gap between blocks, matches the original's spacing
  const width = 100 / n - gap;

  stages.forEach((stage, i) => {
    const clip = document.createElement('div');
    clip.className = i % 2 === 0 ? 'tl-clip c-bl' : 'tl-clip c-bl2';
    clip.style.left = `${i * (100 / n) + gap / 2}%`;
    clip.style.width = `${Math.max(width, 2)}%`;
    clip.dataset.i = i;
    clip.innerHTML = `<span class="tc-lbl">${stage.label || ''}</span>`;
    clip.addEventListener('click', e => {
      e.stopPropagation();
      app.selectStage(i);
    });
    row.appendChild(clip);
  });
}

function applyGraderDefaults(app, defaults) {
  const sliderMap = {
    exp: defaults.exposure,
    con: defaults.contrast,
    hi: defaults.highlights,
    sh: defaults.shadows,
    sat: defaults.saturation,
    tmp: defaults.temperature,
    grn: defaults.grain,
    lut: defaults.grade_intensity,
  };

  Object.entries(sliderMap).forEach(([param, value]) => {
    if (value == null) return;
    const track = document.querySelector(`.sl-track[data-p="${param}"]`);
    if (!track) return;
    track.dataset.v = value;
    const fill = track.querySelector('.sl-fill');
    const thumb = track.querySelector('.sl-thumb');
    if (fill) fill.style.width = `${value}%`;
    if (thumb) thumb.style.left = `${value}%`;
  });

  if (defaults.grade_profile) {
    const profileEl = document.getElementById('ep-grade-profile');
    if (profileEl) profileEl.textContent = defaults.grade_profile;
  }

  const transformMap = {
    'ep-scale': defaults.transform_scale,
    'ep-pos-x': defaults.transform_x,
    'ep-pos-y': defaults.transform_y,
  };
  Object.entries(transformMap).forEach(([id, value]) => {
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) el.textContent = Number(value).toFixed(1);
  });

  app.applyGrade();
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function segmentWidthPct() {
  return currentStages.length ? 100 / currentStages.length : 100;
}

function stageIndexForProgress(progressPct) {
  const n = currentStages.length;
  if (!n) return 0;
  return Math.max(0, Math.min(n - 1, Math.floor(progressPct / segmentWidthPct())));
}

function setPlayheadPosition(progressPct) {
  ['tl-ph', 'tl-rph'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.left = `${progressPct}%`;
  });

  const totalSeconds = Math.round((progressPct / 100) * NOMINAL_RUNTIME_SECONDS);
  const tc = document.getElementById('ep-tc');
  if (tc) tc.textContent = `00:${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}:00`;
}

/** Updates captions/bin/media for a stage without moving the playhead — used during continuous playback. */
function renderStageUI(app, i) {
  app.S.editStage = i;
  document.querySelectorAll('.bin-row').forEach((r, j) => r.classList.toggle('sel', j === i));
  document.querySelectorAll('.ep-stage').forEach(s => s.classList.remove('on'));
  document.getElementById(`es${i}`)?.classList.add('on');
  applyStageMedia(currentStages[i]);
}

/** Jumps directly to a stage (bin click, timeline click, next/prev buttons) — moves the playhead too. */
export function selectStage(app, i) {
  const n = currentStages.length;
  if (!n) return;
  const clamped = Math.max(0, Math.min(n - 1, i));

  app.S.editProg = clamped * segmentWidthPct();
  setPlayheadPosition(app.S.editProg);
  renderStageUI(app, clamped);
}

function stepStage(app, direction) {
  const n = currentStages.length;
  if (!n) return;
  const next = Math.max(0, Math.min(n - 1, app.S.editStage + direction));
  selectStage(app, next);
}

function scrubEdit(app, deltaPct) {
  const n = currentStages.length;
  if (!n) return;

  app.S.editProg = Math.max(0, Math.min(100, app.S.editProg + deltaPct));
  setPlayheadPosition(app.S.editProg);

  const newIndex = stageIndexForProgress(app.S.editProg);
  if (newIndex !== app.S.editStage) renderStageUI(app, newIndex);
}

function toggleEditPlay(app) {
  if (app.S.editPlaying) {
    stopEditPlayback(app);
  } else {
    startEditPlayback(app);
  }
}

function startEditPlayback(app) {
  if (!currentStages.length) return;
  // Reaching the end previously — start over from the beginning, like
  // pressing play again after a program finishes.
  if (app.S.editProg >= 100) {
    app.S.editProg = 0;
    setPlayheadPosition(0);
    renderStageUI(app, 0);
  }

  app.S.editPlaying = true;
  const btn = document.getElementById('ep-play');
  if (btn) btn.innerHTML = ICON_PAUSE;

  clearInterval(app.S.editTimer);
  app.S.editTimer = setInterval(() => {
    app.S.editProg = Math.min(100, app.S.editProg + PROG_PER_TICK);
    setPlayheadPosition(app.S.editProg);

    const newIndex = stageIndexForProgress(app.S.editProg);
    if (newIndex !== app.S.editStage) renderStageUI(app, newIndex);

    if (app.S.editProg >= 100) stopEditPlayback(app);
  }, TICK_MS);
}

function stopEditPlayback(app) {
  app.S.editPlaying = false;
  clearInterval(app.S.editTimer);
  const btn = document.getElementById('ep-play');
  if (btn) btn.innerHTML = ICON_PLAY;
}

/**
 * Renders whichever media type a stage has — image or video (the
 * timeline_stages.media_id column can point to either now). Falls back
 * to the decorative gradient when a stage has no media at all.
 */
function applyStageMedia(stage) {
  const grade = document.querySelector('.ep-grade');
  if (!grade) return;

  const existing = document.getElementById('ep-stage-media');
  const wantsVideo = stage?.mediaType === 'video';
  const wantsImage = stage?.mediaType === 'image';

  if (!stage?.mediaUrl) {
    if (existing) existing.style.display = 'none';
    return;
  }

  // If the existing element is the wrong tag for this stage's media type,
  // remove it and create the right one.
  if (existing && ((wantsVideo && existing.tagName !== 'VIDEO') || (wantsImage && existing.tagName !== 'IMG'))) {
    existing.remove();
  }

  let media = document.getElementById('ep-stage-media');
  if (!media) {
    media = document.createElement(wantsVideo ? 'video' : 'img');
    media.id = 'ep-stage-media';
    media.className = 'ep-grade-vid';
    if (wantsVideo) {
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
    } else {
      media.alt = '';
    }
    grade.insertBefore(media, grade.firstChild);
  }

  if (media.src !== stage.mediaUrl) media.src = stage.mediaUrl;
  media.style.display = '';
}

export function initPlayhead(app) {
  const cnt = document.getElementById('tl-cnt');
  if (!cnt) return;

  const movePH = clientX => {
    const r = cnt.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    app.S.editProg = p;
    setPlayheadPosition(p);

    const newIndex = stageIndexForProgress(p);
    if (newIndex !== app.S.editStage) renderStageUI(app, newIndex);
  };

  cnt.addEventListener('mousedown', e => {
    app.S.tlDrag = true;
    movePH(e.clientX);
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (app.S.tlDrag) movePH(e.clientX);
  }, { passive: true });
  document.addEventListener('mouseup', () => {
    app.S.tlDrag = false;
    document.body.style.userSelect = '';
  });

  // Touch equivalents — dragging the playhead previously only worked
  // with a mouse, so this was non-functional on mobile/tablet.
  cnt.addEventListener('touchstart', e => {
    app.S.tlDrag = true;
    movePH(e.touches[0].clientX);
  }, { passive: true });
  cnt.addEventListener('touchmove', e => {
    if (app.S.tlDrag) movePH(e.touches[0].clientX);
  }, { passive: true });
  cnt.addEventListener('touchend', () => {
    app.S.tlDrag = false;
  });
}

export function initSliders(app) {
  document.querySelectorAll('.sl-track').forEach(track => {
    const fill = track.querySelector('.sl-fill');
    const thumb = track.querySelector('.sl-thumb');
    let drag = false;

    const upd = clientX => {
      const r = track.getBoundingClientRect();
      const p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
      if (fill) fill.style.width = `${p}%`;
      if (thumb) thumb.style.left = `${p}%`;
      track.dataset.v = p;
      app.applyGrade();
    };

    track.addEventListener('mousedown', e => {
      drag = true;
      upd(e.clientX);
      e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (drag) upd(e.clientX);
    }, { passive: true });
    document.addEventListener('mouseup', () => {
      drag = false;
    });

    track.addEventListener('touchstart', e => {
      drag = true;
      upd(e.touches[0].clientX);
      e.stopPropagation();
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (drag) upd(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', () => {
      drag = false;
    });
  });
}

export function applyGrade(app) {
  const bg = document.getElementById('ep-bg');
  const media = document.getElementById('ep-stage-media');

  const g = p => {
    const el = document.querySelector(`.sl-track[data-p="${p}"]`);
    return el ? Number(el.dataset.v) : 50;
  };

  const bri = 0.5 + (g('exp') / 100) * 0.78;
  const con = 0.7 + (g('con') / 100) * 0.68;
  const sat = 0.2 + (g('sat') / 100) * 1.45;
  const hue = (g('tmp') - 50) * -0.38;
  const filter = `brightness(${bri}) contrast(${con}) saturate(${sat}) hue-rotate(${hue}deg)`;

  if (bg) bg.style.filter = filter;
  if (media) media.style.filter = filter;
}

// Ruler ticks are static regardless of stage count/content — decorative,
// unchanged from the original.
export function buildRuler() {
  const ruler = document.getElementById('tl-ruler');
  if (!ruler || ruler.childElementCount) return;

  for (let i = 0; i <= 8; i++) {
    const pct = (i / 8) * 100;
    const tk = document.createElement('div');
    tk.className = 'tl-tick mj';
    tk.style.left = `${pct}%`;
    ruler.appendChild(tk);
    if (i < 8) {
      const lb = document.createElement('span');
      lb.className = 'tl-tc';
      lb.style.left = `${pct}%`;
      lb.textContent = `0${Math.floor(i * 1.5)}:00`;
      ruler.appendChild(lb);

      const mn = document.createElement('div');
      mn.className = 'tl-tick mn';
      mn.style.left = `${pct + 6.25}%`;
      ruler.appendChild(mn);
    }
  }
}

// Decorative waveforms (V2/FX/A1/MX tracks) — unchanged, not tied to real content.
export function buildWaveforms() {
  ['mw1', 'mw2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.childElementCount) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 52; i++) {
      const b = document.createElement('div');
      b.className = 'mwb';
      b.style.cssText = `height:${Math.random() * 68 + 10}%;background:var(--green-hi)`;
      frag.appendChild(b);
    }
    el.appendChild(frag);
  });

  const mw3 = document.getElementById('mw3');
  if (mw3 && !mw3.childElementCount) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 76; i++) {
      const b = document.createElement('div');
      b.className = 'mwb';
      b.style.cssText = `height:${Math.random() * 66 + 10}%;background:var(--purple)`;
      frag.appendChild(b);
    }
    mw3.appendChild(frag);
  }
}
