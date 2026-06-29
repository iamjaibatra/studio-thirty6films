export function initTransmit(app) {
  const nosig = document.getElementById('tx-nosig');
  const form = document.getElementById('tx-form');
  const txIn = document.getElementById('tx-in');
  const txRes = document.getElementById('tx-res');
  const txLive = document.getElementById('tx-live');
  const brief = document.getElementById('tx-brief');
  const sub = document.getElementById('tx-sub');

  const powerOn = () => {
    if (app.S.monOn) return;
    app.S.monOn = true;
    nosig?.classList.add('gone');
    form?.classList.add('on');
    if (txIn) {
      txIn.textContent = 'SDI A · CONNECTED';
      txIn.classList.add('on');
    }
    if (txRes) txRes.textContent = '3840×2160 · 24p';
    if (txLive) txLive.style.display = 'flex';
    app.toast('Monitor connected');
  };

  document.querySelectorAll('.txg-i,.txg-s,.txg-t').forEach(el => el.addEventListener('focus', powerOn));
  nosig?.addEventListener('click', powerOn);

  brief?.addEventListener('input', e => {
    const l = e.target.value.length;
    document.querySelectorAll('.txsb').forEach((b, i) => {
      b.style.height = `${18 + Math.sin(l * 0.28 + i) * 30 + Math.random() * 13}%`;
    });
  });

  sub?.addEventListener('click', () => {
    sub.disabled = true;
    const msgs = ['Rendering…', 'Encoding…', 'Uploading…', 'Transmission Complete ✓'];
    let i = 0;
    const step = () => {
      sub.textContent = msgs[i++];
      if (i < msgs.length) {
        setTimeout(step, 680);
      } else {
        setTimeout(() => {
          app.toast(`Received · ${window.T36.STUDIO?.email || 'hello@thirty6films.in'}`, 3000);
          sub.textContent = 'Transmit →';
          sub.disabled = false;
        }, 800);
      }
    };
    step();
  });
}

export function initScopes(app) {
  setInterval(() => {
    if (app.S.monOn) {
      document.querySelectorAll('.txsb').forEach(b => {
        b.style.height = `${Math.random() * 52 + 14}%`;
        b.style.transition = 'height .5s';
      });
    }
    if (app.S.rec) {
      document.querySelectorAll('.sc').forEach(b => {
        b.style.height = `${Math.random() * 56 + 18}%`;
        b.style.transition = 'height .32s';
      });
    }
  }, 860);
}
