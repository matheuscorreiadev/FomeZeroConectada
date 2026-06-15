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