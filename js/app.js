/* ═══════════════════════════════════════════════════════
   STUDIO THIRTY6 · Cinema OS · app.js
   Built from T36 content layer (data/content.js)
═══════════════════════════════════════════════════════ */
'use strict';

/* ── wait for DOM + content ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  CinemaOS.init();
});

const CinemaOS = {

  /* ── STATE ────────────────────────────────────────── */
  S: {
    mode: 0,
    rec: false, focusLocked: false,
    iso: 3200, ap: 1.8, ss: 50, wb: 5600,
    playClip: null, playing: false,
    playProg: 0, playTimer: null,
    editStage: 0, tlPct: 22, tlDrag: false,
    monOn: false, uiHidden: false, hudHidden: false,
    night: false, anamorphic: false, gleak: false, grain: false,
    konamiIdx: 0, cinemaBuf: '',
    isMobile: window.innerWidth <= 768,
  },

  ISO_S: [100,200,400,800,1600,3200,6400,12800],
  AP_S:  [1.4,1.8,2,2.8,4,5.6,8,11,16],
  WB_S:  [2500,2800,3200,4300,5600,6500,7500,9000],
  SS_S:  [24,30,48,50,60,96,100,120,180,200],
  MODES: ['SHOOT','PLAYBACK','ARCHIVE','EDIT','LENSES','TRANSMIT'],
  KONAMI: [38,38,40,40,37,39,37,39,66,65],
  PAGE_IDS: ['p-shoot','p-play','p-media','p-edit','p-lens','p-tx'],

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
  },

  /* ── BOOT ──────────────────────────────────────────── */
  boot() {
    const bootEl  = document.getElementById('boot');
    const camEl   = document.getElementById('cam');
    const rdyEl   = document.getElementById('boot-rdy');
    const seqEl   = document.getElementById('boot-seq');
    if (!bootEl || !T36?.BOOT_SEQUENCES) return;

    // pick random sequence
    const seqs = T36.BOOT_SEQUENCES;
    const seq  = seqs[Math.floor(Math.random() * seqs.length)];

    // build rows
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
          camEl.classList.add('on');
          setTimeout(() => bootEl.style.display = 'none', 520);
        }, 340);
        return;
      }
      rows[i].classList.add('show');
      const st = rows[i].querySelector('.bs');
      setTimeout(() => {
        st.textContent = 'OK';
        st.classList.add('ok');
        i++;
        setTimeout(step, 175);
      }, 240);
    };
    setTimeout(step, 160);
  },

  /* ── CURSOR ────────────────────────────────────────── */
  initCursor() {
    if (this.S.isMobile) return;
    const cur = document.getElementById('cur');
    document.addEventListener('mousemove', e => {
      cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    }, { passive: true });

    const bind = (sel, cls) => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.dataset.cursor = cls);
        el.addEventListener('mouseleave', () => delete document.body.dataset.cursor);
      });
    };

    // Apply cursor class based on data attribute
    const ob = new MutationObserver(() => {
      const cls = document.body.dataset.cursor || '';
      document.body.className = cls ? `c-${cls}` : '';
    });
    ob.observe(document.body, { attributes: true, attributeFilter: ['data-cursor'] });

    bind('.clip', 'play');
    bind('.tl-row,.tl-ruler', 'scrub');
    bind('.lens-card', 'focus');
    bind('.hs-ctrl', 'grab');
    bind('.sl-track', 'grab');
    bind('.mode-tab,.pf,.r-btn,.fp-btn,.epc,.tl-t,.tx-k,.sh-close,.r-btn-i', 'zoom');
    bind('.neg', 'zoom');
    bind('.txg-i,.txg-s,.txg-t', 'text');
  },

  /* ── TOAST ─────────────────────────────────────────── */
  initToast() { /* toast() called globally below */ },
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
    let f = (4*3600 + 17*60 + 22) * 24;
    const fmt = n => {
      const fr=n%24,s=Math.floor(n/24)%60,m=Math.floor(n/1440)%60,h=Math.floor(n/86400);
      return [h,m,s,fr].map(x=>String(x).padStart(2,'0')).join(':');
    };
    setInterval(() => {
      f++;
      const tc = fmt(f);
      const els = ['tb-tc','bb-tc','hud-tc'];
      els.forEach(id => { const el=document.getElementById(id); if(el) el.textContent=tc; });
    }, 1000/24);
  },

  /* ── MODE SWITCHING ────────────────────────────────── */
initModes() {
 document.querySelectorAll('.mode-tab').forEach(btn => {

    btn.addEventListener('click', () => {

        this.switchMode(+btn.dataset.m);

        if (window.innerWidth <= 768) {

            topNav.classList.remove("open");
            mobileBtn.classList.remove("open");

        }

    });

});
},

  switchMode(n) {
    if (n === this.S.mode) return;
    this.S.mode = n;
   this.PAGE_IDS.forEach((id, i) => {
    const el = document.getElementById(id);

    if (!el) return;

    console.log(id, i, n);

    if (i === n) {
        el.classList.add("on");
    } else {
        el.classList.remove("on");
    }
});
console.log("Visible page:", document.querySelector(".page.on")?.id);
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('on', +b.dataset.m === n));
    const bbMode = document.getElementById('bb-mode');
    if (bbMode) bbMode.textContent = this.MODES[n];
    this.toast(this.MODES[n]);
  },

  /* ── SHOOT / LIVE VIEW ─────────────────────────────── */
  initShoot() {
    const shoot   = document.getElementById('p-shoot');
    const fbox    = document.getElementById('focus-box');
    const hist    = document.querySelectorAll('.hh');
    const scope   = document.querySelectorAll('.sc');
    const bg      = document.getElementById('lv-bg');
    const img     = document.getElementById('lv-img');
    if (!shoot) return;

    // mouse reactive HUD
    shoot.addEventListener('mousemove', e => {
      const r = shoot.getBoundingClientRect();
      const rx = (e.clientX - r.left) / r.width;
      const ry = (e.clientY - r.top)  / r.height;
      if (!this.S.focusLocked) {
        fbox.style.left = (rx * 100) + '%';
        fbox.style.top  = (ry * 100) + '%';
      }
      hist.forEach((h,i) => {
        const p = Math.sin((i/hist.length + rx) * Math.PI) * 72 + 8;
        h.style.height = Math.max(4, p) + '%';
      });
      scope.forEach((sc,i) => {
        const h = 20 + (1-ry)*54 + Math.sin(i*1.1 + rx*4)*9;
        sc.style.height = Math.max(5, Math.min(86, h)) + '%';
      });
    }, { passive: true });

    // click = focus lock
    shoot.addEventListener('click', e => {
      if (e.target.closest('.hs-ctrl,.hud-rec,.lv-enter,.r-btn')) return;
      this.S.focusLocked = !this.S.focusLocked;
      fbox.classList.toggle('locked', this.S.focusLocked);
      this.toast(this.S.focusLocked ? 'AF LOCKED' : 'AF RELEASED');
    });

    // REC button
    const hudRec = document.getElementById('hud-rec');
    if (hudRec) hudRec.addEventListener('click', e => { e.stopPropagation(); this.toggleREC(); });

    // scroll to change exposure / wb / ss
    const bindScroll = (id, arr, get, set, render) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('wheel', e => {
        e.preventDefault(); e.stopPropagation();
        const cur = arr.indexOf(get());
        const next = Math.max(0, Math.min(arr.length-1, cur + (e.deltaY > 0 ? 1 : -1)));
        set(arr[next]);
        render(arr[next]);
        this.updateLV();
      }, { passive: false });
      el.addEventListener('mouseenter', () => this.toast('Scroll to adjust'));
    };

    bindScroll('h-iso', this.ISO_S, ()=>this.S.iso, v=>{this.S.iso=v;this._setTb('tb-iso',v);this._setTb('bb-iso',v);}, v=>this._hEl('h-iso',`ISO <span class="v">${v}</span>`));
    bindScroll('h-ap',  this.AP_S,  ()=>this.S.ap,  v=>{this.S.ap=v; this._setTb('tb-ap',v); this._setTb('bb-ap',v);},  v=>this._hEl('h-ap', `f/<span class="v">${v}</span>`));
    bindScroll('h-wb',  this.WB_S,  ()=>this.S.wb,  v=>{this.S.wb=v;}, v=>this._hEl('h-wb',`WB <span class="v">${v}K</span>`));
    bindScroll('h-ss',  this.SS_S,  ()=>this.S.ss,  v=>{this.S.ss=v;}, v=>this._hEl('h-ss',`1/<span class="v">${v}</span>s`));
  },

  _hEl(id, html) { const el=document.getElementById(id); if(el) el.innerHTML=html; },
  _setTb(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; },

  updateLV() {
    const bg = document.getElementById('lv-bg');
    const img = document.getElementById('lv-img');
    const grain = document.getElementById('lv-grain');
    if (!bg) return;
    const isoIdx = this.ISO_S.indexOf(this.S.iso);
    const wbIdx  = this.WB_S.indexOf(this.S.wb);
    const hue    = (wbIdx - (this.WB_S.length-1)/2) * -3.2;
    const bri    = 0.8 + isoIdx * 0.038;
    bg.style.filter  = `hue-rotate(${hue}deg) brightness(${Math.min(1.52, bri)})`;
    if (grain) grain.style.opacity = Math.max(0, (isoIdx-2)*0.06);
  },

  toggleREC() {
    this.S.rec = !this.S.rec;
    const btn   = document.getElementById('hud-rec');
    const dot   = document.getElementById('tb-recdot');
    const wrap  = document.getElementById('tb-rec');
    if (btn)  btn.classList.toggle('live', this.S.rec);
    if (dot)  dot.classList.toggle('live', this.S.rec);
    if (wrap) wrap.style.color = this.S.rec ? 'var(--red)' : 'var(--t3)';
    this.toast(this.S.rec ? '● RECORDING' : '■ STOPPED');
  },

  /* ── RAIL BUTTONS ──────────────────────────────────── */
  initRail() {
    const tog = (id, key, onFn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        this.S[key] = !this.S[key];
        el.classList.toggle('on', this.S[key]);
        onFn(this.S[key]);
      });
    };
    tog('rb-peak',  'peak',  on => { document.getElementById('lv-peak')?.classList.toggle('on',on);  this.toast(on?'Focus Peaking ON':'Focus Peaking OFF'); });
    tog('rb-zebra', 'zebra', on => { document.getElementById('lv-zebra')?.classList.toggle('on',on); this.toast(on?'Zebras ON':'Zebras OFF'); });
    tog('rb-false', 'false', on => { document.getElementById('lv-false')?.classList.toggle('on',on); this.toast(on?'False Colour ON':'False Colour OFF'); });
    tog('rb-safe',  'safe',  on => { document.getElementById('lv-safe')?.classList.toggle('on',on);  this.toast(on?'Safe Area ON':'Safe Area OFF'); });
    document.getElementById('rb-rec')?.addEventListener('click', () => this.toggleREC());
    document.getElementById('rb-hide')?.addEventListener('click', () => this.toggleUI());
    document.getElementById('rb-sh')?.addEventListener('click',  () => this.toggleShortcuts());
  },

  /* ── PLAYBACK ──────────────────────────────────────── */
  buildPlayback() {
    const grid = document.getElementById('pb-grid');
    if (!grid || !T36?.PROJECTS) return;

    T36.PROJECTS.forEach((p, i) => {
      const d = document.createElement('div');
      d.className = `clip ${p.still}`;
      d.dataset.cat = p.category;
      d.dataset.idx = i;
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.innerHTML = `
        <div class="clip-grain"></div>
        <div class="clip-idx">${String(p.id).padStart(3,'0')}</div>
        <div class="clip-tc">${p.duration}</div>
        <div class="clip-ov"><div class="clip-play"><svg viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12"/></svg></div></div>
        <div class="clip-wv" id="cw${i}"></div>
        <div class="clip-meta">
          <span class="clip-title">${p.title}</span>
          <span class="clip-spec">${p.lens} · ${p.fps} · ${p.codec}</span>
        </div>`;

      // Lazy video if available
      if (p.video) {
        const vid = document.createElement('video');
        vid.src = p.video;
        vid.poster = p.poster || '';
        vid.muted = true;
        vid.loop  = true;
        vid.playsInline = true;
        vid.preload = 'none'; // lazy — only loads when hovered
        d.appendChild(vid);

        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { vid.preload = 'metadata'; io.unobserve(d); } });
        }, { rootMargin: '200px' });
        io.observe(d);

        d.addEventListener('mouseenter', () => { vid.play().catch(()=>{}); });
        d.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime=0; });
      }

      // Waveform bars
      requestIdleCallback(() => {
        const wv = document.getElementById(`cw${i}`);
        if (!wv) return;
        const frag = document.createDocumentFragment();
        for (let j=0;j<44;j++) {
          const b=document.createElement('div');
          b.className='wvb';
          b.style.height=(Math.random()*70+10)+'%';
          frag.appendChild(b);
        }
        wv.appendChild(frag);
      });

      d.addEventListener('mouseenter', () => {
        const psFile = document.getElementById('ps-file');
        if (psFile) psFile.textContent = String(p.id).padStart(3,'0');
      });
      d.addEventListener('click', () => this.openClip(i));
      d.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') this.openClip(i); });
      grid.appendChild(d);
    });

    // filter tabs
    document.getElementById('pb-filters')?.addEventListener('click', e => {
      const btn = e.target.closest('.pf'); if(!btn) return;
      document.querySelectorAll('.pf').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.f;
      document.querySelectorAll('.clip').forEach(c => {
        const show = f==='all' || c.dataset.cat===f;
        c.style.opacity       = show ? '1'    : '0.12';
        c.style.pointerEvents = show ? 'all'  : 'none';
        c.style.transition    = 'opacity .18s';
      });
    });

    // fullscreen player controls
    document.getElementById('fp-close')?.addEventListener('click', () => this.closeClip());
    document.getElementById('fp-play')?.addEventListener('click',  () => this.togglePlay());
    document.getElementById('fp-next')?.addEventListener('click',  () => this.openClip((this.S.playClip+1) % T36.PROJECTS.length));
    document.getElementById('fp-prev')?.addEventListener('click',  () => this.openClip((this.S.playClip-1+T36.PROJECTS.length) % T36.PROJECTS.length));
    document.getElementById('fp-prog')?.addEventListener('click', e => {
      const r = e.currentTarget.getBoundingClientRect();
      this.S.playProg = (e.clientX - r.left) / r.width;
      const fill = document.getElementById('fp-fill');
      if (fill) fill.style.width = (this.S.playProg*100)+'%';
    });
  },

  openClip(idx) {
    const p = T36.PROJECTS[idx];
    if (!p) return;
    this.S.playClip = idx; this.S.playing = true;
    const fp = document.getElementById('fp');
    if (!fp) return;
    fp.classList.add('on');
    const fpBg = document.getElementById('fp-bg');
    if (fpBg) fpBg.className = `fp-bg ${p.still}`;

    // If real video available, play it
    if (p.video) {
      let vid = fp.querySelector('video');
      if (!vid) { vid = document.createElement('video'); vid.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;'; fp.querySelector('.fp-scr').appendChild(vid); }
      vid.src = p.video; vid.muted=false; vid.loop=true;
      vid.play().catch(()=>{});
    }

    const title = document.getElementById('fp-title');
    if (title) title.textContent = p.title;
    const playBtn = document.getElementById('fp-play');
    if (playBtn) playBtn.textContent = '⏸';
    this.startPlay();
  },

  closeClip() {
    const fp = document.getElementById('fp');
    fp?.classList.remove('on');
    fp?.querySelector('video')?.pause();
    this.S.playing=false; clearInterval(this.S.playTimer);
    this.S.playProg=0;
    const fill=document.getElementById('fp-fill'); if(fill) fill.style.width='0%';
  },

  togglePlay() {
    this.S.playing = !this.S.playing;
    const btn = document.getElementById('fp-play');
    if (btn) btn.textContent = this.S.playing ? '⏸' : '▶';
    this.S.playing ? this.startPlay() : clearInterval(this.S.playTimer);
    const vid = document.getElementById('fp')?.querySelector('video');
    if (vid) this.S.playing ? vid.play().catch(()=>{}) : vid.pause();
  },

  startPlay() {
    clearInterval(this.S.playTimer);
    this.S.playTimer = setInterval(() => {
      this.S.playProg = Math.min(1, this.S.playProg + .0014);
      const fill = document.getElementById('fp-fill');
      if (fill) fill.style.width = (this.S.playProg*100)+'%';
      const s = Math.floor(this.S.playProg*324);
      const tc = document.getElementById('fp-tc');
      if (tc) tc.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}:00`;
      if (this.S.playProg >= 1) this.S.playProg = 0;
    }, 100);
  },

  /* ── ARCHIVE / ABOUT ─────────────────────────────── */
  buildArchive() {
    const d = T36.STUDIO;
    if (!d) return;

    // contact sheet negatives
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

    // desk items
    const deskEl = document.getElementById('desk-items');
    if (deskEl) {
      deskEl.innerHTML = '';
      [
        ['Director · DP', d.director],
        ['Primary Camera', 'Thirty6 OS · FX-1'],
        ['Lenses', 'Supreme Prime Set'],
        ['Grade Suite', 'Thirty6 Edit OS'],
      ].forEach(([l,v]) => {
        const c = document.createElement('div');
        c.className='desk-c';
        c.innerHTML=`<div class="dc-l">${l}</div><div class="dc-v">${v}</div>`;
        deskEl.appendChild(c);
      });
    }

    // stats
    const statsEl = document.getElementById('ap-stats');
    if (statsEl && d.stats) {
      statsEl.innerHTML = '';
      d.stats.forEach(s => {
        const c = document.createElement('div');
        c.className='ap-stat';
        c.innerHTML=`<div class="as-n">${s.value}</div><div class="as-l">${s.label}</div>`;
        statsEl.appendChild(c);
      });
    }
  },

  /* ── EDIT ────────────────────────────────────────── */
  buildEdit() {
    if (!T36?.STUDIO?.process) return;
    const list = document.getElementById('bin-list');
    const stills=['s1','s2','s3','s4','s1','s5','s6','s2','s4'];

    T36.STUDIO.process.forEach((p,i) => {
      // bin row
      if (list) {
        const d=document.createElement('div');
        d.className='bin-row'+(i===0?' sel':'');
        d.dataset.i=i;
        d.innerHTML=`<div class="bin-sw ${stills[i]}"></div><div><div class="bin-name">0${i+1}_${p.title.replace(/[· ]/g,'_').toUpperCase()}</div><div class="bin-meta">${['Input','Research','Doc','Frames','OnSet','Assembly','Grade','Mix','Export'][i]||'Phase'}</div></div>`;
        d.addEventListener('click',()=>this.selectStage(i));
        list.appendChild(d);
      }
      // preview stage
      const stagesWrap = document.getElementById('ep-stages');
      if (stagesWrap) {
        const s=document.createElement('div');
        s.className='ep-stage'+(i===0?' on':'');
        s.id=`es${i}`;
        s.innerHTML=`<div class="ep-s-ti">${p.title}</div><div class="ep-s-de">${p.desc}</div>`;
        stagesWrap.appendChild(s);
      }
    });

    // mini waveforms
    ['mw1','mw2'].forEach(id=>{
      const el=document.getElementById(id); if(!el)return;
      const frag=document.createDocumentFragment();
      for(let i=0;i<52;i++){const b=document.createElement('div');b.className='mwb';b.style.cssText=`height:${Math.random()*68+10}%;background:var(--green-hi)`;frag.appendChild(b);}
      el.appendChild(frag);
    });
    const mw3=document.getElementById('mw3');
    if(mw3){const frag=document.createDocumentFragment();for(let i=0;i<76;i++){const b=document.createElement('div');b.className='mwb';b.style.cssText=`height:${Math.random()*66+10}%;background:var(--purple)`;frag.appendChild(b);}mw3.appendChild(frag);}

    // ruler ticks
    const ruler=document.getElementById('tl-ruler');
    if(ruler){
      for(let i=0;i<=8;i++){
        const pct=i/8*100;
        const tk=document.createElement('div');tk.className='tl-tick mj';tk.style.left=pct+'%';ruler.appendChild(tk);
        if(i<8){const lb=document.createElement('span');lb.className='tl-tc';lb.style.left=pct+'%';lb.textContent=`0${Math.floor(i*1.5)}:00`;ruler.appendChild(lb);}
        if(i<8){const mn=document.createElement('div');mn.className='tl-tick mn';mn.style.left=(pct+6.25)+'%';ruler.appendChild(mn);}
      }
    }

    // clip click
    document.querySelectorAll('.tl-clip').forEach(clip=>{
      clip.addEventListener('click',e=>{e.stopPropagation();this.selectStage(+(clip.dataset.i||0));});
    });

    // draggable playhead
    this.initPlayhead();

    // inspector sliders
    this.initSliders();
  },

  selectStage(i) {
    this.S.editStage=i;
    document.querySelectorAll('.bin-row').forEach((r,j)=>r.classList.toggle('sel',j===i));
    document.querySelectorAll('.ep-stage').forEach(s=>s.classList.remove('on'));
    document.getElementById(`es${i}`)?.classList.add('on');
    const pcts=[0,10,20,30,42,55,68,80,90];
    const p=pcts[i]||i*10;
    ['tl-ph','tl-rph'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.left=p+'%';});
    const tcs=['00:00:00:00','00:01:02:12','00:02:14:08','00:03:06:00','00:04:20:14','00:06:10:00','00:07:44:08','00:08:30:00','00:09:12:00'];
    const tc=document.getElementById('ep-tc');if(tc)tc.textContent=tcs[i]||'00:00:00:00';
  },

  initPlayhead() {
    const cnt=document.getElementById('tl-cnt');
    if(!cnt)return;
    const pcts=[0,10,20,30,42,55,68,80,90];
    const movePH=e=>{
      const r=cnt.getBoundingClientRect();
      const p=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
      ['tl-ph','tl-rph'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.left=p+'%';});
      const closest=pcts.reduce((a,v,i)=>Math.abs(v-p)<Math.abs(pcts[a]-p)?i:a,0);
      if(closest!==this.S.editStage)this.selectStage(closest);
    };
    cnt.addEventListener('mousedown',e=>{this.S.tlDrag=true;movePH(e);document.body.style.userSelect='none';});
    document.addEventListener('mousemove',e=>{if(this.S.tlDrag)movePH(e);},{passive:true});
    document.addEventListener('mouseup',()=>{this.S.tlDrag=false;document.body.style.userSelect='';});
  },

  initSliders() {
    document.querySelectorAll('.sl-track').forEach(track=>{
      const fill=track.querySelector('.sl-fill');
      const thumb=track.querySelector('.sl-thumb');
      let drag=false;
      const upd=e=>{
        const r=track.getBoundingClientRect();
        const p=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
        if(fill) fill.style.width=p+'%';
        if(thumb) thumb.style.left=p+'%';
        track.dataset.v=p;
        this.applyGrade();
      };
      track.addEventListener('mousedown',e=>{drag=true;upd(e);e.stopPropagation();});
      document.addEventListener('mousemove',e=>{if(drag)upd(e);},{passive:true});
      document.addEventListener('mouseup',()=>{drag=false;});
    });
  },

  applyGrade() {
    const bg=document.getElementById('ep-bg');
    if(!bg)return;
    const g=p=>{const el=document.querySelector(`.sl-track[data-p="${p}"]`);return el?+el.dataset.v:50;};
    const bri=0.5+(g('exp')/100)*.78;
    const con=0.7+(g('con')/100)*.68;
    const sat=0.2+(g('sat')/100)*1.45;
    const hue=(g('tmp')-50)*-.38;
    bg.style.filter=`brightness(${bri}) contrast(${con}) saturate(${sat}) hue-rotate(${hue}deg)`;
  },

  /* ── LENS CABINET ────────────────────────────────── */
  buildLenses() {
    const shelf=document.getElementById('lens-shelf');
    if(!shelf||!T36?.SERVICES)return;
    T36.SERVICES.forEach(l=>{
      const d=document.createElement('div');
      d.className='lens-card';
      d.innerHTML=`
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
  },

  /* ── TRANSMIT ─────────────────────────────────────── */
  initTransmit() {
    const nosig  = document.getElementById('tx-nosig');
    const form   = document.getElementById('tx-form');
    const txIn   = document.getElementById('tx-in');
    const txRes  = document.getElementById('tx-res');
    const txLive = document.getElementById('tx-live');
    const brief  = document.getElementById('tx-brief');
    const sub    = document.getElementById('tx-sub');

    const powerOn = () => {
      if (this.S.monOn) return;
      this.S.monOn = true;
      nosig?.classList.add('gone');
      form?.classList.add('on');
      if (txIn)  { txIn.textContent='SDI A · CONNECTED'; txIn.classList.add('on'); }
      if (txRes)  txRes.textContent='3840×2160 · 24p';
      if (txLive) txLive.style.display='flex';
      this.toast('Monitor connected');
    };

    document.querySelectorAll('.txg-i,.txg-s,.txg-t').forEach(el=>el.addEventListener('focus',powerOn));
    nosig?.addEventListener('click', powerOn);

    brief?.addEventListener('input', e => {
      const l = e.target.value.length;
      document.querySelectorAll('.txsb').forEach((b,i) => {
        b.style.height = (18 + Math.sin(l*.28+i)*30 + Math.random()*13) + '%';
      });
    });

    sub?.addEventListener('click', () => {
      sub.disabled=true;
      const msgs=['Rendering…','Encoding…','Uploading…','Transmission Complete ✓'];
      let i=0;
      const step=()=>{
        sub.textContent=msgs[i++];
        if(i<msgs.length) setTimeout(step,680);
        else setTimeout(()=>{
          this.toast(`Received · ${T36.STUDIO?.email||'hello@thirty6films.in'}`,3000);
          sub.textContent='Transmit →';
          sub.disabled=false;
        },800);
      };
      step();
    });
  },

  /* ── SCOPE ANIMATION ─────────────────────────────── */
  initScopes() {
    setInterval(() => {
      if (this.S.monOn) {
        document.querySelectorAll('.txsb').forEach(b => {
          b.style.height=(Math.random()*52+14)+'%';
          b.style.transition='height .5s';
        });
      }
      if (this.S.rec) {
        document.querySelectorAll('.sc').forEach(b => {
          b.style.height=(Math.random()*56+18)+'%';
          b.style.transition='height .32s';
        });
      }
    }, 860);
  },

  /* ── UI TOGGLES ──────────────────────────────────── */
  toggleUI() {
    this.S.uiHidden = !this.S.uiHidden;
    ['topbar','botbar','rail-l','rail-r'].forEach(id => {
      const el=document.getElementById(id); if(el) el.style.opacity=this.S.uiHidden?'0':'1';
    });
    document.getElementById('lv-hud')?.style && (document.getElementById('lv-hud').style.opacity=this.S.uiHidden?'0':'1');
    this.toast(this.S.uiHidden?'UI Hidden · H to restore':'UI Visible');
  },

  toggleShortcuts() {
    document.getElementById('shorts')?.classList.toggle('on');
  },

  toggleNight() {
    this.S.night=!this.S.night;
    document.body.classList.toggle('night',this.S.night);
    this.toast(this.S.night?'Night Mode activated':'Day Mode restored');
  },

  toggleAnamorphic() {
    this.S.anamorphic=!this.S.anamorphic;
    document.body.classList.toggle('anamorphic',this.S.anamorphic);
    this.toast(this.S.anamorphic?'Anamorphic · 2.39:1':'Spherical · 1.78:1');
  },

  toggleGrain() {
    this.S.grain=!this.S.grain;
    const g=document.getElementById('lv-grain');
    if(g) g.style.opacity=this.S.grain?'.34':'0';
    this.toast(this.S.grain?'Grain Mode ON':'Grain Mode OFF');
  },

  /* ── SHORTCUTS INIT ─────────────────────────────── */
  initShortcuts() {
    document.getElementById('sh-close')?.addEventListener('click', () => this.toggleShortcuts());
  },

  /* ── KEYBOARD ─────────────────────────────────────── */
  initKeyboard() {
    document.addEventListener('keydown', e => {
      const t = e.target.tagName;
      if (t==='INPUT'||t==='TEXTAREA'||t==='SELECT') {
        if(e.key==='Escape') e.target.blur();
        return;
      }

      // Konami code
      if (e.keyCode === this.KONAMI[this.S.konamiIdx]) {
        this.S.konamiIdx++;
        if (this.S.konamiIdx === this.KONAMI.length) { this.S.konamiIdx=0; this.toggleNight(); }
      } else { this.S.konamiIdx=0; }

      // "cinema" easter egg
      this.S.cinemaBuf += e.key.toLowerCase();
      if (this.S.cinemaBuf.length > 8) this.S.cinemaBuf = this.S.cinemaBuf.slice(-8);
      if (this.S.cinemaBuf.includes('cinema')) { this.S.cinemaBuf=''; this.toggleAnamorphic(); }

      const fp = document.getElementById('fp');
      const fpOpen = fp?.classList.contains('on');

      switch(e.key) {
        case ' ':
          e.preventDefault();
          if(this.S.mode===1 && this.S.playClip!==null) this.togglePlay();
          break;
        case 'j':case 'J':
          if(this.S.mode===1&&fpOpen){this.S.playProg=Math.max(0,this.S.playProg-.04);const f=document.getElementById('fp-fill');if(f)f.style.width=(this.S.playProg*100)+'%';}
          break;
        case 'k':case 'K':
          if(this.S.mode===1&&fpOpen){this.S.playing=false;clearInterval(this.S.playTimer);const b=document.getElementById('fp-play');if(b)b.textContent='▶';}
          break;
        case 'l':case 'L':
          if(this.S.mode===1&&fpOpen){this.S.playProg=Math.min(1,this.S.playProg+.04);const f=document.getElementById('fp-fill');if(f)f.style.width=(this.S.playProg*100)+'%';}
          else{this.S.gleak=!this.S.gleak;document.body.classList.toggle('gleak',this.S.gleak);this.toast(this.S.gleak?'Light Leak ON':'Light Leak OFF');}
          break;
        case 'ArrowLeft':
          if(this.S.mode===1&&fpOpen) this.openClip((this.S.playClip-1+T36.PROJECTS.length)%T36.PROJECTS.length);
          else this.switchMode(Math.max(0,this.S.mode-1));
          break;
        case 'ArrowRight':
          if(this.S.mode===1&&fpOpen) this.openClip((this.S.playClip+1)%T36.PROJECTS.length);
          else this.switchMode(Math.min(5,this.S.mode+1));
          break;
        case 'f':case 'F':
          if(this.S.mode===1&&!fpOpen) this.openClip(this.S.playClip??0);
          break;
        case 'Escape':
          if(document.getElementById('shorts')?.classList.contains('on')){this.toggleShortcuts();break;}
          if(fpOpen){this.closeClip();break;}
          break;
        case 'r':case 'R': this.toggleREC(); break;
        case 'h':case 'H': this.toggleUI(); break;
        case 'g':case 'G': this.toggleGrain(); break;
        case 'd':case 'D': this.toast('"Every frame is a decision, not an accident." — Studio Thirty6',3500); break;
        case '?': this.toggleShortcuts(); break;
        case 'Tab': e.preventDefault(); this.toggleUI(); break;
        case '1': this.switchMode(0); break;
        case '2': this.switchMode(1); break;
        case '3': this.switchMode(2); break;
        case '4': this.switchMode(3); break;
        case '5': this.switchMode(4); break;
        case '6': this.switchMode(5); break;
      }
      if(e.ctrlKey && e.key==='s'){e.preventDefault();this.toast('Project saved · Thirty6_2025.t36',2500);}
    });
  },

  /* ── RESIZE ──────────────────────────────────────── */
  initResize() {
    window.addEventListener('resize', () => {
      this.S.isMobile = window.innerWidth <= 768;
    }, { passive: true });
  },

};

/* ── Global toast shortcut ─────────────────────────── */
window.T36toast = (msg, dur) => CinemaOS.toast(msg, dur);

const mobileBtn = document.getElementById("mobile-menu-btn");
const topNav = document.querySelector(".top-nav");

if (mobileBtn && topNav) {

mobileBtn.addEventListener("click", () => {

    topNav.classList.toggle("open");

    mobileBtn.classList.toggle("open");

});
document.addEventListener("click",(e)=>{

    if(
        topNav.classList.contains("open") &&
        !topNav.contains(e.target) &&
        !mobileBtn.contains(e.target)
    ){

        topNav.classList.remove("open");
        mobileBtn.classList.remove("open");

    }

});
}