const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// O dotenv já foi carregado no seu server.js, então o process.env já funciona aqui!
const DB_PATH = path.join(__dirname, 'fomezero.db');
let db;

async function initDB() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS familias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        endereco TEXT NOT NULL,
        num_pessoas INTEGER NOT NULL,
        renda REAL,
        telefone TEXT NOT NULL,
        email TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TEXT DEFAULT (datetime('now','localtime'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS doadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        qtd_cestas INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS entregas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        familia_id INTEGER NOT NULL,
        observacao TEXT,
        status TEXT DEFAULT 'realizada',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (familia_id) REFERENCES familias(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        nome TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
        )
    `);

    // 1. Pegar os dados do arquivo .env ou usar um fallback seguro caso esqueça de preencher
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fomezero.org';
    const adminRawPassword = process.env.ADMIN_PASSWORD;

    // 2. Usar Prepared Statement para verificar se o admin existe de forma segura
    const stmtCheck = db.prepare(`SELECT id FROM usuarios WHERE email = ?`);
    const existing = stmtCheck.getAsObject([adminEmail]);
    stmtCheck.free(); // Libera a memória do statement

    // Se o usuário admin não existir no banco de dados, nós o criamos agora
    if (!existing.id) {
        // Se você esqueceu de colocar o ADMIN_PASSWORD no .env, avisamos no console
        if (!adminRawPassword) {
            console.warn('⚠️ ATENÇÃO: ADMIN_PASSWORD não foi definido no arquivo .env! Usando senha padrão temporária.');
        }

        const passwordToHash = adminRawPassword || 'Mudar@Senha123_Urgente';
        const hash = bcrypt.hashSync(passwordToHash, 10);

        // 3. Inserindo os dados usando parâmetros (?) para total segurança contra SQL Injection
        db.run(
            `INSERT INTO usuarios (email, senha, nome, role) VALUES (?, ?, ?, ?)`,
            [adminEmail, hash, 'Administrador', 'admin']
        );
        
        console.log(`👤 Usuário administrador padrão (${adminEmail}) criado com sucesso!`);
    }

    saveDB();
    console.log('📦 Banco de dados inicializado com sucesso!');
}

function getDB() {
    return db;
}

function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { initDB, getDB, saveDB };