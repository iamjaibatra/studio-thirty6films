export function bootApp(app) {
  const bootEl = document.getElementById('boot');
  const camEl = document.getElementById('cam');
  const rdyEl = document.getElementById('boot-rdy');
  const seqEl = document.getElementById('boot-seq');

  if (!bootEl || !seqEl || !rdyEl || !window.T36?.BOOT_SEQUENCES) return;

  const seqs = window.T36.BOOT_SEQUENCES;
  const seq = seqs[Math.floor(Math.random() * seqs.length)];

  seqEl.innerHTML = '';
  seq.forEach(msg => {
    const row = document.createElement('div');
    row.className = 'boot-row';
    row.innerHTML = `<span class="bl">${msg}</span><span class="bs">···</span>`;
    seqEl.appendChild(row);
  });

  let i = 0;
  const rows = seqEl.querySelectorAll('.boot-row');
  const step = () => {
    if (i >= rows.length) {
      rdyEl.style.opacity = '1';
      setTimeout(() => {
        bootEl.classList.add('out');
        camEl?.classList.add('on');
        setTimeout(() => {
          bootEl.style.display = 'none';
        }, 520);
      }, 340);
      return;
    }

    rows[i].classList.add('show');
    const st = rows[i].querySelector('.bs');
    setTimeout(() => {
      if (st) {
        st.textContent = 'OK';
        st.classList.add('ok');
      }
      i++;
      setTimeout(step, 175);
    }, 240);
  };

  setTimeout(step, 160);
}
