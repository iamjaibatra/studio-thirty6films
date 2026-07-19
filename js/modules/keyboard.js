import { ICON_PLAY } from './icons.js';

export function initKeyboard(app) {
  document.addEventListener('keydown', e => {
    const t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }

    if (e.keyCode === app.KONAMI[app.S.konamiIdx]) {
      app.S.konamiIdx++;
      if (app.S.konamiIdx === app.KONAMI.length) {
        app.S.konamiIdx = 0;
        app.toggleNight();
      }
    } else {
      app.S.konamiIdx = 0;
    }

    app.S.cinemaBuf += e.key.toLowerCase();
    if (app.S.cinemaBuf.length > 8) app.S.cinemaBuf = app.S.cinemaBuf.slice(-8);
    if (app.S.cinemaBuf.includes('cinema')) {
      app.S.cinemaBuf = '';
      app.toggleAnamorphic();
    }

    const fp = document.getElementById('fp');
    const fpOpen = fp?.classList.contains('on');

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (app.S.mode === 1 && app.S.playClip !== null) app.togglePlay();
        break;
      case 'j':
      case 'J':
        if (app.S.mode === 1 && fpOpen) {
          const vid = fp.querySelector('video');
          if (vid && vid.duration) {
            vid.currentTime = Math.max(0, vid.currentTime - vid.duration * 0.04);
          } else {
            app.S.playProg = Math.max(0, app.S.playProg - 0.04);
            const f = document.getElementById('fp-fill');
            if (f) f.style.width = `${app.S.playProg * 100}%`;
          }
        }
        break;
      case 'k':
      case 'K':
        if (app.S.mode === 1 && fpOpen) {
          app.S.playing = false;
          clearInterval(app.S.playTimer);
          fp.querySelector('video')?.pause();
          const b = document.getElementById('fp-play');
          if (b) b.innerHTML = ICON_PLAY;
        }
        break;
      case 'l':
      case 'L':
        if (app.S.mode === 1 && fpOpen) {
          const vid = fp.querySelector('video');
          if (vid && vid.duration) {
            vid.currentTime = Math.min(vid.duration, vid.currentTime + vid.duration * 0.04);
          } else {
            app.S.playProg = Math.min(1, app.S.playProg + 0.04);
            const f = document.getElementById('fp-fill');
            if (f) f.style.width = `${app.S.playProg * 100}%`;
          }
        } else {
          app.S.gleak = !app.S.gleak;
          document.body.classList.toggle('gleak', app.S.gleak);
          app.toast(app.S.gleak ? 'Light Leak ON' : 'Light Leak OFF');
        }
        break;
      case 'ArrowLeft':
        if (app.S.mode === 1 && fpOpen) {
          app.openClip((app.S.playClip - 1 + window.T36.PROJECTS.length) % window.T36.PROJECTS.length);
        } else if (!fpOpen) {
          app.switchMode(Math.max(0, app.S.mode - 1));
        }
        break;
      case 'ArrowRight':
        if (app.S.mode === 1 && fpOpen) {
          app.openClip((app.S.playClip + 1) % window.T36.PROJECTS.length);
        } else if (!fpOpen) {
          app.switchMode(Math.min(5, app.S.mode + 1));
        }
        break;
      case 'f':
      case 'F':
        if (app.S.mode === 1 && !fpOpen) app.openClip(app.S.playClip ?? 0);
        break;
      case 'Escape':
        if (document.getElementById('shorts')?.classList.contains('on')) {
          app.toggleShortcuts();
          break;
        }
        if (fpOpen) {
          app.closeClip();
          break;
        }
        break;
      case 'r':
      case 'R':
        app.toggleREC();
        break;
      case 'h':
      case 'H':
        app.toggleUI();
        break;
      case 'g':
      case 'G':
        app.toggleGrain();
        break;
      case 'd':
      case 'D':
        app.toast('"Every frame is a decision, not an accident." — Studio Thirty6', 3500);
        break;
      case '?':
        app.toggleShortcuts();
        break;
      case 'Tab':
        e.preventDefault();
        app.toggleUI();
        break;
      case '1':
        app.switchMode(0);
        break;
      case '2':
        app.switchMode(1);
        break;
      case '3':
        app.switchMode(2);
        break;
      case '4':
        app.switchMode(3);
        break;
      case '5':
        app.switchMode(4);
        break;
      case '6':
        app.switchMode(5);
        break;
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      app.toast('Project saved · Thirty6_2025.t36', 2500);
    }
  });
}
