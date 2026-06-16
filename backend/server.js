const path = require('path'); // 1. Declarado aqui no topo
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
// const path = require('path'); <-- APAGADO DAQUI PARA NÃO DUPLICAR

const { initDB, getDB } = require('./database');
const familiaRoutes = require('./routes/familias');
const doadorRoutes = require('./routes/doadores');
const entregaRoutes = require('./routes/entregas');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/familias', familiaRoutes);
app.use('/api/doadores', doadorRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/stats', statsRoutes);

// Fallback to index.html
app.get('/*any', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
        console.log(`📊 Painel admin: http://localhost:${PORT}/#admin`);
        
        // Exibe apenas o e-mail configurado para confirmar que o .env foi lido
        console.log(`🔑 Admin configurado para: ${process.env.ADMIN_EMAIL || 'admin@fomezero.org'}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar banco de dados:', err);
    process.exit(1);
});