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

// ============================================================
// ADMIN — FAMÍLIAS TABLE
// ============================================================
async function loadFamilias() {
    const tbody = document.getElementById('tbodyFamilias');
    tbody.innerHTML = '<tr><td colspan="7" class="empty">Carregando...</td></tr>';
    try {
        const res = await apiFetch(`${API}/familias`);
        const rows = await res.json();
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty">Nenhuma família cadastrada ainda.</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${esc(r.nome)}</strong></td>
        <td>${esc(r.cpf)}</td>
        <td>${r.num_pessoas}</td>
        <td>${esc(r.telefone)}</td>
        <td>${badgeStatus(r.status)}</td>
        <td>${fmtDate(r.created_at)}</td>
        <td>
          ${r.status === 'pendente' ? `
            <button class="action-btn approve" onclick="updateStatus(${r.id},'aprovada')">✔ Aprovar</button>
            <button class="action-btn reject" onclick="updateStatus(${r.id},'rejeitada')">✘ Rejeitar</button>
          ` : `
            <button class="action-btn" onclick="updateStatus(${r.id},'pendente')">↺ Pendente</button>
          `}
          <button class="action-btn delete" onclick="deleteFamilia(${r.id})">🗑</button>
        </td>
      </tr>
    `).join('');
    } catch (_) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">Erro ao carregar dados.</td></tr>';
    }
}

async function updateStatus(id, status) {
    try {
        await apiFetch(`${API}/familias/${id}/status`, 'PATCH', { status });
        loadFamilias();
        loadAdminStats();
    } catch (_) { alert('Erro ao atualizar status'); }
}

async function deleteFamilia(id) {
    if (!confirm('Remover esta família do sistema?')) return;
    try {
        await apiFetch(`${API}/familias/${id}`, 'DELETE');
        loadFamilias();
        loadAdminStats();
        loadPublicStats();
    } catch (_) { alert('Erro ao remover'); }
}

// ============================================================
// ADMIN — DOADORES TABLE
// ============================================================
async function loadDoadores() {
    const tbody = document.getElementById('tbodyDoadores');
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Carregando...</td></tr>';
    try {
        const res = await apiFetch(`${API}/doadores`);
        const rows = await res.json();
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhum doador registrado ainda.</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${esc(r.nome)}</strong></td>
        <td><span class="badge badge-blue">${esc(r.tipo)}</span></td>
        <td>${esc(r.email)}</td>
        <td><strong>${r.qtd_cestas}</strong></td>
        <td>${fmtDate(r.created_at)}</td>
        <td>
          <button class="action-btn delete" onclick="deleteDoador(${r.id})">🗑</button>
        </td>
      </tr>
    `).join('');
    } catch (_) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Erro ao carregar dados.</td></tr>';
    }
}

async function deleteDoador(id) {
    if (!confirm('Remover este doador?')) return;
    try {
        await apiFetch(`${API}/doadores/${id}`, 'DELETE');
        loadDoadores();
        loadAdminStats();
        loadPublicStats();
    } catch (_) { alert('Erro ao remover'); }
}

// ============================================================
// ADMIN — ENTREGAS TABLE
// ============================================================
async function loadEntregas() {
    const tbody = document.getElementById('tbodyEntregas');
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Carregando...</td></tr>';
    try {
        const res = await apiFetch(`${API}/entregas`);
        const rows = await res.json();
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">Nenhuma entrega registrada ainda.</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${esc(r.familia_nome)}</strong></td>
        <td>${fmtDate(r.created_at)}</td>
        <td><span class="badge badge-green">${esc(r.status)}</span></td>
        <td>
          <button class="action-btn delete" onclick="deleteEntrega(${r.id})">🗑</button>
        </td>
      </tr>
    `).join('');
    } catch (_) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Erro ao carregar dados.</td></tr>';
    }
}

async function deleteEntrega(id) {
    if (!confirm('Remover esta entrega?')) return;
    try {
        await apiFetch(`${API}/entregas/${id}`, 'DELETE');
        loadEntregas();
        loadAdminStats();
    } catch (_) { alert('Erro ao remover'); }
}

// ============================================================
// MODAL — REGISTRAR ENTREGA
// ============================================================
async function openEntregaModal() {
    const sel = document.getElementById('e_familia');
    sel.innerHTML = '<option value="">Carregando famílias...</option>';
    document.getElementById('modalEntrega').style.display = 'flex';
    hideAlert('alertEntregaErr');

    try {
        const res = await apiFetch(`${API}/familias`);
        const rows = await res.json();
        const aprovadas = rows.filter(r => r.status === 'aprovada');
        if (!aprovadas.length) {
            sel.innerHTML = '<option value="">Nenhuma família aprovada</option>';
        } else {
            sel.innerHTML = '<option value="">Selecione uma família...</option>' +
                aprovadas.map(r => `<option value="${r.id}">${esc(r.nome)} (${r.num_pessoas} pessoas)</option>`).join('');
        }
    } catch (_) {
        sel.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

function closeEntregaModal() {
    document.getElementById('modalEntrega').style.display = 'none';
    document.getElementById('e_familia').value = '';
    document.getElementById('e_obs').value = '';
}

async function submitEntrega(e) {
    e.preventDefault();
    hideAlert('alertEntregaErr');

    const familia_id = document.getElementById('e_familia').value;
    const observacao = document.getElementById('e_obs').value.trim();

    if (!familia_id) { showAlert('alertEntregaErr', 'Selecione uma família'); return; }

    try {
        const res = await apiFetch(`${API}/entregas`, 'POST', { familia_id: parseInt(familia_id), observacao });
        const data = await res.json();
        if (!res.ok) { showAlert('alertEntregaErr', data.error); return; }
        closeEntregaModal();
        loadEntregas();
        loadAdminStats();
    } catch (_) {
        showAlert('alertEntregaErr', 'Erro ao registrar entrega');
    }
}