# Relatório de Testes de Software — Agenda Quick

**Data de execução:** 2026-05-27  
**Ambiente:** Docker via WSL Ubuntu — Backend `http://localhost:8000`, Frontend `http://localhost:5173`  
**Ferramenta:** Suite de testes automatizada (curl + bash) + análise estática de código  
**Total de asserções executadas:** 44  
**Resultado:** ✅ 11 passaram | ❌ 33 falharam

---

## Sumário Executivo

| Severidade | Backend | Frontend | Total |
|------------|---------|----------|-------|
| 🔴 Crítico  | 4       | 3        | **7** |
| 🟡 Médio    | 3       | 3        | **6** |
| 🟢 Baixo    | 1       | 4        | **5** |
| **Total**  | **8**   | **10**   | **18** |

A falha raiz de **todos os testes autenticados** é a ausência do campo `senha_hash` no SQL de seed, tornando o login impossível e cascateando falhas em 29 das 33 asserções.

---

## O que passou

| # | Teste | Resultado |
|---|-------|-----------|
| 1 | `GET /` retorna `status=ok` | ✅ Pass |
| 2 | `GET /` retorna `version=2.0.0` | ✅ Pass |
| 3 | Login com senha errada retorna 401 | ✅ Pass |
| 4 | Login com email inexistente retorna 401 | ✅ Pass |
| 5 | `GET /api/v2/salas` sem token retorna 401 | ✅ Pass |
| 6 | `GET /api/v2/pacientes` sem token retorna 401 | ✅ Pass |
| 7 | `GET /api/v2/insumos` sem token retorna 401 | ✅ Pass |
| 8 | `GET /api/v2/usuarios` sem token retorna 401 | ✅ Pass |
| 9 | `GET /api/v2/nao-existe` retorna 404 | ✅ Pass |
| 10 | `GET /docs` retorna 200 (Swagger acessível) | ✅ Pass |
| 11 | `GET /openapi.json` retorna 200 | ✅ Pass |

---

## Falhas Encontradas

---

### 🔴 CRÍTICO — BK-01: Seed SQL não inclui `senha_hash` nos usuários

**Arquivo:** `Banco de Dados/agenda_quick_db.sql`  
**Linha afetada:** INSERT INTO usuario  
**Impacto:** Login impossível para qualquer usuário. Cascateia falha em ~29 testes.

**Diagnóstico:**
O INSERT semeia usuários sem o campo `senha_hash`. O campo é nullable no modelo ORM, mas a lógica de autenticação em `Backend/presentation/auth.py:20` falha ao tentar verificar `None`:

```python
if not user.senha_hash or not verify_password(request.password, user.senha_hash):
    raise HTTPException(status_code=401, detail="Email ou senha incorretos")
```

Com `user.senha_hash = NULL`, a condição `not user.senha_hash` é `True` e o login sempre retorna 401.

**SQL atual (incorreto):**
```sql
INSERT INTO usuario (filial_id, nome, email, crm, tipo) VALUES
    (1, 'Dr. Ricardo Alves', 'ricardo@hospital.com', 'CRM-GO-12345', 'medico'),
    ...
```

**Correção:**  
Adicionar o campo `senha_hash` com valores bcrypt válidos no INSERT. Para gerar o hash use:
```python
from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd.hash("admin123"))     # → $2b$12$...
print(pwd.hash("medico123"))    # → $2b$12$...
```

**SQL corrigido:**
```sql
INSERT INTO usuario (filial_id, nome, email, senha_hash, crm, tipo) VALUES
    (1, 'Admin Sistema',      'admin@agendaquick.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlOqOHHsC0VV7z.', NULL, 'administrador'),
    (1, 'Dr. Carlos Mendes',  'carlos.mendes@agendaquick.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlOqOHHsC0VV7z.', 'CRM-GO-12345', 'medico'),
    (1, 'Enf. Juliana Costa', 'juliana.costa@agendaquick.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlOqOHHsC0VV7z.', NULL, 'enfermeiro');
```

> ⚠️ Os hashes acima são exemplos. Gerar valores reais antes de aplicar.

---

### 🔴 CRÍTICO — BK-02: Emails do seed divergem da documentação

**Arquivo:** `Banco de Dados/agenda_quick_db.sql`  
**Impacto:** Credenciais documentadas (`admin@agendaquick.com`, `carlos.mendes@agendaquick.com`, `juliana.costa@agendaquick.com`) não existem no banco.

**Situação atual:**
| Seed SQL | Documentação esperada |
|----------|-----------------------|
| `joao@hospital.com` (administrador) | `admin@agendaquick.com` |
| `ricardo@hospital.com` (médico) | `carlos.mendes@agendaquick.com` |
| `carla@hospital.com` (enfermeiro) | `juliana.costa@agendaquick.com` |

**Correção:** Atualizar o seed para usar os emails documentados (ver BK-01) ou atualizar a documentação para refletir os emails reais do seed.

---

### 🔴 CRÍTICO — BK-03: `test_api.py` importa de arquivo depreciado

**Arquivo:** `Backend/tests/test_api.py:4`  
**Impacto:** Todos os testes do arquivo falham com `ImportError`.

**Código atual (incorreto):**
```python
from presentation.routes import get_repository
```

**Problema:** `Backend/presentation/routes.py` está **depreciado** — contém apenas comentários dizendo que foi migrado. O `get_repository` agora está em `presentation/routes/appointments.py`.

**Correção:**
```python
from presentation.routes.appointments import get_repository
```

---

### 🔴 CRÍTICO — BK-04: `test_api.py` usa prefixo de rota desatualizado

**Arquivo:** `Backend/tests/test_api.py:21,31`  
**Impacto:** Testes `test_get_appointments_api` e `test_create_appointment_api` retornam 404.

**Código atual (incorreto):**
```python
response = client.get("/api/appointments")       # linha 22
response = client.post("/api/appointments", ...)  # linha 37
```

**Problema:** Todas as rotas foram migradas de `/api/...` para `/api/v2/...` em `Backend/main.py:35` (`API_PREFIX = "/api/v2"`). As antigas rotas `/api/appointments` não existem.

**Correção:**
```python
response = client.get("/api/v2/appointments")
response = client.post("/api/v2/appointments", ...)
```

---

### 🟡 MÉDIO — BK-05: Endpoint `GET /api/v2/insumos/categorias` ausente (retorna 405)

**Arquivo:** `Backend/presentation/routes/insumos.py`  
**Retorno observado:** HTTP 405 Method Not Allowed  
**Impacto:** Nenhuma rota expõe a listagem de `categoria_insumo` para o frontend usar nos selects do modal de insumos.

**Correção:** Adicionar rota GET para categorias:

```python
# Em Backend/presentation/routes/insumos.py
from infrastructure.models import CategoriaInsumo

@router.get("/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    categorias = db.query(CategoriaInsumo).all()
    return [{"id": c.id, "nome": c.nome} for c in categorias]
```

---

### 🟡 MÉDIO — BK-06: `SalaService.criar()` não retorna `id` da sala criada

**Arquivo:** `Backend/application/services/sala_service.py:44`  
**Impacto:** Frontend não recebe o `id` da sala recém-criada, impossibilitando edição/exclusão imediata sem recarregar a lista.

**Código atual:**
```python
def criar(self, dados: SalaCreate) -> dict:
    ...
    self._db.commit()
    return {"status": "success", "message": "Sala criada com sucesso"}
```

**Correção:**
```python
def criar(self, dados: SalaCreate) -> dict:
    ...
    self._db.add(sala)
    self._db.commit()
    self._db.refresh(sala)
    return SalaSchema.model_validate(sala).model_dump()
```

> Mesma correção deve ser aplicada a `PacienteService.criar()` e `InsumoService.criar()`.

---

### 🟡 MÉDIO — BK-07: Filtro por nome ausente em `GET /api/v2/salas`

**Arquivo:** `Backend/presentation/routes/salas.py:26-32` e `Backend/application/services/sala_service.py:19`  
**Impacto:** UI de salas tem campo de busca, mas a API ignora o parâmetro `nome`.

**Código atual (rota):**
```python
@router.get("", response_model=PaginatedResponse)
def listar_salas(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    service: SalaService = Depends(get_service),
):
    return service.listar(page, page_size)
```

**Correção:**
```python
from typing import Optional

@router.get("", response_model=PaginatedResponse)
def listar_salas(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nome: Optional[str] = Query(None),
    service: SalaService = Depends(get_service),
):
    return service.listar(page, page_size, nome)
```

```python
# Em SalaService.listar():
def listar(self, page: int, page_size: int, nome: Optional[str] = None) -> PaginatedResponse:
    query = self._db.query(Sala)
    if nome:
        query = query.filter(Sala.nome.ilike(f"%{nome}%"))
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    ...
```

---

### 🟢 BAIXO — BK-08: `GET /api/appointments/*` retorna 404 em vez de 401

**Arquivo:** `Backend/main.py`  
**Impacto:** Baixo — falha de UX, rota inexistente deveria retornar mensagem mais informativa.

**Diagnóstico:** A rota `/api/appointments` não existe (migrada para `/api/v2/appointments`). O FastAPI retorna 404, mas se a rota existisse sem auth, retornaria 401. Não é necessário criar a rota antiga, mas o arquivo depreciado `routes.py` deveria ser removido para evitar confusão.

**Correção:** Remover `Backend/presentation/routes.py` (arquivo já marcado como depreciado).

---

### 🔴 CRÍTICO — FE-01: `SalasPage`, `PacientesPage` e `InsumosPage` tratam resposta paginada como array

**Arquivos:**
- `Frontend/agenda-quick-app/src/pages/SalasPage.jsx:18`
- `Frontend/agenda-quick-app/src/pages/PacientesPage.jsx:18`
- `Frontend/agenda-quick-app/src/pages/InsumosPage.jsx:17`

**Impacto:** Erro em runtime — `salas.map is not a function` / `pacientes.map is not a function`. As páginas não renderizam nenhum dado e podem lançar exceção não tratada.

**Diagnóstico:** A API retorna um objeto paginado `{ items: [...], total: N, page: N, page_size: N, total_pages: N }`, mas o código faz `setSalas(data)` e depois chama `salas.map(...)` e `salas.length`, operações que só funcionam em arrays.

**Código atual (incorreto — SalasPage.jsx):**
```js
.then(data => setSalas(data))
```

**Correção:**
```js
// SalasPage.jsx
.then(data => setSalas(data.items ?? []))

// PacientesPage.jsx
.then(data => setPacientes(data.items ?? []))

// InsumosPage.jsx
.then(data => setInsumos(data.items ?? []))
```

O badge de contagem também deve usar o `total` da resposta paginada:

```jsx
// Antes — SalasPage.jsx linha 139
<span className="saas-badge">{salas.length}</span>

// Depois
const [totalSalas, setTotalSalas] = useState(0);
// No fetch:
.then(data => { setSalas(data.items ?? []); setTotalSalas(data.total ?? 0); })
// No JSX:
<span className="saas-badge">{totalSalas}</span>
```

---

### 🔴 CRÍTICO — FE-02: Stale closure em `fetchAppointments` — token pode ser `undefined`

**Arquivo:** `Frontend/agenda-quick-app/src/App.jsx:56-72`  
**Impacto:** Após login sem dados em localStorage, o primeiro fetch de agendamentos é enviado com `Authorization: Bearer undefined`, retornando 401 silenciosamente.

**Diagnóstico:** `useCallback` memoiza `fetchAppointments` usando apenas `[showToast]` nas dependências. A referência a `user?.token` fecha sobre o valor de `user` no momento em que a função foi criada (primeiro render, quando `user = null`). Quando o usuário faz login e `user` muda, `fetchAppointments` **não é recriada** (porque `showToast` não mudou), então continua usando o token nulo.

**Código atual (incorreto):**
```jsx
const fetchAppointments = useCallback(async () => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${user?.token}` }  // user stale!
  });
  ...
}, [showToast]); // user não está nas deps
```

**Correção — opção 1 (adicionar `user` às deps):**
```jsx
const fetchAppointments = useCallback(async () => {
  if (!user?.token) return;
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${user.token}` }
  });
  ...
}, [showToast, user]); // user adicionado
```

**Correção — opção 2 (passar token como parâmetro):**
```jsx
const fetchAppointments = useCallback(async (token) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  ...
}, [showToast]);

// No useEffect:
useEffect(() => {
  if (user) fetchAppointments(user.token);
}, [user, fetchAppointments]);
```

---

### 🔴 CRÍTICO — FE-03: Login SSO bypassa autenticação — usuário fica sem token

**Arquivo:** `Frontend/agenda-quick-app/src/components/Login.jsx:61-67`  
**Impacto:** Usuário que clica em "Entrar com SSO Corporativo" fica autenticado no frontend sem token JWT. Todas as chamadas de API retornam 401 silenciosamente.

**Código atual:**
```jsx
function handleSSO() {
  onLogin({
    name: 'Dra. Ana Silva',
    role: 'Cirurgiã Chefe',
    email: 'ana.silva@hospital.com',
    // token: undefined ← ausente!
  });
}
```

**Correção — marcar como não implementado:**
```jsx
function handleSSO() {
  alert('SSO corporativo não está disponível neste ambiente. Use email e senha.');
}
```

Ou, se SSO for mantido como simulação de demonstração, deixar claro no UI e desabilitar as chamadas de API para o usuário SSO.

---

### 🟡 MÉDIO — FE-04: Toast duplicado ao criar agendamento

**Arquivos:**
- `Frontend/agenda-quick-app/src/components/AppointmentModal.jsx:66`
- `Frontend/agenda-quick-app/src/App.jsx:111`

**Impacto:** O usuário vê dois toasts de sucesso ao criar um agendamento — um gerado pelo modal e outro pelo handler do App.

**Código atual:**
```jsx
// AppointmentModal.jsx:66 — dispara toast ANTES de saber se a API teve sucesso
onToast('✅ Cirurgia agendada com sucesso! Insumos reservados automaticamente.', 'success');

// App.jsx:111 — dispara toast APÓS confirmação da API
showToast('✅ Cirurgia agendada com sucesso! Insumos reservados automaticamente.', 'success');
```

**Correção:** Remover o `onToast` dentro do `handleSave` em `AppointmentModal.jsx` (linha 66), mantendo apenas o toast do `App.jsx` que é disparado após confirmação da API.

---

### 🟡 MÉDIO — FE-05: Campo de busca em `SalasPage` sem estado nem handler

**Arquivo:** `Frontend/agenda-quick-app/src/pages/SalasPage.jsx:142`  
**Impacto:** Input de busca existe na UI mas é decorativo — não filtra dados.

**Código atual:**
```jsx
<input type="text" className="saas-search" placeholder="Filtre salas..." />
```

**Correção:**
```jsx
const [searchNome, setSearchNome] = useState('');

// No input:
<input
  type="text"
  className="saas-search"
  placeholder="Filtre salas..."
  value={searchNome}
  onChange={e => { setSearchNome(e.target.value); fetchSalas(e.target.value); }}
/>

// Na função fetchSalas:
const fetchSalas = (nome = '') => {
  const params = new URLSearchParams({ page: 1, page_size: 50 });
  if (nome) params.append('nome', nome);
  fetch(`http://localhost:8000/api/v2/salas?${params}`, ...)
  ...
};
```

> Requer também a correção BK-07 no backend.

---

### 🟡 MÉDIO — FE-06: URLs da API hardcoded como `localhost:8000`

**Arquivos:** `App.jsx:22`, `SalasPage.jsx:13`, `PacientesPage.jsx:13`, `InsumosPage.jsx:13`, `Login.jsx:29` e outros.  
**Impacto:** Em qualquer ambiente que não seja localhost (produção, staging, containers com nome de serviço), a aplicação não funciona.

**Correção:** Usar a variável de ambiente do Vite já configurada no `.env.example`:

```jsx
// Antes (em cada arquivo):
fetch('http://localhost:8000/api/v2/salas', ...)

// Depois (definir uma constante central):
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
fetch(`${API_BASE}/api/v2/salas`, ...)
```

Centralizar em um arquivo `src/api/client.js`:
```js
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function authHeaders(token) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}
```

---

### 🟢 BAIXO — FE-07: Strings em inglês no modal de `SalasPage`

**Arquivo:** `Frontend/agenda-quick-app/src/pages/SalasPage.jsx:205,225`  
**Impacto:** Inconsistência de idioma — aplicação é em português mas modal usa inglês.

| Atual | Correto |
|-------|---------|
| `'New Sala'` | `'Nova Sala'` |
| `'Submit'` | `'Salvar'` |
| `'Edit'` | `'Editar'` |
| `'Delete'` | `'Remover'` |
| `'items selected'` | `'itens selecionados'` |

---

### 🟢 BAIXO — FE-08: `toggleSelectAll` usa `salas.length` (falha após FE-01)

**Arquivo:** `Frontend/agenda-quick-app/src/pages/SalasPage.jsx:31`  
**Impacto:** Corolário direto de FE-01 — após corrigir a resposta paginada, a comparação `selectedIds.size === salas.length` continua correta pois `salas` será o array.

Após aplicar a correção de FE-01, este comportamento se corrige automaticamente.

---

### 🟢 BAIXO — FE-09: AppointmentModal usa listas estáticas para salas e médicos

**Arquivo:** `Frontend/agenda-quick-app/src/components/AppointmentModal.jsx:2`  
**Impacto:** Salas e médicos do dropdown são valores hardcoded em `src/data/appointments.js`, não refletem os dados reais do banco.

**Correção:** Carregar listas dinamicamente via API no momento em que o modal abre:

```jsx
// No AppointmentModal:
const [salas, setSalas] = useState([]);
const [medicos, setMedicos] = useState([]);

useEffect(() => {
  if (isOpen) {
    fetch(`${API_BASE}/api/v2/salas/all`, { headers: authHeaders(token) })
      .then(r => r.json()).then(setSalas);
    fetch(`${API_BASE}/api/v2/usuarios/medicos`, { headers: authHeaders(token) })
      .then(r => r.json()).then(setMedicos);
  }
}, [isOpen]);
```

---

### 🟢 BAIXO — FE-10: Token não removido ao expirar — usuário preso na tela

**Arquivo:** `Frontend/agenda-quick-app/src/App.jsx:56-72`  
**Impacto:** Se o token expirar enquanto o usuário está usando a aplicação, as chamadas à API retornam 401 silenciosamente (apenas um toast de erro) sem redirecionar para o login.

**Correção:** Detectar 401 no `fetchAppointments` e fazer logout automático:
```jsx
const fetchAppointments = useCallback(async () => {
  const response = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${user?.token}` } });
  if (response.status === 401) {
    handleLogout();
    return;
  }
  ...
}, [showToast, user]);
```

---

## Resumo das Correções por Prioridade

### Prioridade 1 — Executar imediatamente (sistema não funciona sem estas)

1. **BK-01 + BK-02**: Corrigir seed SQL com `senha_hash` e emails corretos
2. **FE-01**: Corrigir `setSalas(data)` → `setSalas(data.items ?? [])` nas 3 páginas
3. **BK-03 + BK-04**: Corrigir imports e URLs em `test_api.py`

### Prioridade 2 — Corrigir antes de demonstração

4. **FE-02**: Adicionar `user` nas deps do `useCallback` de `fetchAppointments`
5. **FE-03**: Desabilitar ou alertar SSO sem token
6. **FE-04**: Remover toast duplicado do `AppointmentModal`
7. **BK-05**: Implementar `GET /api/v2/insumos/categorias`
8. **BK-06**: Retornar objeto completo com `id` nos métodos `criar()`

### Prioridade 3 — Melhorias de qualidade

9. **BK-07 + FE-05**: Implementar filtro por nome em salas (backend + frontend)
10. **FE-06**: Centralizar URL da API usando `VITE_API_URL`
11. **FE-07**: Traduzir strings do modal de Salas para português
12. **FE-09**: Carregar salas e médicos dinamicamente no modal de agendamento
13. **FE-10**: Logout automático ao detectar 401

---

## Checklist de Verificação Pós-Correção

Após aplicar as correções, executar os seguintes testes manuais:

- [ ] Login com `admin@agendaquick.com` / `admin123` retorna token
- [ ] Login com `carlos.mendes@agendaquick.com` / `medico123` retorna token
- [ ] Login com senha errada retorna mensagem de erro adequada
- [ ] Página de Salas carrega lista corretamente (não vazia, não objeto)
- [ ] Criar nova sala abre modal e reflete na lista após salvar
- [ ] Editar sala existente persiste mudanças
- [ ] Remover sala mostra confirmação e remove da lista
- [ ] Página de Pacientes carrega e permite CRUD
- [ ] Página de Insumos carrega com categorias no select do modal
- [ ] Criar agendamento no calendário aparece somente 1 toast de sucesso
- [ ] Atualizar status de agendamento funciona via painel lateral
- [ ] Relatório carrega com totais corretos
- [ ] `pytest Backend/tests/` — todos os testes passam
- [ ] SSO exibe mensagem de não implementado
- [ ] Mudança de ambiente (não-localhost) funciona via `VITE_API_URL`
