// ═══════════════════════════════════════════════════════════════════════════
// 3D DEVOPS LOGO BACKGROUND — Real Image Particles with Depth & Interaction
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('devops-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Logo definitions — maps name → brand accent color for glow ────────────
  const LOGO_META = [
    { key: 'aws',          label: 'AWS',        glow: '#FF9900', size: 52 },
    { key: 'kubernetes',   label: 'K8s',        glow: '#326CE5', size: 48 },
    { key: 'docker_color', label: 'Docker',     glow: '#2496ED', size: 50 },
    { key: 'docker_bw',   label: 'Docker',     glow: '#2496ED', size: 46 },
    { key: 'terraform',    label: 'Terraform',  glow: '#7B42BC', size: 46 },
    { key: 'jenkins',      label: 'Jenkins',    glow: '#D33834', size: 54 },
    { key: 'linux',        label: 'Linux',      glow: '#FCC624', size: 50 },
    { key: 'nginx',        label: 'Nginx',      glow: '#009639', size: 44 },
    { key: 'ansible',      label: 'Ansible',    glow: '#EE0000', size: 48 },
    { key: 'grafana',      label: 'Grafana',    glow: '#F46800', size: 46 },
    { key: 'cicd',         label: 'CI/CD',      glow: '#16a34a', size: 48 },
  ];

  // ── Preload all images ────────────────────────────────────────────────────
  const loadedImgs = {};
  let imagesReady = 0;
  const totalImages = LOGO_META.length;

  function startWhenReady() {
    imagesReady++;
    if (imagesReady >= totalImages) {
      resize();
      requestAnimationFrame(frame);
    }
  }

  LOGO_META.forEach(m => {
    const img = new Image();
    img.onload  = startWhenReady;
    img.onerror = startWhenReady; // don't block on error
    img.src = (typeof LOGO_DATA !== 'undefined' && LOGO_DATA[m.key]) ? LOGO_DATA[m.key] : '';
    loadedImgs[m.key] = img;
  });

  // ── Mouse / scroll state ─────────────────────────────────────────────────
  let mouse = { x: -9999, y: -9999, active: false };
  let scrollY = 0;
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let W, H, nodes;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNodes();
  }
  window.addEventListener('resize', resize);

  // ── Build particle nodes ─────────────────────────────────────────────────
  function buildNodes() {
    // Density: 1 logo per ~18000px² — caps at 55
    const count = Math.min(Math.floor((W * H) / 18000), 55);
    nodes = [];
    const pool = [...LOGO_META, ...LOGO_META, ...LOGO_META]; // repeat pool for variety

    for (let i = 0; i < count; i++) {
      const meta = pool[i % pool.length];

      // z ∈ [0.15, 1.0]: depth layer. 1 = foreground, 0.15 = far background
      const z = 0.15 + Math.random() * 0.85;

      // Base draw size scales with depth
      const drawSize = meta.size * (0.35 + z * 0.65);

      // Rotation for 3D feel
      const rotSpeed = (Math.random() - 0.5) * 0.004 * (1 - z * 0.7); // far = barely rotates

      nodes.push({
        wx:  Math.random() * W,
        wy:  Math.random() * H,
        z,

        // Drift velocity — far nodes drift slower
        vx: (Math.random() - 0.5) * 0.15 * z,
        vy: (Math.random() - 0.5) * 0.12 * z,

        // Organic oscillation
        px:   Math.random() * Math.PI * 2,
        py:   Math.random() * Math.PI * 2,
        freq: 0.005 + Math.random() * 0.008,
        ampX: 0.25 + Math.random() * 0.45,
        ampY: 0.20 + Math.random() * 0.35,

        // 3D rotation
        rot:      Math.random() * Math.PI * 2,
        rotSpeed,

        // Appearance
        meta,
        img:      loadedImgs[meta.key],
        drawSize,
        baseAlpha: (0.06 + Math.random() * 0.08) * z,  // far = very faint

        // Interaction state (smoothed 0..1)
        hoverT:  0,
        pushVx:  0,
        pushVy:  0,
      });
    }
  }

  // ── Constants ─────────────────────────────────────────────────────────────
  const BLOOM_R  = 170;   // px radius for colour activation
  const PUSH_R   = 90;    // px radius for repulsion
  const PUSH_STR = 5.0;
  const FRICTION  = 0.86;
  const CONN_R   = 140;   // max distance for drawing lines
  const CONN_SCREEN_R = 160; // only draw lines if near cursor

  // ── Connection line helper ────────────────────────────────────────────────
  function drawLines(projected) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].hoverT < 0.05) continue; // only from activated nodes
      const a = projected[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = projected[j];
        const dx = a.sx - b.sx, dy = a.sy - b.sy;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d > CONN_R) continue;

        const bloom = Math.max(nodes[i].hoverT, nodes[j].hoverT);
        const alpha = bloom * (1 - d / CONN_R) * 0.15 * Math.min(nodes[i].z, nodes[j].z);

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(22,163,74,${alpha})`;
        ctx.lineWidth   = 0.8 * Math.min(nodes[i].z, nodes[j].z);
        ctx.stroke();
      }
    }
  }

  // ── Cursor ambient ring ───────────────────────────────────────────────────
  function drawCursorAura() {
    if (!mouse.active) return;
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 8, mouse.x, mouse.y, 120);
    grad.addColorStop(0,   'rgba(22,163,74,0.05)');
    grad.addColorStop(0.5, 'rgba(22,163,74,0.02)');
    grad.addColorStop(1,   'rgba(22,163,74,0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Main frame ────────────────────────────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawCursorAura();

    const mx = mouse.x, my = mouse.y;

    // Compute projected screen positions for this frame
    const projected = nodes.map(n => {
      // Parallax: far nodes shift less with scroll
      const parallaxY = (1 - n.z) * scrollY * 0.28;
      return { sx: n.wx, sy: n.wy - parallaxY };
    });

    // Sort by z so far nodes draw first (painter's algorithm)
    const order = nodes.map((_, i) => i).sort((a, b) => nodes[a].z - nodes[b].z);

    // Draw connection lines first (behind all logos)
    drawLines(projected);

    for (const i of order) {
      const n  = nodes[i];
      const p  = projected[i];

      // ── Physics ──
      n.px  += n.freq;
      n.py  += n.freq * 0.71;
      n.rot += n.rotSpeed;
      n.wx  += n.vx + Math.sin(n.px) * n.ampX * n.z;
      n.wy  += n.vy + Math.cos(n.py) * n.ampY * n.z;

      // Edge wrap
      const pad = 60;
      if (n.wx < -pad)   n.wx = W + pad;
      if (n.wx > W + pad) n.wx = -pad;
      if (n.wy < -pad)   n.wy = H + pad;
      if (n.wy > H + pad) n.wy = -pad;

      // ── Cursor interaction ──
      const dx = p.sx - mx, dy = p.sy - my;
      const dist = Math.sqrt(dx*dx + dy*dy);

      // Bloom
      const tgt = mouse.active && dist < BLOOM_R
        ? Math.pow(1 - dist / BLOOM_R, 1.7)
        : 0;
      n.hoverT += (tgt - n.hoverT) * 0.09;

      // Repulsion
      if (mouse.active && dist < PUSH_R && dist > 0.5) {
        const f = (PUSH_R - dist) / PUSH_R;
        n.pushVx += (dx / dist) * f * PUSH_STR;
        n.pushVy += (dy / dist) * f * PUSH_STR;
      }
      n.pushVx *= FRICTION;
      n.pushVy *= FRICTION;
      n.wx += n.pushVx;
      n.wy += n.pushVy;

      // ── Render ──
      const alpha    = n.baseAlpha + n.hoverT * (0.92 - n.baseAlpha);
      const drawSize = n.drawSize * (1 + n.hoverT * 0.40);

      ctx.save();
      ctx.translate(p.sx, p.sy);

      // 3D tilt: slight perspective rotation
      const tiltX = n.hoverT * Math.sin(n.rot) * 0.12;
      const tiltY = n.hoverT * Math.cos(n.rot) * 0.08;
      ctx.transform(1, tiltY, -tiltX, 1, 0, 0);

      // Gentle z-rotation for depth feel
      ctx.rotate(Math.sin(n.rot) * 0.04 + n.hoverT * Math.sin(n.rot * 2) * 0.06);

      ctx.globalAlpha = alpha;

      // Glow when hovered
      if (n.hoverT > 0.05) {
        ctx.shadowColor = n.meta.glow;
        ctx.shadowBlur  = n.hoverT * 30 * n.z;
      } else {
        ctx.shadowBlur = 0;
      }

      // Desaturate at rest → colour on hover using composite trick
      if (n.hoverT < 0.98 && n.img.complete && n.img.naturalWidth > 0) {
        // Draw greyscale base
        const offCtx = getGrayCanvas(n, drawSize);
        const grayAlpha = 1 - n.hoverT;
        const colorAlpha = n.hoverT;

        if (grayAlpha > 0.01) {
          ctx.globalAlpha = alpha * grayAlpha;
          ctx.drawImage(offCtx, -drawSize/2, -drawSize/2, drawSize, drawSize);
        }
        if (colorAlpha > 0.01) {
          ctx.globalAlpha = alpha * colorAlpha;
          ctx.drawImage(n.img, -drawSize/2, -drawSize/2, drawSize, drawSize);
        }
      } else if (n.img.complete && n.img.naturalWidth > 0) {
        ctx.drawImage(n.img, -drawSize/2, -drawSize/2, drawSize, drawSize);
      }

      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  // ── Greyscale offscreen cache ─────────────────────────────────────────────
  const grayCache = new Map();

  function getGrayCanvas(n, drawSize) {
    const sz = Math.ceil(drawSize);
    const key = n.meta.key + ':' + sz;
    if (grayCache.has(key)) return grayCache.get(key);

    const oc  = document.createElement('canvas');
    oc.width  = sz;
    oc.height = sz;
    const ox  = oc.getContext('2d');
    ox.drawImage(n.img, 0, 0, sz, sz);
    ox.globalCompositeOperation = 'saturation';
    ox.fillStyle = '#808080';
    ox.fillRect(0, 0, sz, sz);
    ox.globalCompositeOperation = 'source-over';

    grayCache.set(key, oc);
    return oc;
  }

})();
