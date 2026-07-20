# 📋 Agenda de Instrutores — SENAI

API RESTful para gestão de agendamentos de aulas e instrutores do SENAI, desenvolvida com **Spring Boot 4.1** e **Java 21**, com autenticação stateless via **JWT** e persistência em **PostgreSQL 16**.

---

## 🧱 Arquitetura de Dados

### Entidades e Relacionamentos

O domínio é composto por duas entidades principais e dois enumeradores de apoio:

| Entidade | Tabela | Descrição |
|---|---|---|
| `Instrutor` | `instrutores` | Usuário do sistema. Implementa `UserDetails` do Spring Security. |
| `Agendamento` | `agendamentos` | Registro de uma aula agendada. |
| `Perfil` *(enum)* | — | `ADMIN` ou `INSTRUTOR`. |
| `Turno` *(enum)* | — | `MATUTINO`, `VESPERTINO` ou `NOTURNO`. |

```
┌──────────────────────┐          ┌──────────────────────────┐
│      Instrutor       │ 1     N  │       Agendamento         │
├──────────────────────┤          ├──────────────────────────┤
│ id          (PK)     │◄─────────│ id               (PK)    │
│ nome                 │          │ dataAula                  │
│ email      (UNIQUE)  │          │ turno          (ENUM)    │
│ senha     (BCrypt)   │          │ curso                     │
│ perfil     (ENUM)    │          │ unidadeCurricular         │
└──────────────────────┘          │ observacoes               │
                                  │ sala                      │
                                  │ horario                   │
                                  │ instrutor_id    (FK)     │
                                  └──────────────────────────┘
```

#### `Instrutor`

- Implementa `UserDetails` — o campo `email` atua como `username`, e `senha` como `password`.
- A senha é armazenada com hash **BCrypt** (nunca em texto plano) e anotada com `@JsonProperty(access = WRITE_ONLY)`, garantindo que **jamais é exposta nas respostas JSON**.
- O método `getAuthorities()` define a estratégia de papéis:
  - `ADMIN` → recebe `ROLE_ADMIN` **e** `ROLE_INSTRUTOR` (acesso total).
  - `INSTRUTOR` → recebe apenas `ROLE_INSTRUTOR` (acesso restrito a consultas).

#### `Agendamento`

- Relacionamento `@ManyToOne` com `Instrutor` — um instrutor pode ter vários agendamentos.
- `dataAula` (`LocalDate`) + `turno` (`Turno`) formam a chave lógica de unicidade de ocupação.
- Campos com `@NotBlank`/`@NotNull` + `nullable = false` garantem integridade em duas camadas (aplicação e banco).

#### Registros Auxiliares (DTOs)

| Record | Uso |
|---|---|
| `DadosLogin` | `email` + `senha` — corpo da requisição de login. |
| `DadosTokenJWT` | `token` — corpo da resposta de login. |
| `DadosPrimeiroAcesso` | `email` + `novaSenha` — definição de senha no primeiro acesso. |

---

## 🔒 Segurança — Spring Security + JWT

A segurança da API opera em três camadas: **filtro HTTP**, **configuração declarativa de rotas** e **autorização por método**.

### 1. Configuração Stateless (`SecurityConfig`)

- `SessionCreationPolicy.STATELESS` — o servidor **não mantém sessão**. Cada requisição precisa trazer um token JWT válido no cabeçalho `Authorization`.
- `csrf.disable()` — CSRF é irrelevante para APIs REST que usam tokens no header (não há cookies de sessão).
- `cors.configure(http)` — delega o controle de CORS para a classe `CorsConfig`.

### 2. Controle de Acesso às Rotas

| Rota | Método | Acesso | Justificativa |
|---|---|---|---|
| `/login` | `POST` | `permitAll()` | Ninguém tem token antes de se autenticar. |
| `/instrutores/primeiro-acesso` | `POST` | `permitAll()` | Usuário recém-cadastrado define sua senha pela primeira vez. |
| **Todas as demais** | `*` | `authenticated()` | Exige token JWT válido. |

### 3. Fluxo de Autenticação

```
Cliente                          Servidor
  │                                 │
  │  POST /login {email, senha}     │
  │ ─────────────────────────────►  │
  │                                 │ AuthenticationManager.authenticate()
  │                                 │   ├─ AutenticacaoService.loadUserByUsername()
  │                                 │   ├─ BCryptPasswordEncoder.matches()
  │                                 │   └─ Retorna Instrutor autenticado
  │                                 │
  │                                 │ TokenService.gerarToken(instrutor)
  │                                 │   ├─ Algorithm.HMAC256("senai-coped-secreto-123")
  │                                 │   ├─ Subject = email
  │                                 │   ├─ Claims: id, perfil
  │                                 │   └─ Expiração: +2 horas
  │                                 │
  │  ◄───────────────────────────── │ 200 { "token": "eyJ..." }
  │                                 │
  │  GET /agendamentos              │
  │  Authorization: Bearer eyJ...   │
  │ ─────────────────────────────►  │
  │                                 │ SecurityFilter.doFilterInternal()
  │                                 │   ├─ Extrai token do header
  │                                 │   ├─ TokenService.getSubject(token)
  │                                 │   │    └─ Verifica assinatura HMAC e expiração
  │                                 │   ├─ InstrutorRepository.findByEmail()
  │                                 │   └─ SecurityContextHolder.setAuthentication()
  │                                 │
  │  ◄───────────────────────────── │ 200 [lista de agendamentos]
```

### 4. Authorização por Método (`@PreAuthorize`)

As operações de **escrita** (criação, edição e exclusão) são protegidas com a anotação `@PreAuthorize("hasRole('ADMIN')")` nos controllers:

| Controller | Método | Restrição |
|---|---|---|
| `InstrutorController` | `POST /instrutores` | `hasRole('ADMIN')` |
| `InstrutorController` | `PUT /instrutores/{id}` | `hasRole('ADMIN')` |
| `InstrutorController` | `DELETE /instrutores/{id}` | `hasRole('ADMIN')` |
| `AgendamentoController` | `POST /agendamentos` | `hasRole('ADMIN')` |
| `AgendamentoController` | `PUT /agendamentos/{id}` | `hasRole('ADMIN')` |
| `AgendamentoController` | `DELETE /agendamentos/{id}` | `hasRole('ADMIN')` |

**Consultas** (`GET`) são acessíveis a qualquer perfil autenticado, permitindo que instrutores visualizem sua própria agenda sem permissão de administrador.

### 5. CORS (`CorsConfig`)

Configuração permissiva para desenvolvimento — todas as origens, métodos (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) e cabeçalhos (incluindo `Authorization` para o token JWT) são liberados via `addCorsMappings("/**")`.

> ⚠️ Em produção, restrinja `.allowedOrigins()` ao domínio específico do frontend.

---

## 🧠 Lógica de Negócio — Integridade da Agenda

A robustez da agenda é garantida por **validações de conflito em nível de aplicação**, executadas antes de qualquer persistência, complementadas por restrições no banco de dados.

### Validação de Conflitos no `AgendamentoController`

#### Na Criação (`POST /agendamentos`)

Antes de salvar, o sistema executa **três verificações sequenciais**:

1. **Admin não pode ministrar aula** — se o instrutor vinculado ao agendamento tiver perfil `ADMIN`, retorna **400 Bad Request**.

2. **Conflito de instrutor** — consulta `existsByInstrutorIdAndDataAulaAndTurno` no `AgendamentoRepository`. Se o mesmo instrutor já possui aula no **mesmo dia e turno**, retorna **400** com a mensagem:  
   `"Este Instrutor já possui uma aula agendada para este mesmo dia e turno!"`

3. **Conflito de sala** — consulta `existsBySalaAndDataAulaAndTurno`. Se a sala/laboratório já estiver ocupada naquele **mesmo dia e turno**, retorna **400** com a mensagem:  
   `"Esta sala ou laboratório já está ocupado neste dia e turno!"`

Somente se as três validações forem aprovadas o agendamento é persistido.

#### Na Atualização (`PUT /agendamentos/{id}`)

A lógica é semelhante, mas utiliza os métodos `...AndIdNot` para **excluir o próprio registro da verificação**, evitando falso-positivo quando o agendamento editado é o único ocupante do slot:

- `existsByInstrutorIdAndDataAulaAndTurnoAndIdNot` — verifica se há **outro** agendamento do mesmo instrutor no mesmo dia/turno.
- `existsBySalaAndDataAulaAndTurnoAndIdNot` — verifica se há **outro** agendamento ocupando a mesma sala no mesmo dia/turno.

Isso garante que uma edição legítima (ex.: trocar apenas o horário mantendo mesmo instrutor, data e turno) não seja bloqueada incorretamente.

### Diagrama de Decisão — Criação de Agendamento

```
Recebe POST /agendamentos
         │
         ▼
┌─────────────────────────────┐
│ Instrutor tem perfil ADMIN? │──SIM──► 400 "ADMIN não pode ministrar aulas"
└──────────┬──────────────────┘
           │NÃO
           ▼
┌──────────────────────────────────────┐
│ Instrutor já tem aula neste          │
│ dia + turno?                          │──SIM──► 400 "Instrutor já possui aula..."
│ (existsByInstrutorIdAndDataAulaAndTurno) │
└──────────┬───────────────────────────┘
           │NÃO
           ▼
┌──────────────────────────────────────┐
│ Sala já está ocupada neste           │
│ dia + turno?                          │──SIM──► 400 "Sala já está ocupada..."
│ (existsBySalaAndDataAulaAndTurno)     │
└──────────┬───────────────────────────┘
           │NÃO
           ▼
      200 OK — Agendamento salvo
```

### Tratamento Global de Exceções (`GlobalExceptionHandler`)

O `@ControllerAdvice` centraliza o tratamento de erros, garantindo respostas padronizadas no formato `ErroResposta` (timestamp, status HTTP, tipo do erro, mensagem descritiva, caminho da requisição):

| Exceção | Gatilho | Status |
|---|---|---|
| `DataIntegrityViolationException` | Violação de constraints no banco (ex.: email duplicado) | 400 |
| `MethodArgumentNotValidException` | Falha nas anotações `@NotBlank`/`@NotNull`/`@Email` | 400 |
| `HttpMessageNotReadableException` | Enum inválido no JSON (ex.: `turno: "TARDE"` em vez de `VESPERTINO`) | 400 |

---

## 🌐 API RESTful — Design

A API segue os princípios REST com endpoints nomeados por substantivos no plural, verbos HTTP semânticos e respostas padronizadas.

### Endpoints — `Instrutores`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/instrutores` | Autenticado | Lista paginada de instrutores |
| `POST` | `/instrutores` | `ADMIN` | Cadastra novo instrutor (senha criptografada com BCrypt) |
| `PUT` | `/instrutores/{id}` | `ADMIN` | Atualiza dados do instrutor (senha só é recriptografada se enviada) |
| `DELETE` | `/instrutores/{id}` | `ADMIN` | Remove instrutor |
| `POST` | `/instrutores/primeiro-acesso` | Público | Define a primeira senha de um instrutor pré-cadastrado |

### Endpoints — `Agendamentos`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/agendamentos` | Autenticado | Lista paginada de todos os agendamentos |
| `GET` | `/agendamentos/buscar?turno=` | Autenticado | Filtra por turno |
| `GET` | `/agendamentos/buscar-duplo?sala=&turno=` | Autenticado | Filtra por sala + turno |
| `GET` | `/agendamentos/buscar-data?data=` | Autenticado | Filtra por data específica |
| `GET` | `/agendamentos/buscar-professor?id=` | Autenticado | Filtra por ID do instrutor |
| `GET` | `/agendamentos/buscar-curso?termo=` | Autenticado | Busca textual por curso (case-insensitive) |
| `POST` | `/agendamentos` | `ADMIN` | Cria agendamento com validação de conflitos |
| `PUT` | `/agendamentos/{id}` | `ADMIN` | Atualiza agendamento com validação de conflitos |
| `DELETE` | `/agendamentos/{id}` | `ADMIN` | Remove agendamento |

### Endpoint — `Autenticação`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/login` | Público | Autentica credenciais e retorna token JWT |

### Padrões REST Adotados

- **Paginação**: `GET /instrutores` e `GET /agendamentos` aceitam `Pageable` (parâmetros `?page=0&size=10&sort=nome,asc`).
- **Status HTTP semânticos**:
  - `200 OK` — operação bem-sucedida com corpo de resposta.
  - `201 Created` — cadastro de instrutor bem-sucedido.
  - `204 No Content` — deleção bem-sucedida (sem corpo).
  - `400 Bad Request` — erro de validação ou conflito de agenda.
  - `404 Not Found` — recurso não encontrado.
- **Validação de entrada**: `@Valid` nos corpos de requisição aciona as anotações Bean Validation (`@NotBlank`, `@NotNull`, `@Email`).

---

## 🐳 Infraestrutura — Docker

O projeto utiliza **Docker Compose** para provisionar o banco de dados PostgreSQL de forma isolada, consistente e portátil.

### `docker-compose.yml`

```yaml
services:
  banco-agenda:
    image: postgres:16-alpine
    container_name: postgres_agenda_senai
    restart: always
    environment:
      POSTGRES_DB: agenda_senai
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin_password123
    ports:
      - "5433:5432"
    volumes:
      - dados_banco:/var/lib/postgresql/data

volumes:
  dados_banco:
```

### Decisões Técnicas

| Decisão | Motivo |
|---|---|
| **PostgreSQL 16 Alpine** | Imagem mínima (~5 MB), inicialização rápida, baixo consumo de memória. Ideal para desenvolvimento local e ambientes com recursos limitados. |
| **Porta `5433:5432`** | Mapeia a porta externa `5433` para a interna `5432` do container. Evita conflito com instâncias locais do PostgreSQL que já ocupem a porta padrão `5432`. |
| **Volume `dados_banco`** | Persiste os dados no disco do host (`/var/lib/docker/volumes/`). Se o container for removido ou recriado, os dados (tabelas, registros) são preservados. |
| **`restart: always`** | O banco reinicia automaticamente após reboot do sistema ou falha do daemon Docker. |

### Comandos

```bash
# Subir o banco em background
docker compose up -d

# Parar o banco (mantém os dados no volume)
docker compose down

# Parar e destruir o volume (começar do zero)
docker compose down -v
```

### Conexão com a Aplicação

As credenciais no `application.properties` espelham as definidas no `docker-compose.yml`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/agenda_senai
spring.datasource.username=admin
spring.datasource.password=admin_password123
spring.jpa.hibernate.ddl-auto=update
```

Com `ddl-auto=update`, o Hibernate **cria e atualiza as tabelas automaticamente** com base nas entidades JPA. Nenhum script SQL manual é necessário.

---

## 🧪 Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | Java | 21 |
| Framework | Spring Boot | 4.1.0 |
| Persistência | Spring Data JPA / Hibernate | — |
| Banco de Dados | PostgreSQL (Docker) | 16 Alpine |
| Segurança | Spring Security + JWT (auth0) | 4.4.0 |
| Criptografia | BCrypt | — |
| Validação | Bean Validation (Jakarta) | — |
| Build | Maven Wrapper (`mvnw`) | — |
| Containerização | Docker + Docker Compose | — |

---

## 🚀 Como Executar

### Pré-requisitos

- **Java 21** ou superior
- **Docker** e **Docker Compose**
- Porta `5433` disponível (ou ajuste no `docker-compose.yml` e `application.properties`)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/JoaopedroHZN/agenda-instrutores.git
cd agenda-instrutores

# 2. Suba o banco de dados
docker compose up -d

# 3. Execute a aplicação
./mvnw spring-boot:run

# A API estará disponível em http://localhost:8080
```

### Primeiro Acesso

1. Um **ADMIN** deve ser cadastrado diretamente no banco ou via endpoint (se já houver um token de admin).
2. **INSTRUTORES** são cadastrados por um ADMIN via `POST /instrutores` (sem senha definida).
3. O instrutor acessa `POST /instrutores/primeiro-acesso` com seu e-mail e define sua senha.
4. A partir daí, autentica-se via `POST /login` e recebe o token JWT.

---

## 📁 Estrutura de Pacotes

```
br.com.senai.agenda_instrutores
├── config/
│   ├── CorsConfig.java          # Configuração de CORS
│   ├── SecurityConfig.java      # Configuração do Spring Security
│   ├── SecurityFilter.java      # Filtro de extração e validação do JWT
│   └── TokenService.java        # Geração e validação de tokens JWT
├── controller/
│   ├── AgendamentoController.java  # CRUD e consultas de agendamentos
│   ├── AutenticacaoController.java # Endpoint de login
│   └── InstrutorController.java    # CRUD de instrutores + primeiro acesso
├── dto/
│   └── DadosPrimeiroAcesso.java    # DTO para definição de primeira senha
├── exception/
│   ├── ErroResposta.java           # Modelo padronizado de resposta de erro
│   └── GlobalExceptionHandler.java # Handler global de exceções
├── model/
│   ├── Agendamento.java            # Entidade de agendamento
│   ├── DadosLogin.java             # DTO de credenciais de login
│   ├── DadosTokenJWT.java          # DTO de resposta do token
│   ├── Instrutor.java              # Entidade de instrutor (UserDetails)
│   ├── Perfil.java                 # Enum ADMIN | INSTRUTOR
│   └── Turno.java                  # Enum MATUTINO | VESPERTINO | NOTURNO
├── repository/
│   ├── AgendamentoRepository.java  # Consultas de agendamento + conflitos
│   └── InstrutorRepository.java    # Consulta de instrutor por email
├── service/
│   └── AutenticacaoService.java    # Implementação de UserDetailsService
└── AgendaInstrutoresApplication.java