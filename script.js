// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    mobileNav.hidden = expanded;
  });
}

// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Animated wireframe brain on canvas + orbiting icons
(function () {
  const cvs = document.getElementById('brain');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');

  // Adapt canvas to CSS size while keeping resolution crisp
  function fitCanvas() {
    const rect = cvs.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(360, Math.floor(rect.width / 0.9));
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  // Generate pseudo-brain points using two lobes and noise
  const POINTS = 220; // keep perf-friendly for mobile
  const lines = [];
  function seed() {
    lines.length = 0;
    for (let i = 0; i < POINTS; i++) {
      const t = (i / POINTS) * Math.PI * 2;
      const lobe = i % 2 === 0 ? 1 : -1; // alternate left/right
      const r = 0.42 + 0.18 * Math.sin(3 * t + lobe * 0.6) + 0.06 * Math.cos(7 * t);
      const x = lobe * 0.28 + r * Math.cos(t) * 0.42;
      const y = r * Math.sin(t) * 0.68 + 0.06 * Math.cos(5 * t);
      lines.push({ x, y, vx: (Math.random()-0.5)*0.002, vy: (Math.random()-0.5)*0.002 });
    }
  }
  seed();

  // Utility
  function mapX(x) { return (x * 0.9 + 0.5) * cvs.width; }
  function mapY(y) { return (y * 0.9 + 0.5) * cvs.height; }

  let t0 = performance.now();
  // Orbiting product icons
  const icons = Array.from(document.querySelectorAll('.orbit-icon'));
  function placeIcons(t) {
    const rect = cvs.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const baseR = Math.min(cx, cy) * 0.75;
    icons.forEach((el, i) => {
      const speed = 0.3 + i * 0.07;
      const angle = (t * speed + i * Math.PI / 2) % (Math.PI * 2);
      const r = baseR * (0.8 + 0.1 * Math.sin(t + i));
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.85;
      el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    });
  }

  function draw(now) {
    const dt = Math.min(50, now - t0) / 1000;
    t0 = now;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // glowing back-shape
    const cx = cvs.width * 0.5;
    const cy = cvs.height * 0.5;
    const grd = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(cx, cy));
    grd.addColorStop(0, 'rgba(255,255,255,0.03)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(cx, cy) * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // light grid lines to simulate wireframe
    ctx.lineWidth = 1;
    for (let i = 0; i < lines.length; i++) {
      const a = lines[i];
      // update a bit for organic motion
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.vx += (Math.random() - 0.5) * 0.0002;
      a.vy += (Math.random() - 0.5) * 0.0002;
    }

    // Connect each point with its k nearest in ring for performance
    const k = 3;
    for (let i = 0; i < lines.length; i++) {
      const a = lines[i];
      for (let j = 1; j <= k; j++) {
        const b = lines[(i + j) % lines.length];
        const ax = mapX(a.x), ay = mapY(a.y);
        const bx = mapX(b.x), by = mapY(b.y);
        const dx = ax - bx, dy = ay - by;
        const dist = Math.hypot(dx, dy);
        const alpha = Math.max(0, 0.9 - dist / (cvs.width * 0.25));
        if (alpha <= 0.01) continue;
        ctx.strokeStyle = `rgba(255,255,255,${0.28 * alpha})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    // outline
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < lines.length; i++) {
      const p = lines[i];
      const x = mapX(p.x), y = mapY(p.y);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

  placeIcons(now / 1000);
  requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
