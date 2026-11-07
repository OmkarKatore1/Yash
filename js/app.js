(() => {
  const $ = (s) => document.querySelector(s);
  const C = CONFIG;
  const secs = [...document.querySelectorAll('.sec')];
  let cur = 0, unlocked = false;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- text from config ---------- */
  const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const age = (() => { const b = new Date(C.birthday), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; })();
  const turning = (() => { const b = new Date(C.birthday), n = new Date(); const t = n.getFullYear() - b.getFullYear(); return n > new Date(n.getFullYear(), b.getMonth(), b.getDate() + 3) ? age : t; })();
  $('#herName').textContent = C.name;
  $('#greeting').textContent = C.greeting;
  $('#subtitle').textContent = C.subtitle;
  $('#bdayTitle').textContent = `Happy ${ordinal(turning)} Birthday`;
  $('#cakeMsg').textContent = C.birthdayMessage;
  $('#finalTitle').textContent = C.finalTitle;
  $('#finalMsg').textContent = C.finalMessage;
  $('#sign').textContent = `Forever yours, your Yashh`;

  /* ---------- floating hearts and sparkles ---------- */
  const fx = $('#fx');
  const count = innerWidth < 600 ? 8 : 13;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'heart' + (i % 3 === 0 ? ' blur' : '');
    h.textContent = '♥';
    h.style.cssText = `left:${rand(0, 100)}%;font-size:${rand(14, 46)}px;animation-duration:${rand(14, 24)}s;animation-delay:${rand(-24, 0)}s;--dx:${rand(-60, 60)}px;--r:${rand(-40, 40)}deg`;
    fx.appendChild(h);
  }
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.cssText = `left:${rand(0, 100)}%;animation-duration:${rand(12, 22)}s;animation-delay:${rand(-16, 0)}s;--dx:${rand(-30, 30)}px;--r:0deg`;
    fx.appendChild(s);
  }

  /* ---------- confetti ---------- */
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  let parts = [], running = false;
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  const cols = ['#ff5d7a', '#ffd9a0', '#c1121f', '#fff1ea', '#ff9eb0', '#ffb02e'];
  function confetti(n = 150) {
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + rand(-60, 60), y: innerHeight * .55, vx: rand(-7, 7), vy: rand(-15, -4), g: .22, s: rand(5, 11), c: cols[i % cols.length], r: rand(0, 6), vr: rand(-.2, .2), h: Math.random() < .3 });
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.y < cv.height + 20);
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.h) { ctx.font = p.s * 2 + 'px serif'; ctx.fillText('♥', -p.s, p.s); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* ---------- navigation ---------- */
  const dots = $('#dots');
  secs.forEach(() => dots.appendChild(document.createElement('i')));
  function show(i) {
    i = Math.max(0, Math.min(secs.length - 1, i));
    secs[cur].classList.remove('active');
    cur = i; secs[i].classList.add('active'); secs[i].scrollTop = 0;
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
    document.documentElement.dataset.theme = i;
    [...$('#bg').children].forEach((l, k) => l.classList.toggle('on', k === i));
    $('#prev').disabled = i === 0; $('#next').disabled = i === secs.length - 1;
    if (i === 2) renderGallery();
    if (i === 5) setTimeout(() => confetti(110), 500);
  }
  $('#prev').onclick = () => show(cur - 1);
  $('#next').onclick = () => show(cur + 1);
  let tx = 0;
  addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (unlocked && Math.abs(d) > 90 && $('#lb').hidden) show(cur + (d < 0 ? 1 : -1)); }, { passive: true });
  addEventListener('keydown', e => { if (!unlocked) return; if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });

  /* ---------- music (one persistent <audio>, never restarted) ---------- */
  const audio = $('#audio'), eq = $('#eq'), btn = $('#musicBtn');
  audio.volume = .5;
  const sync = () => { eq.classList.toggle('play', !audio.paused); btn.textContent = audio.paused ? '▶' : '❚❚'; };
  audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
  btn.onclick = () => audio.paused ? audio.play().catch(() => {}) : audio.pause();
  $('#vol').oninput = e => audio.volume = e.target.value;
  audio.addEventListener('error', () => { $('#music').style.display = 'none'; });
  sync();

  $('#enter').onclick = () => {
    unlocked = true;
    audio.play().catch(() => {});
    $('#music').classList.add('on'); $('#nav').hidden = false;
    show(1);
  };

  /* ---------- birthday cake (tap only) ---------- */
  const candles = $('#candles');
  const cs = () => [...candles.children];
  let done = false;
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('div'); c.className = 'candle';
    c.innerHTML = '<div class="flame"></div>';
    c.onclick = () => { c.classList.add('out'); check(); };
    candles.appendChild(c);
  }
  function check() {
    if (done || cs().some(c => !c.classList.contains('out'))) return;
    done = true; confetti(90);
    $('#cakeMsg').classList.add('show');
    $('#blow').textContent = 'Light them again 🕯️';
    $('#wishLine').textContent = 'Your wish is on its way ✨';
  }
  function relight() { done = false; cs().forEach(c => c.classList.remove('out')); $('#cakeMsg').classList.remove('show'); $('#blow').textContent = 'Blow the candles 🕯️'; $('#wishLine').textContent = 'Make a wish, then blow out the candles'; }
  $('#blow').onclick = () => { if (done) return relight(); cs().forEach((c, i) => setTimeout(() => { c.classList.add('out'); check(); }, i * 160)); };

  /* ---------- gallery ---------- */
  const ph = (n) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d0b1f"/><stop offset="1" stop-color="#3a0714"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="112" font-size="60" text-anchor="middle" fill="#ff5d7a">♥</text><text x="100" y="160" font-size="14" text-anchor="middle" fill="#ffd9a0" font-family="serif">Photo ${n}</text></svg>`);
  let galleryDone = false;
  function renderGallery() {
    if (galleryDone) return; galleryDone = true;
    const g = $('#gallery');
    C.photos.forEach((p, i) => {
      const d = document.createElement('div'); d.className = 'polaroid';
      d.style.cssText = `--rot:${(i % 2 ? 1 : -1) * rand(1, 4)}deg;--d:${i * .1}s`;
      const img = new Image(); img.alt = p.caption; img.src = p.src;
      img.onerror = () => { img.onerror = null; img.src = ph(i + 1); };
      const cap = document.createElement('span'); cap.textContent = p.caption;
      d.append(img, cap); d.onclick = () => openLb(img.src, p.caption); g.appendChild(d);
    });
  }
  const lb = $('#lb');
  function openLb(src, cap) { lb.querySelector('img').src = src; lb.querySelector('figcaption').textContent = cap; lb.hidden = false; }
  lb.onclick = () => lb.hidden = true;
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

  /* ---------- letter ---------- */
  const env = $('#env'); let typed = false;
  env.onclick = () => {
    if (env.classList.contains('open')) return;
    env.classList.add('open'); $('#envHint').textContent = 'Read it slowly ♥';
    if (typed) return; typed = true;
    const el = $('#letterText'), t = C.letter; let i = 0;
    setTimeout(function step() { el.textContent = t.slice(0, ++i); if (i < t.length) setTimeout(step, 32); }, 2500);
  };

  /* ---------- reasons ---------- */
  const rs = $('#reasons'); let opened = 0;
  C.reasons.forEach((r, i) => {
    const c = document.createElement('div'); c.className = 'rc';
    c.innerHTML = `<div class="rc-in"><div class="front"><span>♥<b>${i + 1}</b></span></div><div class="back"></div></div>`;
    c.querySelector('.back').textContent = r;
    c.onclick = () => {
      if (c.classList.contains('flip')) return;
      c.classList.add('flip');
      if (++opened === C.reasons.length) { confetti(70); $('#reasonHint').textContent = 'And a thousand more I have not said yet ♥'; }
    };
    rs.appendChild(c);
  });

  /* ---------- finale ---------- */
  $('#celebrate').onclick = () => { confetti(130); };

  show(0);
})();
