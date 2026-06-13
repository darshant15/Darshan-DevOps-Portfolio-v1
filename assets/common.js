/* Shared portfolio logic — multi-page nav, pipeline, transitions, background */

const PIPELINE_STAGES = [
  { id: 'checkout', file: 'index.html',       label: 'Checkout',  cmd: 'git checkout main',     icon: '📥' },
  { id: 'build',    file: 'skills.html',      label: 'Build',     cmd: 'npm run build',         icon: '🔨' },
  { id: 'test',     file: 'experience.html',  label: 'Test',      cmd: 'npm run test',          icon: '🧪' },
  { id: 'scan',     file: 'projects.html',    label: 'Scan',      cmd: 'trivy scan .',          icon: '🔍' },
  { id: 'pipeline', file: 'cicd-flow.html',   label: 'Pipeline',  cmd: 'view pipeline',         icon: '⚡' },
  { id: 'config',   file: 'about.html',       label: 'Configure', cmd: 'terraform apply',       icon: '⚙' },
  { id: 'verify',   file: 'certs.html',       label: 'Verify',    cmd: 'kubectl verify',        icon: '✓' },
  { id: 'deploy',   file: 'contact.html',     label: 'Deploy',    cmd: './reach_out.sh',        icon: '🚀' },
];

function getCurrentStageIndex() {
  const page = document.body.dataset.page || 'checkout';
  const idx = PIPELINE_STAGES.findIndex(s => s.id === page);
  return idx >= 0 ? idx : 0;
}

function initPipelineBar() {
  const bar = document.getElementById('pipeline-bar');
  if (!bar) return;
  const idx = getCurrentStageIndex();
  const pct = ((idx + 1) / PIPELINE_STAGES.length) * 100;
  const fill = bar.querySelector('.pipeline-fill');
  if (fill) fill.style.width = pct + '%';

  const stagesEl = bar.querySelector('.pipeline-stages');
  if (stagesEl) {
    stagesEl.innerHTML = PIPELINE_STAGES.map((s, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'active' : '';
      return `<a href="${s.file}" class="pipeline-stage ${cls}" data-transition title="${s.cmd}">
        <span class="ps-icon">${s.icon}</span>
        <span class="ps-label">${s.label}</span>
      </a>`;
    }).join('');
  }
}

function initPageNav() {
  const nav = document.getElementById('page-nav');
  if (!nav) return;
  const idx = getCurrentStageIndex();
  const prev = idx > 0 ? PIPELINE_STAGES[idx - 1] : null;
  const next = idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1] : null;
  const cur = PIPELINE_STAGES[idx];

  nav.innerHTML = `
    ${prev
      ? `<a href="${prev.file}" class="pipeline-btn prev" data-transition>← ${prev.cmd}</a>`
      : '<span class="pipeline-btn prev disabled">← origin</span>'}
    <div class="pipeline-status">
      <span class="ps-stage-num">stage ${idx + 1}/${PIPELINE_STAGES.length}</span>
      <span class="ps-stage-name">${cur.icon} ${cur.label}</span>
      <span class="ps-stage-cmd">$ ${cur.cmd}</span>
    </div>
    ${next
      ? `<a href="${next.file}" class="pipeline-btn next" data-transition>${next.cmd} →</a>`
      : '<span class="pipeline-btn next disabled">deployed ✓</span>'}
  `;
}

function initNavActive() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function initPageTransitions() {
  document.querySelectorAll('a[data-transition]').forEach(link => {
    link.addEventListener('click', e => {
      if (link.hostname && link.hostname !== location.hostname) return;
      e.preventDefault();
      const overlay = document.getElementById('page-transition');
      const href = link.getAttribute('href');
      if (!overlay || !href) { location.href = href; return; }
      overlay.classList.add('active');
      setTimeout(() => { location.href = href; }, 420);
    });
  });
}

function initStatusBar() {
  function updateTime() {
    const el = document.getElementById('sb-time');
    if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  updateTime();
  setInterval(updateTime, 1000);

  const idx = getCurrentStageIndex();
  const stageEl = document.getElementById('sb-stage');
  if (stageEl) stageEl.textContent = `⎈ ${PIPELINE_STAGES[idx].id}`;
}

function initTilt3d() {
  document.querySelectorAll('.tilt-3d').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 10;
      const ry = (px - 0.5) * 10;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.01)`;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .timeline-item');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 70);
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

function initSkillBars() {
  document.querySelectorAll('.skill-card').forEach(c => {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.3 }).observe(c);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPipelineBar();
  initPageNav();
  initNavActive();
  initPageTransitions();
  initStatusBar();
  initTilt3d();
  initScrollReveal();
  initSkillBars();
  requestAnimationFrame(() => document.body.classList.add('page-loaded'));
});
