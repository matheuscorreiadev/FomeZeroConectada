const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../database');

const SECRET = process.env.JWT_SECRET || 'fomezero_secret_2026';

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const db = getDB();
    const result = db.exec(`SELECT * FROM usuarios WHERE email = '${email.replace(/'/g, "''")}'`);

    if (!result.length || !result[0].values.length) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    cols.forEach((c, i) => user[c] = row[i]);

    if (!bcrypt.compareSync(senha, user.senha)) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '8h' });
    res.json({ token, nome: user.nome, role: user.role });
});

module.exports = router;
