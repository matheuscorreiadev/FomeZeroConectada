const API = '/api';
let authToken = localStorage.getItem('fz_token') || null;
// ============================================================
// NAVIGATION
// ============================================================
function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('section-' + name);
    if (el) el.classList.add('active');

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');

    // Load data for admin
    if (name === 'admin') {
        if (authToken) showAdminPanel();
        else showAdminLogin();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// ============================================================
// AUTH
// ============================================================
function openLogin() { showSection('admin'); }

async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    hideAlert('alertLogin');

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert('alertLogin', data.error || 'Erro ao entrar'); return; }

        authToken = data.token;
        localStorage.setItem('fz_token', authToken);
        showAdminPanel();
        updateNavAuth(true);
    } catch (err) {
        showAlert('alertLogin', 'Erro de conexão com o servidor');
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('fz_token');
    updateNavAuth(false);
    showSection('home');
}

function updateNavAuth(loggedIn) {
    document.getElementById('btnLogin').style.display = loggedIn ? 'none' : '';
    document.getElementById('btnLogout').style.display = loggedIn ? '' : 'none';
}

function showAdminLogin() {
    document.getElementById('adminLogin').style.display = '';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = '';
    adminTab('dashboard');
    updateNavAuth(true);
}

// ============================================================
// ADMIN TABS
// ============================================================
function adminTab(tab) {
    document.querySelectorAll('.admin-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).style.display = '';
    document.querySelector(`.admin-tab[data-tab="${tab}"]`)?.classList.add('active');

    if (tab === 'dashboard') loadAdminStats();
    if (tab === 'familias') loadFamilias();
    if (tab === 'doadores') loadDoadores();
    if (tab === 'entregas') loadEntregas();
}

// ============================================================
// STATS (PUBLIC)
// ============================================================
async function loadPublicStats() {
    try {
        const res = await fetch(`${API}/stats/publico`);
        const data = await res.json();
        animateNum('statFamilias', data.familias);
        animateNum('statCestas', data.cestas);
        animateNum('statDoadores', data.doadores);
    } catch (_) { }
}

function animateNum(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const duration = 800;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = Math.round(start);
        if (start >= target) clearInterval(interval);
    }, 16);
}

// ============================================================
// ADMIN STATS
// ============================================================
async function loadAdminStats() {
    try {
        const res = await apiFetch(`${API}/stats/admin`);
        const data = await res.json();
        document.getElementById('d_totalFamilias').textContent = data.totalFamilias;
        document.getElementById('d_aprovadas').textContent = data.aprovadas;
        document.getElementById('d_pendentes').textContent = data.pendentes;
        document.getElementById('d_cestas').textContent = data.cestasPrometidas;
        document.getElementById('d_entregas').textContent = data.entregasRealizadas;
        document.getElementById('d_doadores').textContent = data.totalDoadores;
    } catch (_) { }
}

// ============================================================
// FAMÍLIAS — CADASTRO
// ============================================================
async function submitFamilia(e) {
    e.preventDefault();
    hideAlert('alertFamilia'); hideAlert('alertFamiliaErr');

    const body = {
        nome: document.getElementById('f_nome').value.trim(),
        cpf: document.getElementById('f_cpf').value.trim(),
        endereco: document.getElementById('f_endereco').value.trim(),
        num_pessoas: document.getElementById('f_num_pessoas').value,
        renda: document.getElementById('f_renda').value || null,
        telefone: document.getElementById('f_telefone').value.trim(),
        email: document.getElementById('f_email').value.trim() || null,
    };

    const btn = document.getElementById('btnSubmitFamilia');
    btn.disabled = true; btn.textContent = 'Enviando...';

    try {
        const res = await fetch(`${API}/familias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { showAlert('alertFamiliaErr', data.error); return; }
        showAlert('alertFamilia', null, true);
        document.getElementById('formFamilia').reset();
        loadPublicStats();
    } catch (_) {
        showAlert('alertFamiliaErr', 'Erro de conexão. Tente novamente.');
    } finally {
        btn.disabled = false; btn.textContent = 'Enviar cadastro';
    }
}

// ============================================================
// DOADORES — CADASTRO
// ============================================================
async function submitDoador(e) {
    e.preventDefault();
    hideAlert('alertDoador'); hideAlert('alertDoadorErr');

    const body = {
        nome: document.getElementById('d_nome').value.trim(),
        tipo: document.getElementById('d_tipo').value,
        email: document.getElementById('d_email').value.trim(),
        telefone: document.getElementById('d_telefone').value.trim(),
        qtd_cestas: document.getElementById('d_cestas').value,
    };

    const btn = document.getElementById('btnSubmitDoador');
    btn.disabled = true; btn.textContent = 'Processando...';

    try {
        const res = await fetch(`${API}/doadores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { showAlert('alertDoadorErr', data.error); return; }
        showAlert('alertDoador', null, true);
        document.getElementById('formDoador').reset();
        loadPublicStats();
    } catch (_) {
        showAlert('alertDoadorErr', 'Erro de conexão. Tente novamente.');
    } finally {
        btn.disabled = false; btn.textContent = '✨ Confirmar doação';
    }
}