const express = require('express');
const router = express.Router();
const { getDB, saveDB } = require('../database');
const auth = require('../middleware/auth');

// Público: cadastrar família
router.post('/', (req, res) => {
    const { nome, cpf, endereco, num_pessoas, renda, telefone, email } = req.body;
    if (!nome || !cpf || !endereco || !num_pessoas || !telefone) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const db = getDB();

    // Check CPF duplicado
    const existing = db.exec(`SELECT id FROM familias WHERE cpf = '${cpf.replace(/'/g, "''")}'`);
    if (existing.length && existing[0].values.length) {
        return res.status(409).json({ error: 'CPF já cadastrado no sistema' });
    }

    db.run(
        `INSERT INTO familias (nome, cpf, endereco, num_pessoas, renda, telefone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, cpf, endereco, parseInt(num_pessoas), parseFloat(renda) || null, telefone, email || null]
    );
    saveDB();

    res.status(201).json({ message: 'Família cadastrada com sucesso!' });
});

// Admin: listar todas
router.get('/', auth, (req, res) => {
    const db = getDB();
    const result = db.exec(`SELECT * FROM familias ORDER BY created_at DESC`);
    if (!result.length) return res.json([]);

    const cols = result[0].columns;
    const rows = result[0].values.map(row => {
        const obj = {};
        cols.forEach((c, i) => obj[c] = row[i]);
        return obj;
    });
    res.json(rows);
});

// Admin: atualizar status
router.patch('/:id/status', auth, (req, res) => {
    const { status } = req.body;
    if (!['pendente', 'aprovada', 'rejeitada'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }
    const db = getDB();
    db.run(`UPDATE familias SET status = ? WHERE id = ?`, [status, req.params.id]);
    saveDB();
    res.json({ message: 'Status atualizado' });
});

// Admin: deletar
router.delete('/:id', auth, (req, res) => {
    const db = getDB();
    db.run(`DELETE FROM familias WHERE id = ?`, [req.params.id]);
    saveDB();
    res.json({ message: 'Família removida' });
});

module.exports = router;
