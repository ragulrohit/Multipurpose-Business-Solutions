/* ===== STACKLY MAIN JS ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounters();
  initPieCharts();
  initDashboard();
  initAuthForms();
  initContactForm();
  initSettings();
  initLogout();
  initSidebar();
  initScrollTop();
  initFAQ();
  initCharts();
});

/* ===== NAVBAR ===== */
function initNavbar() {
  const header = document.querySelector('.header') || document.querySelector('.navbar');
  const toggle = document.querySelector('.nav__toggle') || document.querySelector('.hamburger');
  const menu = document.querySelector('.nav__menu') || document.querySelector('.nav-links');
  const close = document.querySelector('.nav__close');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.add('open'));
  }
  if (close && menu) {
    close.addEventListener('click', () => menu.classList.remove('open'));
  }
  if (menu) {
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menu.classList.remove('open'));
    });
  }
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ===== ANIMATED COUNTERS ===== */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = prefix + current.toLocaleString() + suffix;
        }, 30);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ===== PIE CHARTS ===== */
function initPieCharts() {
  document.querySelectorAll('.pie-chart').forEach(chart => {
    const data = JSON.parse(chart.getAttribute('data-values') || '[]');
    const colors = JSON.parse(chart.getAttribute('data-colors') || '[]');
    if (!data.length || !colors.length) return;
    const total = data.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const stops = [];
    const labels = chart.getAttribute('data-labels');
    const labelArr = labels ? JSON.parse(labels) : ['Completed', 'In Progress', 'Pending', 'Cancelled'];
    data.forEach((val, i) => {
      const start = (cumulative / total) * 360;
      cumulative += val;
      const end = (cumulative / total) * 360;
      stops.push(`${colors[i]} ${start}deg ${end}deg`);
    });
    chart.style.background = `conic-gradient(${stops.join(', ')})`;

    const legend = chart.parentElement.querySelector('.pie-legend');
    if (legend) {
      legend.innerHTML = data.map((val, i) =>
        `<div class="pie-legend-item"><span class="dot" style="background:${colors[i]}"></span>${labelArr[i] || ''}: ${val}%</div>`
      ).join('');
    }
  });
}

/* ===== DASHBOARD ===== */
function initDashboard() {
  const email = localStorage.getItem('stackly_email') || '';
  const name = email ? email.split('@')[0] : 'User';
  document.querySelectorAll('.user-name, .dashboard__user-name').forEach(el => el.textContent = name);
  document.querySelectorAll('.user-email, .dashboard__user-email').forEach(el => el.textContent = email);
  document.querySelectorAll('.topbar__avatar').forEach(el => {
    el.textContent = name.charAt(0).toUpperCase();
  });
}

/* ===== AUTH FORMS ===== */
function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const email = loginForm.querySelector('input[name="email"]');
      const pass = loginForm.querySelector('input[name="password"]');
      resetErrors(loginForm);

      if (!email || !email.value || !validateEmail(email.value)) { if(email) showError(email); valid = false; }
      if (!pass || !pass.value || pass.value.length < 6) { if(pass) showError(pass); valid = false; }
      if (valid) {
        localStorage.setItem('stackly_email', email.value);
        showAuthSuccess(loginForm, 'Login successful! Welcome to Stackly.');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const name = signupForm.querySelector('input[name="fullname"]');
      const email = signupForm.querySelector('input[name="email"]');
      const phone = signupForm.querySelector('input[name="phone"]');
      const pass = signupForm.querySelector('input[name="password"]');
      const cpass = signupForm.querySelector('input[name="confirmpassword"]');
      const terms = signupForm.querySelector('input[name="terms"]');
      resetErrors(signupForm);

      if (!name || !name.value || name.value.trim().length < 2) { if(name) showError(name); valid = false; }
      if (!email || !email.value || !validateEmail(email.value)) { if(email) showError(email); valid = false; }
      if (!phone || !phone.value || phone.value.length < 10) { if(phone) showError(phone); valid = false; }
      if (!pass || !pass.value || pass.value.length < 6) { if(pass) showError(pass); valid = false; }
      if (cpass && pass && cpass.value !== pass.value) { showError(cpass); valid = false; }
      if (terms && !terms.checked) {
        const tg = terms.closest('.checkbox-group');
        if (tg) tg.classList.add('error');
        valid = false;
      }
      if (valid) {
        localStorage.setItem('stackly_user', JSON.stringify({
          name: name.value, email: email.value, phone: phone ? phone.value : ''
        }));
        showAuthSuccess(signupForm, 'Account created successfully! Redirecting to login...');
        setTimeout(() => { window.location.href = 'login.html'; }, 1800);
      }
    });
  }

  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || btn.parentElement.querySelector('input[type="password"], input[type="text"]');
      if (input) {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      }
    });
  });
}

function resetErrors(form) {
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
  form.querySelectorAll('.checkbox-group').forEach(g => g.classList.remove('error'));
  const msg = form.querySelector('.success-msg');
  if (msg) msg.style.display = 'none';
}
function showError(input) {
  const group = input.closest('.form-group');
  if (group) group.classList.add('error');
}
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function showAuthSuccess(form, text) {
  let msg = form.querySelector('.success-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'success-msg';
    msg.style.display = 'block';
    const btn = form.querySelector('.btn--primary, .btn-primary, .btn');
    if (btn) btn.parentElement.insertBefore(msg, btn);
    else form.appendChild(msg);
  }
  msg.textContent = text;
  msg.style.display = 'block';
}

/* ===== CONTACT FORM ===== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const fields = ['name', 'email', 'phone', 'company', 'message'];
    resetErrors(form);
    fields.forEach(f => {
      const input = form.querySelector(`[name="${f}"]`);
      if (!input) return;
      if (!input.value || input.value.trim().length < 2) { showError(input); valid = false; }
      if (f === 'email' && !validateEmail(input.value)) { showError(input); valid = false; }
    });
    if (valid) {
      let msg = form.querySelector('.success-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'success-msg';
        form.appendChild(msg);
      }
      msg.style.display = 'block';
      msg.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
      form.reset();
    }
  });
}

/* ===== SETTINGS ===== */
function initSettings() {
  const form = document.getElementById('settingsForm');
  if (!form) return;
  const user = JSON.parse(localStorage.getItem('stackly_user') || '{}');
  const email = localStorage.getItem('stackly_email') || '';
  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  if (nameInput && user.name) nameInput.value = user.name;
  if (emailInput && email) emailInput.value = email;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value;
    const em = form.querySelector('[name="email"]').value;
    const phone = form.querySelector('[name="phone"]').value;
    localStorage.setItem('stackly_user', JSON.stringify({ name, email: em, phone }));
    localStorage.setItem('stackly_email', em);
    const btn = form.querySelector('.btn--primary, .btn-primary, .btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Saved!';
      btn.style.background = 'var(--accent)';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
    }
  });
}

/* ===== LOGOUT ===== */
function initLogout() {
  const logoutBtns = document.querySelectorAll('.logout-btn, .topbar__btn--logout');
  const modal = document.getElementById('logoutModal');
  if (!modal) return;
  const confirmBtn = modal.querySelector('.btn-confirm');
  const cancelBtn = modal.querySelector('.btn-cancel');

  logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
  }));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (confirmBtn) confirmBtn.addEventListener('click', () => {
    localStorage.removeItem('stackly_email');
    localStorage.removeItem('stackly_user');
    window.location.href = 'login.html';
  });
}

/* ===== SIDEBAR ===== */
function initSidebar() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

/* ===== SCROLL TO TOP ===== */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===== FAQ ACCORDION ===== */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      if (item) {
        item.classList.toggle('active');
      }
    });
  });
}

/* ===== CHARTS ===== */
function initCharts() {
  const revenueChart = document.getElementById('revenueChart');
  if (revenueChart) {
    drawBarChart(revenueChart,
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      [45,52,38,65,72,58,80,75,88,92,85,95],
      ['#6C3CE1','#FF6B35','#00C9A7','#6C3CE1','#FF6B35','#00C9A7','#6C3CE1','#FF6B35','#00C9A7','#6C3CE1','#FF6B35','#00C9A7']
    );
  }
  const trafficChart = document.getElementById('trafficChart');
  if (trafficChart) {
    drawLineChart(trafficChart,
      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      [120,180,150,220,200,280,240],
      '#6C3CE1'
    );
  }
}

/* ===== CHART HELPERS ===== */
function drawBarChart(container, labels, values, colors) {
  if (!container) return;
  const max = Math.max(...values);
  container.innerHTML = `<div style="display:flex;align-items:end;gap:12px;height:220px;padding-top:20px">
    ${values.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
      <span style="font-size:0.75rem;font-weight:700;color:#1A1A2E">${v}</span>
      <div style="width:100%;height:${(v / max) * 170}px;background:${colors[i % colors.length]};border-radius:6px 6px 0 0;transition:height 1s ease;min-height:4px"></div>
      <span style="font-size:0.7rem;color:#8892B0">${labels[i]}</span>
    </div>`).join('')}
  </div>`;
}

function drawLineChart(container, labels, values, color) {
  if (!container) return;
  const max = Math.max(...values);
  const w = container.offsetWidth || 500;
  const h = 220;
  const pad = 30;
  const points = values.map((v, i) => `${pad + (i / (values.length - 1)) * (w - pad * 2)},${pad + (1 - v / max) * (h - pad * 2)}`).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">
    <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${areaPoints}" fill="url(#lg1)"/>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${values.map((v, i) => `<circle cx="${pad + (i / (values.length - 1)) * (w - pad * 2)}" cy="${pad + (1 - v / max) * (h - pad * 2)}" r="4" fill="${color}"/>`).join('')}
  </svg>`;
}
