# Inglês na Mão 🇧🇷🇺🇸

App web para praticar inglês: gera **frases e palavras aleatórias com tradução PT-BR**, com histórico por usuário, tema claro/escuro e filtros anti-repetição.

## ✨ Funcionalidades

- 🔐 Auth JWT (register / login / refresh) + bcrypt
- 🎲 Geração aleatória **sem repetição** (por usuário)
- 🔎 Filtros de geração: quantidade (1–25), `allow_repeat`, `exclude` (palavras banidas)
- 📚 Histórico paginado com filtro por tipo (`phrase` / `word`)
- ⭐ Favoritos + **importação de lista própria** (cole `house = casa`, até 200/lote)
- 📖 Flashcards + 📝 Quiz (usam favoritos ou histórico)
- 📴 Modo offline (PWA + cache + fila de sincronização) + ⏰ lembrete diário
- 🌙 Tema dark / claro com persistência (`localStorage` + `prefers-color-scheme`)
- 📱 Mobile-first responsivo

## 🧱 Stack

| Camada | Tech |
|---|---|
| Backend | Python 3.11, FastAPI (async), SQLAlchemy 2.0, Alembic, PostgreSQL / SQLite, JWT, bcrypt |
| Frontend | React 18, TypeScript (strict), React Router, Context API, Axios, Vite |
| Infra | Docker + Docker Compose, Nginx (prod do frontend) |
| Arquitetura | Clean Architecture (`domain` / `application` / `infrastructure` / `presentation`) |

## 📁 Estrutura

```
InglesPratico/
├── docker-compose.yml      # db (postgres) + backend + frontend
├── backend/
│   ├── src/
│   │   ├── core/           # config, exceptions, logging
│   │   ├── domain/         # entities + repository protocols
│   │   ├── application/    # use cases + dtos
│   │   ├── infrastructure/ # db models, repositories, security, generator
│   │   └── presentation/   # routers, schemas, dependencies
│   ├── alembic/            # migrations
│   └── tests/
└── frontend/
    └── src/
        ├── domain/         # types
        ├── application/    # hooks (useGenerate, useHistory)
        ├── infrastructure/ # api client, storage
        ├── presentation/   # pages, components, routes
        ├── context/        # AuthContext, ThemeContext
        └── styles/         # global.css (variáveis light/dark)
```

## 🚀 Como rodar

### Opção 1 — Docker (recomendado)

```bash
docker compose up --build -d
```

- Frontend: http://localhost:5173
- Backend docs (Swagger): http://localhost:8000/docs
- Health: http://localhost:8000/health

> O `backend` espera o Postgres ficar `healthy` (`pg_isready`) antes de subir.

### Opção 2 — Local (sem Docker)

**Backend (SQLite por padrão):**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows | source .venv/bin/activate (Linux/Mac)
pip install -e ".[dev]"
uvicorn main:app --reload --app-dir src
```

Para Postgres local:

```bash
set DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ingles  # Windows
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ingles  # Linux/Mac
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

> Se o backend não estiver em `localhost:8000`, configure `VITE_API_URL` (ex: `VITE_API_URL=http://localhost:8000/api/v1`).

## 🔑 API

Base: `/api/v1`

| Método | Rota | Auth | Body / Query | Retorno |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{name, email, password}` | `{access_token, refresh_token}` |
| POST | `/auth/login` | — | `{email, password}` | `{access_token, refresh_token}` |
| POST | `/auth/refresh` | — | `{refresh_token}` | `{access_token, refresh_token}` |
| POST | `/generation/phrases` | Bearer | `{count=10 (1-25), allow_repeat=false, exclude=[]}` | `{id, type, created_at, items[], exhausted}` |
| POST | `/generation/words` | Bearer | `{count=10 (1-25), allow_repeat=false, exclude=[]}` | `{id, type, created_at, items[], exhausted}` |
| GET | `/history?page=1&page_size=10&type=phrase\|word` | Bearer | query | `{total, page, page_size, items[]}` |
| GET | `/history/{batch_id}` | Bearer | — | lote detalhado |
| POST | `/favorites` | Bearer | `{content_en, content_pt, kind}` | favorito (409 se duplo) |
| POST | `/favorites/bulk` | Bearer | `{items: [{content_en, content_pt, kind}]}` (máx 200) | `{added, skipped, items}` |
| GET | `/favorites?kind=word\|phrase` | Bearer | query | `{total, items}` |
| DELETE | `/favorites/{id}` ou `/favorites/by-content?content_en=...` | Bearer | — | 204 |
| GET | `/progress/daily` | Bearer | — | palavra + frase do dia |
| GET | `/progress/stats` | Bearer | — | totais, streak, últimos 7 dias |

**Anti-repetição:** com `allow_repeat=false` (padrão), o backend exclui `content_en` que o usuário já gerou. Se o estoque novo acabar, retorna `exhausted: true` com o que restou — ou `409` se não sobrar nada.

**Filtro `exclude`:** remove itens que contenham aquelas palavras (ex: `{"exclude": ["book", "rain"]}`).

Exemplo:

```bash
curl -X POST http://localhost:8000/api/v1/generation/phrases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "allow_repeat": false, "exclude": ["book"]}'
```

## 🧪 Testes

```bash
# Backend (a partir de backend/)
$env:PYTHONPATH="src"; python -m pytest -q   # Windows PowerShell
PYTHONPATH=src pytest -q                      # Linux/Mac

# Frontend
cd frontend
npm run build   # tsc + vite (valida tipos)
npm run test    # vitest
```

## ⚙️ Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` (nunca commite o `.env`):

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/ingles
JWT_SECRET_KEY=troque-por-uma-chave-forte-de-32+-chars
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📝 Notas de decisão

- **Context API vs Zustand:** auth e tema usam Context API (estado simples, menor bundle). Para app maior, Zustand seria preferível (seletores granulares, persist middleware).
- **Gerador offline:** lista estática em `backend/src/infrastructure/external/generator.py` (sem dependência de IA externa) — fácil trocar por LLM depois atrás do mesmo protocolo.
- **SQLite em dev, Postgres em prod:** `lifespan` cria tabelas automaticamente (dev); em prod usar `alembic upgrade head`.
