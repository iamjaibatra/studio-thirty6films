const BIN_STILLS = ['s1', 's2', 's3', 's4', 's1', 's5', 's6', 's2', 's4', 's3']; // cycles for any stage count
const NOMINAL_RUNTIME_SECONDS = 9 * 60 + 24; // ~09:24, matches the original decorative timecode range

let currentStages = [];

export function buildEdit(app) {
  // Setup that doesn't depend on CMS data — runs at init time regardless.
  // Actual stage/timeline content comes later via applyEditContent()
  // once page_content + timeline_stages load (see app.js).
  buildRuler();
  buildWaveforms();
  bindStaticTimelineClips(app);
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
 * Applies CMS-driven content: the project bin, preview monitor
 * captions, the V1 timeline track, and the grader panel's default
 * values. The V2/FX/A1/MX tracks stay as decorative NLE-suite dressing —
 * they were never tied to real distinct content, only the 9 stages were.
 */
export function applyEditContent(app, stages = [], graderDefaults = {}) {
  currentStages = stages;

  renderBin(app, stages);
  renderStageCaptions(stages);
  renderTimelineTrack(app, stages);
  applyGraderDefaults(app, graderDefaults);

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

export function selectStage(app, i) {
  app.S.editStage = i;
  document.querySelectorAll('.bin-row').forEach((r, j) => r.classList.toggle('sel', j === i));
  document.querySelectorAll('.ep-stage').forEach(s => s.classList.remove('on'));
  document.getElementById(`es${i}`)?.classList.add('on');

  const n = currentStages.length || 1;
  const p = n > 1 ? (i / (n - 1)) * 100 : 0;
  ['tl-ph', 'tl-rph'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.left = `${p}%`;
  });

  const totalSeconds = Math.round((p / 100) * NOMINAL_RUNTIME_SECONDS);
  const tc = document.getElementById('ep-tc');
  if (tc) tc.textContent = `00:${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}:00`;

  applyStageVideo(currentStages[i]);
}

function applyStageVideo(stage) {
  const grade = document.querySelector('.ep-grade');
  if (!grade) return;

  let video = document.getElementById('ep-video');
  if (stage?.videoUrl) {
    if (!video) {
      video = document.createElement('video');
      video.id = 'ep-video';
      video.className = 'ep-grade-vid';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      grade.insertBefore(video, grade.firstChild);
    }
    if (video.src !== stage.videoUrl) video.src = stage.videoUrl;
    video.style.display = '';
  } else if (video) {
    video.style.display = 'none';
  }
}

export function initPlayhead(app) {
  const cnt = document.getElementById('tl-cnt');
  if (!cnt) return;

  const movePH = e => {
    const r = cnt.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    ['tl-ph', 'tl-rph'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.left = `${p}%`;
    });
    const n = currentStages.length || 1;
    const pcts = currentStages.map((_, idx) => (n > 1 ? (idx / (n - 1)) * 100 : 0));
    const closest = pcts.reduce((acc, value, index) => Math.abs(value - p) < Math.abs(pcts[acc] - p) ? index : acc, 0);
    if (closest !== app.S.editStage) app.selectStage(closest);
  };

  cnt.addEventListener('mousedown', e => {
    app.S.tlDrag = true;
    movePH(e);
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (app.S.tlDrag) movePH(e);
  }, { passive: true });
  document.addEventListener('mouseup', () => {
    app.S.tlDrag = false;
    document.body.style.userSelect = '';
  });
}

export function initSliders(app) {
  document.querySelectorAll('.sl-track').forEach(track => {
    const fill = track.querySelector('.sl-fill');
    const thumb = track.querySelector('.sl-thumb');
    let drag = false;

    const upd = e => {
      const r = track.getBoundingClientRect();
      const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      if (fill) fill.style.width = `${p}%`;
      if (thumb) thumb.style.left = `${p}%`;
      track.dataset.v = p;
      app.applyGrade();
    };

    track.addEventListener('mousedown', e => {
      drag = true;
      upd(e);
      e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (drag) upd(e);
    }, { passive: true });
    document.addEventListener('mouseup', () => {
      drag = false;
    });
  });
}

export function applyGrade(app) {
  const bg = document.getElementById('ep-bg');
  const video = document.getElementById('ep-video');

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
  if (video) video.style.filter = filter;
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
