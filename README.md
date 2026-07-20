# 🎓 Docentia — Plataforma de Gestão Curricular e Docente

Sistema web completo para substituir planilhas compartilhadas na gestão de agendamentos de aulas, turmas, cursos e professores.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + Vite + Axios + React Router |
| **Backend** | Spring Boot 3.4 + Java 17 + Spring Security + JWT |
| **Banco** | PostgreSQL 16 (Docker) |
| **Hospedagem** | Render (nuvem gratuita) ou servidor local Linux |

---

## 📋 Funcionalidades

### 👨‍💼 Admin (Coordenador)
- Dashboard com visão geral do sistema
- **CRUD completo:** Cursos, Unidades Curriculares (UCs), Turmas, Salas, Professores
- **Matriz Curricular:** visualiza UCs vinculadas a cada curso
- **Agendamentos:** cria aulas vinculando Turma → Curso → UC → Professor → Sala
  - Validação automática de conflitos (turma, professor e sala ocupados no mesmo turno/período)
  - Dropdown de salas com **filtro de disponibilidade em tempo real**
- **Relatórios:** filtros por data, turno, turma e professor + **exportação CSV**
- **Gerenciamento de usuários** com perfis ADMIN e INSTRUTOR

### 👨‍🏫 Instrutor (Docente)
- **Painel pessoal** com todas as aulas agendadas
- Visualiza: período, horário, turno, curso, turma, unidade curricular e sala
- **Primeiro acesso** define sua própria senha

### 🔒 Segurança
- Autenticação JWT stateless (2h de expiração)
- Senhas criptografadas com BCrypt
- ADMIN não pode ser vinculado a agendamentos (apenas INSTRUTORES ministram aulas)
- CORS configurado para desenvolvimento e produção

---

## ⚡ Deploy Rápido (Render)

O projeto está pronto para deploy gratuito na nuvem:

| Serviço Render | Descrição |
|----------------|-----------|
| **PostgreSQL** | Banco de dados (criar manualmente no dashboard) |
| **Web Service (Docker)** | Backend Spring Boot (aponta para `backend-agenda/`) |
| **Static Site** | Frontend React (comando: `cd frontend-agenda && npm install && npm run build`, publish: `frontend-agenda/dist`) |

> **Variáveis de ambiente no Web Service:** `DATABASE_URL`, `PGUSER`, `PGPASSWORD`, `PORT=8080`
> **Variável no Static Site:** `VITE_API_URL` = URL do backend


---

## 💻 Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/JoaopedroHZN/Docentia-v1.0.git
cd Docentia-v1.0

# 2. Suba o banco PostgreSQL (Docker)
cd backend-agenda && docker compose up -d

# 3. Rode o backend (Spring Boot)
./mvnw spring-boot:run

# 4. Em outro terminal, rode o frontend (React)
cd frontend-agenda && npm install && npm run dev

# Acesse: http://localhost:5173
```

---

## 📁 Estrutura do Projeto

```
Agenda/
├── backend-agenda/          # API REST Spring Boot
│   ├── Dockerfile           # Container para deploy
│   ├── docker-compose.yml   # PostgreSQL local
│   └── src/main/java/br/com/docentia/agenda/
│       ├── config/          # Security, CORS, JWT
│       ├── controller/      # Endpoints REST
│       ├── model/           # Entidades JPA
│       ├── repository/      # Queries e validações de conflito
│       └── service/         # Lógica de negócio
├── frontend-agenda/         # SPA React + Vite
│   └── src/
│       ├── components/      # Sidebar, SelectCursos
│       ├── layouts/         # DashboardLayout
│       ├── pages/           # 12 páginas (CRUDs, Agendamentos, Relatórios, etc.)
│       └── services/        # API client (Axios)
└── README.md
```

---

## 👤 Autor

Desenvolvido por **João Pedro Menezes**.

---

## 📄 Licença

Projeto open source para fins educacionais.
