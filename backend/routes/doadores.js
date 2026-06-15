const express = require('express');
const router = express.Router();
const { getDB, saveDB } = require('../database');
const auth = require('../middleware/auth');

// Público: registrar doação
router.post('/', (req, res) => {
    const { nome, tipo, email, telefone, qtd_cestas } = req.body;
    if (!nome || !tipo || !email || !telefone || !qtd_cestas) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const db = getDB();
    db.run(
        `INSERT INTO doadores (nome, tipo, email, telefone, qtd_cestas) VALUES (?, ?, ?, ?, ?)`,
        [nome, tipo, email, telefone, parseInt(qtd_cestas)]
    );
    saveDB();

    res.status(201).json({ message: 'Doação registrada com sucesso! Obrigado!' });
});

// Admin: listar todos
router.get('/', auth, (req, res) => {
    const db = getDB();
    const result = db.exec(`SELECT * FROM doadores ORDER BY created_at DESC`);
    if (!result.length) return res.json([]);

    const cols = result[0].columns;
    const rows = result[0].values.map(row => {
        const obj = {};
        cols.forEach((c, i) => obj[c] = row[i]);
        return obj;
    });
    res.json(rows);
});

// Admin: deletar
router.delete('/:id', auth, (req, res) => {
    const db = getDB();
    db.run(`DELETE FROM doadores WHERE id = ?`, [req.params.id]);
    saveDB();
    res.json({ message: 'Doador removido' });
});

module.exports = router;
