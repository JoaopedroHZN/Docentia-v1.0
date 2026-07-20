# 🎨 Docentia — Frontend

Interface web do sistema Docentia, desenvolvida com React + Vite.

## Tecnologias
- React 19 + Vite
- React Router DOM
- Axios (cliente HTTP)
- React Hot Toast (notificações)

## Como Rodar

```bash
npm install
npm run dev

# Acesse http://localhost:5173
```

## Build de Produção

```bash
npm run build

# Os arquivos estáticos ficam em dist/
```

## Estrutura de Páginas

```
src/pages/
├── Login.jsx                 # Tela de login / primeiro acesso
├── Dashboard.jsx             # Visão geral do admin
├── PainelInstrutor.jsx       # Painel do docente (visualiza aulas)
├── GerenciarCursos.jsx       # CRUD de cursos
├── GerenciarUCs.jsx          # CRUD de unidades curriculares
├── GerenciarTurmas.jsx       # CRUD de turmas
├── GerenciarSalas.jsx        # CRUD de salas
├── GerenciarProfessores.jsx  # CRUD de professores (vínculo com curso)
├── GerenciarUsuarios.jsx     # CRUD de usuários
├── MatrizCurricular.jsx      # UCs por curso
├── ListaAgendamentos.jsx     # Tabela de agendamentos (admin)
├── NovoAgendamento.jsx       # Formulário de agendamento
└── Relatorios.jsx            # Relatórios com exportação CSV
```

## Variável de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL da API backend (ex: `https://docentia-api.onrender.com`) |

Se não definida, usa `http://localhost:8080` por padrão.

## Autor
João Pedro Menezes
