const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const auth = require('../middleware/auth');

// Público: stats para o hero
router.get('/publico', (req, res) => {
    const db = getDB();

    const familias = db.exec(`SELECT COUNT(*) FROM familias`);
    const cestas = db.exec(`SELECT COALESCE(SUM(qtd_cestas), 0) FROM doadores`);
    const doadores = db.exec(`SELECT COUNT(*) FROM doadores`);

    res.json({
        familias: familias[0]?.values[0][0] || 0,
        cestas: cestas[0]?.values[0][0] || 0,
        doadores: doadores[0]?.values[0][0] || 0,
    });
});

// Admin: stats completas
router.get('/admin', auth, (req, res) => {
    const db = getDB();

    const totalFamilias = db.exec(`SELECT COUNT(*) FROM familias`);
    const aprovadas = db.exec(`SELECT COUNT(*) FROM familias WHERE status = 'aprovada'`);
    const pendentes = db.exec(`SELECT COUNT(*) FROM familias WHERE status = 'pendente'`);
    const cestasProm = db.exec(`SELECT COALESCE(SUM(qtd_cestas), 0) FROM doadores`);
    const entregas = db.exec(`SELECT COUNT(*) FROM entregas`);
    const totalDoadores = db.exec(`SELECT COUNT(*) FROM doadores`);

    res.json({
        totalFamilias: totalFamilias[0]?.values[0][0] || 0,
        aprovadas: aprovadas[0]?.values[0][0] || 0,
        pendentes: pendentes[0]?.values[0][0] || 0,
        cestasPrometidas: cestasProm[0]?.values[0][0] || 0,
        entregasRealizadas: entregas[0]?.values[0][0] || 0,
        totalDoadores: totalDoadores[0]?.values[0][0] || 0,
    });
});

module.exports = router;
