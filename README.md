# 🌱 Fome Zero Conectada

Plataforma que conecta famílias em situação de insegurança alimentar com doadores e ONGs.

**ODS 2 — Fome Zero | Desenvolvido por Matheus Correia (ADS - Uninter)**

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) v16 ou superior
- npm (vem junto com o Node.js)

### Instalação

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

---

## 🔑 Credenciais do Painel Admin

| Campo | Valor |
|-------|-------|
| E-mail | `` |
| Senha  | `` |

---

## 📁 Estrutura do Projeto

```
fomezero/
├── backend/
│   ├── server.js          # Entrada principal do servidor
│   ├── database.js        # Inicialização do banco SQLite
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   └── routes/
│       ├── auth.js        # Login
│       ├── familias.js    # CRUD famílias
│       ├── doadores.js    # CRUD doadores
│       ├── entregas.js    # CRUD entregas
│       └── stats.js       # Estatísticas
└── frontend/
    ├── index.html         # SPA - página única
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

---

## 🗄️ Banco de Dados

O banco SQLite (`fomezero.db`) é criado automaticamente na pasta `backend/` na primeira execução.

### Tabelas:
- **familias** — cadastros de famílias solicitando cestas
- **doadores** — registros de doações
- **entregas** — entregas realizadas vinculadas a famílias
- **usuarios** — usuários do painel administrativo

---

## 🔗 Endpoints da API

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login admin |
| POST | `/api/familias` | Cadastrar família |
| POST | `/api/doadores` | Registrar doação |
| GET | `/api/stats/publico` | Estatísticas públicas |

### Protegidos (requer token JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/familias` | Listar famílias |
| PATCH | `/api/familias/:id/status` | Atualizar status |
| DELETE | `/api/familias/:id` | Remover família |
| GET | `/api/doadores` | Listar doadores |
| DELETE | `/api/doadores/:id` | Remover doador |
| GET | `/api/entregas` | Listar entregas |
| POST | `/api/entregas` | Registrar entrega |
| DELETE | `/api/entregas/:id` | Remover entrega |
| GET | `/api/stats/admin` | Estatísticas admin |

---

## 🛠️ Tecnologias

- **Backend:** Node.js, Express, sql.js (SQLite), bcryptjs, jsonwebtoken
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Banco de dados:** SQLite (arquivo local)

---

© 2026 Fome Zero Conectada · Matheus Correia
