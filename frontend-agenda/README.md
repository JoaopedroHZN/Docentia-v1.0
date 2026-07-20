# 📋 SENAI — Agenda dos Instrutores (Front-end)

Aplicação client-side para o ecossistema de gestão de docentes e agendamentos de aulas do **SENAI / Sistema FIETO**, desenvolvida com **React 19** e **Vite 8**, consumindo API REST via **Axios** e protegida por autenticação **JWT (JSON Web Token)**.

---

## 🔧 Stack Tecnológica

| Camada               | Tecnologia                           |
| -------------------- | ------------------------------------ |
| Interface            | React 19.2 (function components + hooks) |
| Build Tool           | Vite 8.1 (ESM nativo, HMR)          |
| HTTP Client          | Axios 1.18 (instância centralizada) |
| Autenticação         | JWT decodificado no client-side     |
| Estilização          | CSS puro (design system institucional SENAI) |
| Roteamento           | Renderização condicional (sem react‑router) |

---

## 📁 Estrutura de Componentes

```
src/
├── main.jsx                  # Ponto de entrada — monta <App /> no DOM
├── App.jsx                   # Raiz: autenticação, decodificação JWT e roteamento por perfil
├── PainelCoped.jsx           # Painel administrativo (COPED): CRUD de docentes + navegação por abas
├── AgendamentoCoped.jsx      # CRUD de agendamentos de turma (dentro do PainelCoped)
├── PainelInstrutor.jsx       # Portal do docente: visualização da grade pessoal de aulas
├── Footer.jsx                # Rodapé institucional reutilizável
├── services/
│   └── api.js                # Instância centralizada do Axios (baseURL única)
├── App.css                   # Estilos da tela de login
├── PainelCoped.css           # Design system unificado para os painéis internos
└── index.css                 # Reset / estilos globais
```

### 🔗 Hierarquia de Componentes (árvore de renderização)

```
<App>                                  ← estado: token, email, senha, mensagens
 ├─ [não autenticado] → tela de Login / Primeiro Acesso
 ├─ [token && perfil === 'ADMIN'] → <PainelCoped token={…} onLogout={…} />
 │    ├─ <AgendamentoCoped token={…} />   ← renderizado condicionalmente via abas
 │    └─ <Footer />
 └─ [token && perfil !== 'ADMIN'] → <PainelInstrutor token={…} onLogout={…} />
       └─ <Footer />
```

### 📦 Fluxo de Props e Estado

1. **App.jsx** detém o estado global de autenticação (`tokenLogado`). Em caso de login bem‑sucedido, o token é persistido em `localStorage` e injetado como prop nos painéis filhos.
2. **PainelCoped** e **PainelInstrutor** recebem `token` (string JWT) e `onLogout` (callback) — a prop `token` é usada exclusivamente para montar o header `Authorization: Bearer <token>`.
3. **AgendamentoCoped** recebe apenas `token`, pois opera como sub‑rota interna ao painel administrativo. Toda comunicação com a API usa a instância `api` importada diretamente do módulo `services/api.js`.
4. Estados locais gerenciam formulários, listas, paginação e feedback (erro/sucesso) — sem necessidade de gerenciador de estado global (Redux, Context API), já que os componentes são autocontidos e o token é a única dependência transversal.

---

## 🌐 Comunicação com a API

### Estratégia de Centralização (`services/api.js`)

```js
// src/services/api.js
import axios from 'axios';

const IP_SERVIDOR = 'localhost';          // Único ponto de configuração de rede

const api = axios.create({
  baseURL: `http://${IP_SERVIDOR}:8080`   // Spring Boot (back-end)
});

export default api;
```

- Toda a aplicação importa o objeto `api` desse módulo — **zero chamada direta ao Axios nos componentes**. Isso garante que qualquer mudança de domínio, porta, prefixo ou timeout seja feita em um único arquivo.
- O back‑end (Spring Boot) é acessado via `http://localhost:8080`, com endpoints RESTful versionados de forma implícita:
  - `POST /login`
  - `POST /instrutores/primeiro-acesso`
  - `GET/POST /instrutores` (com paginação `?page=&size=`)
  - `DELETE /instrutores/{id}`
  - `GET/POST/PUT/DELETE /agendamentos`
  - `GET /agendamentos/buscar-professor?id=`

### Consumo nos Componentes

Cada componente monta localmente o objeto `authHeaders`:

```js
const authHeaders = {
  headers: { Authorization: `Bearer ${token}` }
};
```

E o injeta em cada requisição:

```js
await api.get('/instrutores?page=0&size=5', authHeaders);
await api.post('/agendamentos', dados, authHeaders);
await api.put(`/agendamentos/${id}`, dados, authHeaders);
await api.delete(`/instrutores/${id}`, authHeaders);
```

Esse padrão é repetido de forma consistente em `PainelCoped`, `PainelInstrutor` e `AgendamentoCoped`, garantindo **previsibilidade e facilidade de debugging**.

---

## 🔐 Segurança no Client-side

### Armazenamento do Token JWT

O token JWT é armazenado no **`localStorage`** (`jwt_token`):

```js
// App.jsx — após login bem-sucedido
localStorage.setItem('jwt_token', token);
setTokenLogado(token);
```

E recuperado na inicialização do componente `App`:

```js
const [tokenLogado, setTokenLogado] = useState(
  localStorage.getItem('jwt_token') || ''
);
```

No logout, o token é removido integralmente:

```js
localStorage.removeItem('jwt_token');
setTokenLogado('');
```

> **Nota de segurança**: embora `localStorage` seja suscetível a XSS, a aplicação não renderiza conteúdo dinâmico proveniente de terceiros, o que reduz significativamente o vetor de ataque. Para ambientes de produção com requisitos mais rigorosos, recomenda‑se migrar para **HttpOnly cookies** gerenciados pelo back‑end.

### Proteção de Rotas por Perfil

Não há roteador declarativo (react‑router). A proteção é feita via **renderização condicional** no `App.jsx`:

```js
if (tokenLogado) {
  const perfil = obterPerfilDoToken(tokenLogado);  // decodifica o payload do JWT

  if (perfil === 'ADMIN') {
    return <PainelCoped token={tokenLogado} onLogout={handleLogout} />;
  }

  return <PainelInstrutor token={tokenLogado} onLogout={handleLogout} />;
}

// Sem token → tela de login
return ( /* … formulário de login … */ );
```

A função `obterPerfilDoToken()` implementa um **fallback resiliente**: tenta extrair o perfil de múltiplas claims comuns do ecossistema Spring Security (`perfil`, `role`, `roles`, `authorities`, `sub`), garantindo compatibilidade com diferentes formatos de payload sem depender de um contrato rígido.

### Benefício Arquitetural

- O front‑end **nunca armazena o perfil em estado ou localStorage** — ele é sempre derivado do token no momento da decisão de rota, eliminando inconsistências entre token expirado/atualizado e estado local.
- Sem bibliotecas externas de roteamento → bundle menor e zero complexidade adicional.

---

## 🎨 Estilização e Experiência de Usuário

### Consistência Visual

- Todos os estilos seguem a paleta institucional do **SENAI**:
  - Azul primário: `#003e7e` / `#1a428a`
  - Laranja de ação: `#f25922`
  - Tons neutros: `#f8fafc`, `#e2e8f0`, `#64748b`
- Design system definido em **CSS puro** com classes semânticas (`.btn-aba`, `.badge-admin`, `.alerta-sucesso`, `.paginacao-container`), sem dependência de frameworks como Tailwind ou Bootstrap.
- A mesma folha de estilo (`PainelCoped.css`) é compartilhada entre `PainelCoped`, `AgendamentoCoped` e `PainelInstrutor`, assegurando **identidade visual uniforme** em todo o sistema.

### Experiência de Usuário (UX)

| Funcionalidade                  | Detalhe de Implementação                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Formulários dinâmicos**       | O mesmo formulário alterna entre criação e edição (`AgendamentoCoped`) com mudança de label, cor do botão e opção de cancelar. |
| **Feedback visual imediato**    | Alertas de sucesso (verde) e erro (vermelho) com ícones e borda lateral colorida, exibidos logo acima do conteúdo. |
| **Primeiro acesso guiado**      | Tela de login com toggle para cadastro de senha inicial — o instrutor pré‑cadastrado define sua credencial sem intervenção do admin. |
| **Paginação amigável**          | Controles "Anterior/Próxima" com estado desabilitado, contagem total de registros e carregamento inteligente na exclusão do último item da página. |
| **Confirmação de ações críticas**| `window.confirm()` antes de exclusão de docentes e agendamentos, prevenindo remoções acidentais. |
| **Scroll automático na edição** | `window.scrollTo({ top: 0, behavior: 'smooth' })` ao iniciar edição — o usuário é levado suavemente ao formulário. |
| **Rodapé institucional**        | Presente em todos os painéis (`<Footer />`), com créditos e copyright, delimitado por borda superior sutil. |
| **Data formatada em pt‑BR**     | `PainelInstrutor` exibe a data atual por extenso ("Domingo, 12 de Julho de 2026"), reforçando a localização. |

---

## 🧩 Desafios Técnicos e Soluções

### 1. Unificação de Criação e Edição (POST vs PUT)

**Problema**: O formulário de agendamento em `AgendamentoCoped` precisava operar nos dois modos (criar novo e editar existente) sem duplicar JSX, lógica de validação ou handlers.

**Solução**:

- Um estado `agendamentoEditando` (objeto ou `null`) controla o modo do formulário.
- O handler `handleSalvar` é unificado:

```js
if (agendamentoEditando) {
  await api.put(`/agendamentos/${agendamentoEditando.id}`, dados, authHeaders);  // UPDATE
} else {
  await api.post('/agendamentos', dados, authHeaders);                            // CREATE
}
```

- A limpeza do estado (`limparFormulario`) restaura o formulário ao modo "novo".
- O botão de submit alterna entre "Confirmar Agendamento" e "Salvar Alterações", e um botão "Cancelar Edição" aparece condicionalmente.

Essa abordagem elimina a necessidade de dois formulários separados e mantém a lógica de submissão em um único ponto de manutenção — um exemplo claro do princípio **DRY (Don't Repeat Yourself)** aplicado a componentes React.

### 2. Manipulação de Estados Complexos

**Problema**: O `PainelCoped` gerencia simultaneamente: lista paginada de docentes (`instrutores`), formulário de cadastro com 3 campos, estado da aba ativa (`abaAtiva`), feedback (`erro`/`sucesso`), e metadados de paginação (`paginaAtual`, `totalPaginas`, `totalElementos`).

**Solução**:

- **Múltiplos `useState` atômicos** em vez de um único estado composto — cada responsabilidade tem seu próprio setter, facilitando a leitura e evitando re-renders desnecessários.
- **Paginação inteligente na exclusão**: ao remover o último item de uma página, o sistema automaticamente recua para `paginaAtual - 1`, evitando páginas vazias.
- **Limpeza de feedback ao trocar de aba**: os estados `erro` e `sucesso` são resetados nos handlers `onClick` das abas, garantindo que mensagens da aba anterior não poluam a visualização da nova aba.

### 3. Decodificação Robusta de JWT

**Problema**: O payload do token JWT gerado pelo Spring Boot pode conter o perfil do usuário em diferentes claims dependendo da configuração do back‑end (`perfil`, `role`, `roles`, `authorities`).

**Solução**: A função `obterPerfilDoToken()` implementa uma **cadeia de fallback progressiva**, testando cada claim comum e retornando `'INSTRUTOR'` como padrão seguro. Essa estratégia desacopla o front‑end de um contrato rígido com o back‑end e evita falhas se a estrutura do token evoluir.

### 4. Fallback de Identificação do Instrutor

**Problema**: Em `PainelInstrutor`, o token JWT pode conter o ID do docente (`payload.id`) ou apenas o e‑mail (`payload.sub`).

**Solução**: Dupla estratégia de busca — primeiro tenta a rota otimizada (`/agendamentos/buscar-professor?id=`); se falhar, busca a lista completa e filtra pelo e‑mail no client‑side. Isso garante funcionamento mesmo com diferentes versões do back‑end.

---

## 📈 Por que esta Arquitetura é Escalável

1. **Desacoplamento da camada HTTP**: a instância `api.js` centraliza configurações de rede, headers, interceptors e baseURL. Mudar de `localhost:8080` para um domínio de produção requer alterar **uma única linha**.
2. **Componentes autocontidos e reutilizáveis**: cada componente gerencia seu próprio estado local, recebendo apenas o `token` como dependência externa. Adicionar um novo painel (ex: `PainelCoordenador`) segue o mesmo padrão de props, sem impacto nos existentes.
3. **Renderização condicional como roteamento**: escalável para múltiplos perfis sem adicionar bibliotecas de terceiros — basta adicionar uma nova condição no `App.jsx`. Se a complexidade crescer, a migração para React Router é trivial graças à baixa acoplação.
4. **Design system em CSS puro reutilizável**: classes como `.btn-aba`, `.badge`, `.tabela-instrutores` são compartilhadas entre componentes. Novos painéis herdam a identidade visual automaticamente ao importar `PainelCoped.css`.
5. **Separação clara de responsabilidades**: `App` trata autenticação; `PainelCoped` trata CRUD de docentes; `AgendamentoCoped` trata CRUD de agendamentos; `PainelInstrutor` trata visualização. Cada arquivo tem um propósito único e bem definido (Single Responsibility Principle).
6. **Resiliência a mudanças no back‑end**: os fallbacks na decodificação de JWT e na identificação de instrutor permitem que o front‑end funcione mesmo com variações na resposta da API, reduzindo falhas em integração contínua.

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (HMR)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

O front‑end espera que o back‑end Spring Boot esteja rodando em `http://localhost:8080`. Para alterar o endereço do servidor, edite a constante `IP_SERVIDOR` em `src/services/api.js`.

---

## 👤 Autor

Desenvolvido por **João Pedro Menezes** — © 2026 Sistema de Agenda dos Instrutores SENAI.