// Page-specific interactions (hero typing, photo 3D, terminal, contact)

// ── TYPING EFFECT ────────────────────────────────────────────
const typeEl = document.getElementById('type-text');
if (typeEl) {
  const terms = ['DevOps Engineer', 'CI/CD Engineer', 'SRE Enthusiast', 'Infrastructure Automation Engineer'];
  let tIdx = 0, cIdx = 0, typing = true;
  function doType() {
    if (typing) {
      if (cIdx < terms[tIdx].length) {
        typeEl.textContent = terms[tIdx].slice(0, ++cIdx);
        setTimeout(doType, 75);
      } else { typing = false; setTimeout(doType, 2000); }
    } else {
      if (cIdx > 0) {
        typeEl.textContent = terms[tIdx].slice(0, --cIdx);
        setTimeout(doType, 35);
      } else {
        typing = true;
        tIdx = (tIdx + 1) % terms.length;
        setTimeout(doType, 300);
      }
    }
  }
  doType();
}

// ── 3D PHOTO TILT ────────────────────────────────────────────
const scene = document.getElementById('photo-scene');
const card = document.getElementById('photo-card');
if (scene && card) {
  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `rotateY(${dx * 14}deg) rotateX(${-dy * 10}deg) scale(1.03)`;
  });
  scene.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(-8deg) rotateX(4deg)';
  });
}

// ── INTERACTIVE TERMINAL ─────────────────────────────────────
const cmdInput = document.getElementById('cmd-input');
const termBody = document.getElementById('term-body');
if (cmdInput && termBody) {
  const commands = {
    'ls': '📁 about.txt  skills.json  projects/  certs/  contact.sh',
    'whoami': 'darshan — DevOps Engineer | CI/CD Engineer ',
    'pwd': '/home/darshan/portfolio',
    'date': new Date().toUTCString(),
    'skills': '☁ AWS  ⎈ K8s  🐳 Docker  ⚙ Terraform  📊 Prometheus  🔧 Ansible  🚀 Argo CD',
    'uptime': 'up 2 years, 3 months, 0 incidents',
    'echo hello': 'Hello! Let\'s automate something.',
    'clear': '__clear__',
    'help': 'available: ls, whoami, pwd, date, skills, uptime, echo hello, clear',
    'cd pipeline': '→ redirecting to cicd-flow.html...',
  };
  cmdInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = cmdInput.value.trim().toLowerCase();
      if (!val) return;
      if (val === 'cd pipeline') {
        location.href = 'cicd-flow.html';
        return;
      }
      const out = commands[val] || `zsh: command not found: ${val} (try: help)`;
      const lastLine = termBody.lastElementChild;
      if (lastLine && lastLine.querySelector('.t-cursor')) lastLine.remove();
      if (out === '__clear__') {
        termBody.innerHTML = '';
      } else {
        const inp = document.createElement('div');
        inp.className = 't-line';
        inp.innerHTML = `<span class="t-prompt">darshant15@devops:~$ </span><span class="t-cmd">${val}</span>`;
        termBody.appendChild(inp);
        const res = document.createElement('div');
        res.className = 't-line t-output';
        res.textContent = out;
        termBody.appendChild(res);
        termBody.appendChild(Object.assign(document.createElement('div'), { className: 't-line t-output', innerHTML: '&nbsp;' }));
      }
      const cursorLine = document.createElement('div');
      cursorLine.className = 't-line';
      cursorLine.innerHTML = '<span class="t-prompt">darshant15@devops:~$ </span><span class="t-cursor"></span>';
      termBody.appendChild(cursorLine);
      termBody.scrollTop = termBody.scrollHeight;
      cmdInput.value = '';
    }
  });
}

// ── CONTACT SEND ──────────────────────────────────────────────
function handleSend(btn) {
  btn.textContent = '✓ message sent!';
  btn.style.background = 'var(--cyan)';
  setTimeout(() => {
    btn.textContent = '$ ./send_message.sh';
    btn.style.background = '';
  }, 2500);
}
