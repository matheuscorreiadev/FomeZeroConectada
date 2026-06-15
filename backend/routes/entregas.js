const express = require('express');
const router = express.Router();
const { getDB, saveDB } = require('../database');
const auth = require('../middleware/auth');

// Admin: registrar entrega
router.post('/', auth, (req, res) => {
    const { familia_id, observacao } = req.body;
    if (!familia_id) {
        return res.status(400).json({ error: 'Família é obrigatória' });
    }

    const db = getDB();

    // Verificar se família existe e está aprovada
    const fam = db.exec(`SELECT id, status FROM familias WHERE id = ${parseInt(familia_id)}`);
    if (!fam.length || !fam[0].values.length) {
        return res.status(404).json({ error: 'Família não encontrada' });
    }
    const status = fam[0].values[0][1];
    if (status !== 'aprovada') {
        return res.status(400).json({ error: 'Família não está aprovada' });
    }

    db.run(
        `INSERT INTO entregas (familia_id, observacao) VALUES (?, ?)`,
        [parseInt(familia_id), observacao || null]
    );
    saveDB();

    res.status(201).json({ message: 'Entrega registrada com sucesso!' });
});

// Admin: listar todas com nome da família
router.get('/', auth, (req, res) => {
    const db = getDB();
    const result = db.exec(`
    SELECT e.id, e.observacao, e.status, e.created_at,
    f.nome AS familia_nome, f.id AS familia_id
    FROM entregas e
    JOIN familias f ON e.familia_id = f.id
    ORDER BY e.created_at DESC
`);
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
    db.run(`DELETE FROM entregas WHERE id = ?`, [req.params.id]);
    saveDB();
    res.json({ message: 'Entrega removida' });
});

module.exports = router;
