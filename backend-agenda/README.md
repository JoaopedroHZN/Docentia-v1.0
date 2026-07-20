# 🔧 Docentia — Backend API

API RESTful do sistema Docentia, desenvolvida com Spring Boot 3.4 e Java 17.

## Tecnologias
- Spring Boot 3.4 + Spring Security + JWT (Auth0)
- Spring Data JPA + Hibernate
- PostgreSQL 16 (Docker)
- BCrypt para criptografia de senhas

## Como Rodar

```bash
# Subir banco de dados
docker compose up -d

# Executar API
./mvnw spring-boot:run

# API disponível em http://localhost:8080
```

## Estrutura de Pacotes

```
br.com.docentia.agenda/
├── config/          # SecurityConfig, CorsConfig, TokenService, SecurityFilter
├── controller/      # Agendamento, Autenticacao, Curso, Instrutor, Sala, Turma, UnidadeCurricular
├── model/           # Agendamento, Curso, Instrutor, Sala, Turma, UnidadeCurricular, enums
├── repository/      # Interfaces JPA com queries de conflito e busca
├── service/         # AgendamentoService (validações de conflito), AutenticacaoService
└── exception/       # BusinessException, GlobalExceptionHandler
```

## Variáveis de Ambiente (Produção)

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL JDBC do PostgreSQL |
| `PGUSER` | Usuário do banco |
| `PGPASSWORD` | Senha do banco |
| `PORT` | Porta do servidor (padrão: 8080) |

## Autor
João Pedro Menezes
