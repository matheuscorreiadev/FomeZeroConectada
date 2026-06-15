const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

    // Create default admin if not exists
    const existing = db.exec(`SELECT id FROM usuarios WHERE email = 'admin@fomezero.org'`);
    if (!existing.length || !existing[0].values.length) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO usuarios (email, senha, nome, role) VALUES ('admin@fomezero.org', '${hash}', 'Administrador', 'admin')`);
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
