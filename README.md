# Sistema de Gestão Escolar

Sistema completo de gestão escolar com frontend (React 19 + Vite 7) e backend (NestJS + SQLite).

## Estrutura do projeto

```
escola/
├── src/                          # Frontend React
│   ├── assets/
│   ├── components/               # Sidebar, Header, Layout
│   ├── pages/                    # Dashboard, Alunos, Professores, etc.
│   ├── services/                 # api.js, alunosService, pagamentosService
│   ├── routes/                   # router.jsx (React Router)
│   ├── hooks/                    # useAuth e outros hooks
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/                      # API NestJS
│   └── src/
│       ├── common/               # base.entity
│       ├── modules/
│       │   ├── auth/             # JWT, login
│       │   ├── users/
│       │   ├── students/
│       │   ├── teachers/
│       │   ├── classes/
│       │   ├── grades/
│       │   ├── attendance/
│       │   ├── meetings/
│       │   └── payments/
│       └── main.ts
├── database/
│   └── schema.sql                # Schema SQLite de referência
├── index.html
├── package.json
└── vite.config.js
```

## Login e cadastro

- **Admin geral**: na primeira execução do backend é criado um usuário administrador:
  - E-mail: `admin@escola.com`
  - Senha: `admin123`
  (Altere a senha em produção.)

- **Escolas**: na tela de login há o link "Cadastre-se". A escola preenche nome, e-mail e senha. O cadastro fica aguardando aprovação. O admin geral entra em "Aprovar escolas" no menu e clica em "Permitir" para liberar cada escola. Só depois disso a escola consegue fazer login.

## Como executar

### Frontend

```bash
npm install
npm run dev
```

Acesse http://localhost:5173. A API é chamada em `http://localhost:3000` (configure `VITE_API_URL` em `.env` se necessário).

### Backend

```bash
cd backend
npm install
npm run start:dev
```

A API sobe em http://localhost:3000. O banco SQLite é criado em `backend/escola.db` na primeira execução (TypeORM synchronize).

### Banco de dados

O backend usa TypeORM com SQLite e `synchronize: true`, então as tabelas são criadas/atualizadas automaticamente.

Para criar o banco manualmente a partir do SQL:

```bash
sqlite3 backend/escola.db < database/schema.sql
```

## Rotas do frontend

| Rota         | Página      |
|-------------|-------------|
| /dashboard  | Dashboard   |
| /alunos     | Alunos      |
| /professores| Professores |
| /turmas     | Turmas      |
| /notas      | Notas       |
| /presenca   | Presença    |
| /financeiro | Financeiro  |
| /reunioes   | Reuniões    |

## Endpoints da API (exemplos)

- `POST /auth/login` – Login (email, password), retorna `access_token`
- `GET/POST/PUT/DELETE /students` – CRUD alunos
- `GET/POST/PUT/DELETE /teachers` – CRUD professores
- `GET/POST/PUT/DELETE /classes` – CRUD turmas
- `GET/POST /grades` – Listar e criar notas
- `GET/POST /attendance` – Listar e registrar presença
- `GET/POST /meetings` – Listar e criar reuniões
- `GET/POST/PUT /payments` – CRUD pagamentos

## Arquitetura

- **Frontend**: SPA com React Router; layout com Sidebar + Header; serviços Axios com interceptor de JWT; páginas por módulo (alunos, notas, etc.).
- **Backend**: NestJS modular; um módulo por entidade (auth, users, students, teachers, classes, grades, attendance, meetings, payments); TypeORM com SQLite; autenticação JWT no login (senha em texto no exemplo – trocar por hash em produção).
- **Banco**: SQLite com tabelas users, students, teachers, classes, subjects, enrollments, grades, attendance, meetings, payments, invoices, messages; todas com id, created_at, updated_at e FKs onde aplicável.

## Melhorias futuras sugeridas

1. **Segurança**: Hash de senha (bcrypt) no backend; guard JWT no frontend para rotas protegidas; refresh token.
2. **Extras**: Nodemailer para e-mail; integração WhatsApp; geração de boleto (biblioteca de boleto); relatórios em PDF.
3. **Funcionalidades**: Área do responsável (ver notas, faltas, boletos, comunicados); envio de comunicados; dashboard com totais e gráficos.
4. **Dados**: Migrations em vez de synchronize em produção; seeds para usuário inicial e dados de teste.
5. **UX**: Formulários completos nas páginas; listagens com paginação e filtro; feedback de loading e erro.
