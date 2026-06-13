/* Interactive CI/CD pipeline visualization */

(function () {
  const stages = [
    { id: 'source',   label: 'Source',        icon: '📦', cmd: 'git push origin main',       dur: 1200 },
    { id: 'build',    label: 'Build',         icon: '🔨', cmd: 'docker build -t app:v1 .',   dur: 1800 },
    { id: 'test',     label: 'Unit Tests',    icon: '🧪', cmd: 'npm test --coverage',        dur: 1500 },
    { id: 'scan',     label: 'Security Scan', icon: '🔍', cmd: 'trivy image app:v1',         dur: 1400 },
    { id: 'staging',  label: 'Deploy Staging',icon: '🌐', cmd: 'kubectl apply -f staging/',  dur: 1600 },
    { id: 'approve',  label: 'Manual Gate',   icon: '👤', cmd: 'await approval...',          dur: 1000 },
    { id: 'prod',     label: 'Deploy Prod',   icon: '🚀', cmd: 'argocd sync --prune',        dur: 1800 },
    { id: 'monitor',  label: 'Monitor',       icon: '📊', cmd: 'grafana dashboards live',    dur: 1200 },
  ];

  const flow = document.getElementById('cicd-flow');
  const log = document.getElementById('cicd-log');
  const runBtn = document.getElementById('run-pipeline');
  if (!flow) return;

  flow.innerHTML = stages.map((s, i) => `
    <div class="cicd-node" data-id="${s.id}" data-index="${i}">
      <div class="cicd-node-ring"><div class="cicd-node-inner">${s.icon}</div></div>
      <div class="cicd-node-label">${s.label}</div>
      <div class="cicd-node-cmd">${s.cmd}</div>
      ${i < stages.length - 1 ? '<div class="cicd-connector"><div class="cicd-connector-fill"></div></div>' : ''}
    </div>
  `).join('');

  let running = false;

  function appendLog(text, type = '') {
    if (!log) return;
    const line = document.createElement('div');
    line.className = 'cicd-log-line ' + type;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function resetPipeline() {
    flow.querySelectorAll('.cicd-node').forEach(n => {
      n.classList.remove('running', 'done', 'failed');
    });
    flow.querySelectorAll('.cicd-connector-fill').forEach(c => {
      c.style.width = '0%';
    });
    if (log) log.innerHTML = '';
  }

  async function runPipeline() {
    if (running) return;
    running = true;
    if (runBtn) {
      runBtn.textContent = '⏳ pipeline running...';
      runBtn.disabled = true;
    }
    resetPipeline();
    appendLog('$ ./run_pipeline.sh --env production', 'cmd');

    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      const node = flow.querySelector(`[data-id="${s.id}"]`);
      const conn = node?.querySelector('.cicd-connector-fill');

      node?.classList.add('running');
      appendLog(`→ ${s.cmd}`, 'info');

      await new Promise(r => setTimeout(r, s.dur * 0.4));
      if (conn) conn.style.width = '100%';
      await new Promise(r => setTimeout(r, s.dur * 0.6));

      node?.classList.remove('running');
      node?.classList.add('done');
      appendLog(`✓ ${s.label} passed`, 'success');
    }

    appendLog('✓ Pipeline completed — all stages green', 'success');
    if (runBtn) {
      runBtn.textContent = '✓ pipeline success — run again?';
      runBtn.disabled = false;
    }
    running = false;
  }

  if (runBtn) runBtn.addEventListener('click', runPipeline);

  // Auto-run once on page load after delay
  setTimeout(runPipeline, 800);

  // 3D parallax on pipeline nodes
  flow.addEventListener('mousemove', e => {
    const rect = flow.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    flow.style.transform = `perspective(1200px) rotateY(${dx * 4}deg)`;
  });
  flow.addEventListener('mouseleave', () => { flow.style.transform = ''; });
})();
