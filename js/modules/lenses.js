export function buildLenses() {
  const shelf = document.getElementById('lens-shelf');
  if (!shelf || !window.T36?.SERVICES) return;

  window.T36.SERVICES.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lens-card';
    d.innerHTML = `
      <div class="lens-vis">
        <div class="l-flare"></div><div class="l-gloss"></div>
        <div class="lens-optic">
          <div class="lo"></div><div class="lo"></div>
          <div class="lo"></div><div class="lo"></div>
          <div class="lo-c"><span class="lo-f">${l.focal}</span></div>
        </div>
      </div>
      <div class="lens-body">
        <div class="lb-sp">${l.spec}</div>
        <div class="lb-ti">${l.title}</div>
        <div class="lb-de">${l.description}</div>
        <div class="lb-mt">
          <div class="lm">Format<br><span>${l.format}</span></div>
          <div class="lm">Duration<br><span>${l.duration}</span></div>
          <div class="lm">DOF<br><span>${l.dof}</span></div>
        </div>
      </div>`;
    shelf.appendChild(d);
  });
}
