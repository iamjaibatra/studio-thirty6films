export function buildArchive() {
  const d = window.T36.STUDIO;
  if (!d) return;

  const csGrid = document.getElementById('cs-grid');
  if (csGrid && d.archive) {
    csGrid.innerHTML = '';
    d.archive.forEach(a => {
      const neg = document.createElement('div');
      neg.className = 'neg';
      neg.innerHTML = `
        <div class="neg-neg ${a.neg}"></div>
        <div class="neg-pos ${a.pos}"></div>
        <div class="neg-info">
          <div class="ni"><span>Lens</span> ${a.lens}</div>
          <div class="ni"><span>Location</span> ${a.location}</div>
          <div class="ni"><span>ASA</span> ${a.asa} · <span>${a.shutter}</span></div>
        </div>
        <div class="neg-num">${a.num}</div>`;
      csGrid.appendChild(neg);
    });
  }

  const deskEl = document.getElementById('desk-items');
  if (deskEl) {
    deskEl.innerHTML = '';
    [
      ['Director · DP', d.director],
      ['Primary Camera', 'Thirty6 OS · FX-1'],
      ['Lenses', 'Supreme Prime Set'],
      ['Grade Suite', 'Thirty6 Edit OS'],
    ].forEach(([label, value]) => {
      const c = document.createElement('div');
      c.className = 'desk-c';
      c.innerHTML = `<div class="dc-l">${label}</div><div class="dc-v">${value}</div>`;
      deskEl.appendChild(c);
    });
  }

  const statsEl = document.getElementById('ap-stats');
  if (statsEl && d.stats) {
    statsEl.innerHTML = '';
    d.stats.forEach(s => {
      const c = document.createElement('div');
      c.className = 'ap-stat';
      c.innerHTML = `<div class="as-n">${s.value}</div><div class="as-l">${s.label}</div>`;
      statsEl.appendChild(c);
    });
  }
}
