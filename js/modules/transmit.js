import { supabase } from './supabase-client.js';

let currentContent = { success_message: 'Transmission received.', destination_email: null };

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

  sub?.addEventListener('click', () => handleSubmit(app, sub));
}

async function handleSubmit(app, sub) {
  const name = document.getElementById('tx-name')?.value.trim();
  const email = document.getElementById('tx-email')?.value.trim();
  const service = document.getElementById('tx-service')?.value || null;
  const timeline = document.getElementById('tx-timeline')?.value || null;
  const briefText = document.getElementById('tx-brief')?.value.trim() || null;

  if (!name) return app.toast('Add your name first');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return app.toast('Add a valid email first');

  sub.disabled = true;
  const msgs = ['Rendering…', 'Encoding…', 'Uploading…'];
  let i = 0;
  const step = setInterval(() => {
    if (i < msgs.length) sub.textContent = msgs[i++];
  }, 500);

  try {
    if (!supabase) throw new Error('Not configured');
    const { error } = await supabase
      .from('inquiries')
      .insert([{ name, email, service, timeline, brief: briefText }]);
    if (error) throw error;

    clearInterval(step);
    sub.textContent = 'Transmission Complete ✓';
    app.toast(currentContent.success_message || 'Transmission received.', 3200);

    document.querySelectorAll('.txg-i,.txg-t').forEach(el => (el.value = ''));
    document.querySelectorAll('.txg-s').forEach(el => (el.value = ''));

    setTimeout(() => {
      sub.textContent = 'Transmit →';
      sub.disabled = false;
    }, 1400);
  } catch (err) {
    clearInterval(step);
    console.error('[T36] Inquiry submission failed:', err);
    app.toast("Couldn't send — please try again or email us directly.", 3200);
    sub.textContent = 'Transmit →';
    sub.disabled = false;
  }
}

/**
 * Applies CMS-driven content (page_content: transmit/content) plus the
 * live `services` list to the Transmit form.
 */
export function applyTransmitContent(app, content = {}, services = []) {
  currentContent = { ...currentContent, ...content };

  const h = document.getElementById('tx-h');
  if (h) {
    h.textContent = '';
    if (content.headline_line1) h.appendChild(document.createTextNode(content.headline_line1));
    if (content.headline_line2) {
      h.appendChild(document.createElement('br'));
      h.appendChild(document.createTextNode(content.headline_line2));
    }
    if (content.headline_bold) {
      h.appendChild(document.createElement('br'));
      const strong = document.createElement('strong');
      strong.textContent = content.headline_bold;
      h.appendChild(strong);
    }
  }

  const desc = document.getElementById('tx-desc');
  if (desc) desc.textContent = content.description || '';

  const emailLink = document.getElementById('tx-email-link');
  if (emailLink && content.email) {
    emailLink.textContent = content.email;
    emailLink.href = `mailto:${content.email}`;
  }

  const location = document.getElementById('tx-location');
  if (location) location.textContent = content.location || '';

  const serviceSelect = document.getElementById('tx-service');
  if (serviceSelect) {
    services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.title;
      opt.textContent = s.title;
      serviceSelect.appendChild(opt);
    });
  }

  const timelineSelect = document.getElementById('tx-timeline');
  if (timelineSelect && Array.isArray(content.timeline_options)) {
    content.timeline_options.forEach(label => {
      const opt = document.createElement('option');
      opt.textContent = label;
      timelineSelect.appendChild(opt);
    });
  }

  applyBackgroundMedia(content);
}

function applyBackgroundMedia(content) {
  const container = document.getElementById('tx-bg-media');
  if (!container) return;

  if (content.background_video_url) {
    const video = document.createElement('video');
    video.src = content.background_video_url;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    container.appendChild(video);
  } else if (content.background_image_url) {
    const img = document.createElement('img');
    img.src = content.background_image_url;
    img.alt = '';
    container.appendChild(img);
  }
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
