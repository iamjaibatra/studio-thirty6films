export function buildEdit(app) {
  if (!window.T36?.STUDIO?.process) return;

  const list = document.getElementById('bin-list');
  const stills = ['s1', 's2', 's3', 's4', 's1', 's5', 's6', 's2', 's4'];

  window.T36.STUDIO.process.forEach((p, i) => {
    if (list) {
      const d = document.createElement('div');
      d.className = `bin-row${i === 0 ? ' sel' : ''}`;
      d.dataset.i = i;
      d.innerHTML = `<div class="bin-sw ${stills[i]}"></div><div><div class="bin-name">0${i + 1}_${p.title.replace(/[· ]/g, '_').toUpperCase()}</div><div class="bin-meta">${['Input', 'Research', 'Doc', 'Frames', 'OnSet', 'Assembly', 'Grade', 'Mix', 'Export'][i] || 'Phase'}</div></div>`;
      d.addEventListener('click', () => app.selectStage(i));
      list.appendChild(d);
    }

    const stagesWrap = document.getElementById('ep-stages');
    if (stagesWrap) {
      const s = document.createElement('div');
      s.className = `ep-stage${i === 0 ? ' on' : ''}`;
      s.id = `es${i}`;
      s.innerHTML = `<div class="ep-s-ti">${p.title}</div><div class="ep-s-de">${p.desc}</div>`;
      stagesWrap.appendChild(s);
    }
  });

  ['mw1', 'mw2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
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
  if (mw3) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 76; i++) {
      const b = document.createElement('div');
      b.className = 'mwb';
      b.style.cssText = `height:${Math.random() * 66 + 10}%;background:var(--purple)`;
      frag.appendChild(b);
    }
    mw3.appendChild(frag);
  }

  const ruler = document.getElementById('tl-ruler');
  if (ruler) {
    for (let i = 0; i <= 8; i++) {
      const pct = i / 8 * 100;
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
      }
      if (i < 8) {
        const mn = document.createElement('div');
        mn.className = 'tl-tick mn';
        mn.style.left = `${pct + 6.25}%`;
        ruler.appendChild(mn);
      }
    }
  }

  document.querySelectorAll('.tl-clip').forEach(clip => {
    clip.addEventListener('click', e => {
      e.stopPropagation();
      app.selectStage(Number(clip.dataset.i || 0));
    });
  });

  app.initPlayhead();
  app.initSliders();
}

export function selectStage(app, i) {
  app.S.editStage = i;
  document.querySelectorAll('.bin-row').forEach((r, j) => r.classList.toggle('sel', j === i));
  document.querySelectorAll('.ep-stage').forEach(s => s.classList.remove('on'));
  document.getElementById(`es${i}`)?.classList.add('on');

  const pcts = [0, 10, 20, 30, 42, 55, 68, 80, 90];
  const p = pcts[i] || i * 10;
  ['tl-ph', 'tl-rph'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.left = `${p}%`;
  });

  const tcs = ['00:00:00:00', '00:01:02:12', '00:02:14:08', '00:03:06:00', '00:04:20:14', '00:06:10:00', '00:07:44:08', '00:08:30:00', '00:09:12:00'];
  const tc = document.getElementById('ep-tc');
  if (tc) tc.textContent = tcs[i] || '00:00:00:00';
}

export function initPlayhead(app) {
  const cnt = document.getElementById('tl-cnt');
  if (!cnt) return;

  const pcts = [0, 10, 20, 30, 42, 55, 68, 80, 90];
  const movePH = e => {
    const r = cnt.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    ['tl-ph', 'tl-rph'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.left = `${p}%`;
    });
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
  if (!bg) return;

  const g = p => {
    const el = document.querySelector(`.sl-track[data-p="${p}"]`);
    return el ? Number(el.dataset.v) : 50;
  };

  const bri = 0.5 + (g('exp') / 100) * 0.78;
  const con = 0.7 + (g('con') / 100) * 0.68;
  const sat = 0.2 + (g('sat') / 100) * 1.45;
  const hue = (g('tmp') - 50) * -0.38;
  bg.style.filter = `brightness(${bri}) contrast(${con}) saturate(${sat}) hue-rotate(${hue}deg)`;
}
