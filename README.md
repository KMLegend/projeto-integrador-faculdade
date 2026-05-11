<p align="center">
  <h1 align="center">🏥 Agenda Quick</h1>
  <p align="center">
    <strong>Sistema de Agendamento Cirúrgico Hospitalar</strong><br/>
    Projeto Integrador — FPM (Faculdade de Princípios Militares)
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=python&logoColor=white" alt="SQLAlchemy"/>
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Cumprimento do Roteiro Total](#-cumprimento-do-roteiro-total)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Banco de Dados](#-banco-de-dados)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Endpoints da API](#-endpoints-da-api)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Usuários de Teste](#-usuários-de-teste)
- [Autores](#-autores)

---

## 📖 Sobre o Projeto

O **Agenda Quick** é uma aplicação web full-stack para gerenciamento de agendamentos cirúrgicos em ambiente hospitalar. O sistema permite o cadastro e controle de **salas cirúrgicas**, **pacientes**, **insumos médicos** e a gestão completa de **agendamentos de cirurgias**, com visualização em formato de calendário semanal.

Desenvolvido como **Projeto Integrador** da FPM, aplicando **Clean Architecture**, **SOLID**, **Object Calisthenics**, ORM com SQLAlchemy e containerização com Docker.

---

## ✅ Cumprimento do Roteiro Total

Esta seção detalha cada etapa do roteiro do professor e o que foi implementado.

---

### Etapa 01 — Formação dos Grupos e Ideia Inicial ✅

**Projeto:** Agenda Quick — Sistema de Agendamento de Centros Cirúrgicos

**Área de atuação:** Saúde / Hospitalar

**Descrição:** Sistema web para gestão de agendamentos cirúrgicos, permitindo que equipes hospitalares registrem, acompanhem e controlem cirurgias em salas operatórias, com controle de pacientes, médicos, insumos e relatórios gerenciais.

**Problema resolvido:** Hospitais que ainda gerenciam agendamentos cirúrgicos em planilhas ou sistemas legados perdem tempo, cometem conflitos de horário e não têm visibilidade do estoque de insumos em tempo real.

---

### Etapa 02 — Descrição da Ideia + Persona + Requisitos Funcionais ✅

**Persona principal:** Dr. Carlos Mendes, 42 anos, Cirurgião Geral. Acessa o sistema antes das cirurgias para confirmar sala, verificar disponibilidade de insumos e consultar o histórico do paciente. Precisa de uma interface rápida que funcione no celular e no computador do plantão.

**Requisitos Funcionais implementados (seleção dos 20):**

| # | Requisito |
|---|-----------|
| RF01 | O sistema deve permitir que o usuário faça login com e-mail e senha |
| RF02 | O sistema deve gerar um token JWT válido ao realizar login com sucesso |
| RF03 | O sistema deve permitir visualizar agendamentos em calendário semanal |
| RF04 | O sistema deve permitir criar um novo agendamento com paciente, médico, sala e serviço |
| RF05 | O sistema deve permitir alterar o status do agendamento (agendado/confirmado/realizado/cancelado/no_show) |
| RF06 | O sistema deve permitir excluir agendamentos |
| RF07 | O sistema deve exibir painel de detalhes ao clicar em um agendamento |
| RF08 | O sistema deve listar salas cirúrgicas com paginação |
| RF09 | O sistema deve permitir criar, editar e desativar salas cirúrgicas |
| RF10 | O sistema deve impedir exclusão de sala com agendamentos futuros ativos |
| RF11 | O sistema deve listar pacientes com filtro por nome e paginação |
| RF12 | O sistema deve validar CPF único ao cadastrar paciente |
| RF13 | O sistema deve listar insumos com paginação e filtro por nome |
| RF14 | O sistema deve impedir cadastro de insumos com nome duplicado |
| RF15 | O sistema deve impedir quantidade negativa ao atualizar estoque de insumo |
| RF16 | O sistema deve permitir cadastrar usuários com tipos: administrador, médico, enfermeiro, técnico |
| RF17 | O sistema deve restringir ações de cadastro/edição/exclusão de usuários a administradores |
| RF18 | O sistema deve exibir dashboard com totais de agendamentos por status |
| RF19 | O sistema deve permitir filtrar relatórios por período, status e médico |
| RF20 | O sistema deve impedir que o usuário desative a própria conta |

---

### Etapa 03 — Telas em Sequência ✅

O projeto possui as seguintes telas funcionais com navegação entre si:

1. **Login** — autenticação com e-mail e senha, conectada ao backend
2. **Agenda (Calendário)** — grade semanal com agendamentos por hora
3. **Modal de Nova Cirurgia** — formulário de criação de agendamento
4. **Painel de Detalhes** — visualização e alteração de status do agendamento
5. **Salas Cirúrgicas** — tabela CRUD com paginação e ações em lote
6. **Pacientes** — tabela CRUD com busca por nome e paginação
7. **Insumos** — tabela CRUD com controle de estoque
8. **Relatórios** — dashboard com filtros e listagem detalhada
9. **Usuários** — gerenciamento de usuários (exclusivo para administradores)

> Tecnologia: React 18 + Vite (evolução natural de HTML/CSS/JS para SPA profissional)

---

### Etapa 04 — Modelagem do Banco de Dados (MER) ✅

Diagrama MER criado no MySQL Workbench (`Banco de Dados/agenda_quickMER.mwb`) com **17 tabelas**:

`filial` · `centro_cirurgico` · `sala` · `horario_funcionamento` · `usuario` · `grupo` · `usuario_grupo` · `permissao` · `grupo_permissao` · `paciente` · `tipo_servico` · `agendamento` · `ausencia` · `categoria_insumo` · `insumo` · `reserva_insumo` · `estoque_sala` · `log_agendamento`

Todos os relacionamentos estão representados com chaves primárias, estrangeiras e cardinalidades (1:N e N:N).

---

### Etapa 05 — Banco de Dados Físico: Script SQL (DDL + Dados) ✅

Arquivo: `Banco de Dados/agenda_quick_db.sql`

- **17 tabelas** com DDL completo (PK, FK, UNIQUE, índices, ENUMs)
- **3 Triggers** com lógica útil de negócio:
  - `trg_conflito_medico` — impede conflito de horário do médico
  - `trg_atualiza_estoque` — debita estoque ao reservar insumo
  - `trg_log_status` — registra log automático de mudança de status
- **INSERTs** com dados de teste para todas as tabelas principais
- Código comentado explicando a finalidade de cada trigger

---

### Etapa 06 — Interface Web com Conexão ao Banco + BPMN ✅

- **9 telas funcionais** em React, todas conectadas ao backend FastAPI + MySQL
- Operações de leitura e inserção no banco em todas as telas principais
- Layout responsivo em dark-mode com CSS-in-JS
- Diagrama BPMN disponível em `MODELO BPMN AGENDA QUICK.png`

---

### Etapa 07 — Autenticação e Segurança ✅

**Decisão técnica: JWT (JSON Web Token)**

Motivo da escolha: JWT é stateless, escalável, não exige armazenamento de sessão no servidor e é o padrão da indústria para APIs REST.

**Decisão técnica: Bcrypt para criptografia de senha**

Motivo da escolha: Bcrypt é resistente a ataques de força bruta por ter custo computacional ajustável, gera salt automático por hash e é mais seguro que MD5/SHA para senhas.

**Implementação:**

```
POST /auth/login
  → valida email/senha no banco
  → verifica senha com bcrypt (passlib)
  → retorna JWT assinado com HS256
  → frontend armazena em localStorage
  → todas as rotas exigem: Authorization: Bearer <token>
```

**Controle de acesso por tipo:**
- `administrador` — acesso total (CRUD de usuários, salas, insumos)
- `medico` — acesso a agendamentos e leitura geral
- `enfermeiro` / `tecnico` — acesso somente leitura a recursos protegidos

**Segurança adicional:**
- `JWT_SECRET_KEY` lida de variável de ambiente (nunca hardcoded)
- Usuários inativos (`ativo = false`) são rejeitados mesmo com token válido
- Admin não pode desativar a própria conta

---

### Etapa 08 — Cronograma de Desenvolvimento ✅

Disponível em planilha Excel separada conforme orientação do professor.

---

### Etapa 09 — Integração Backend + CRUD Completo ✅

**2 CRUDs completos (Create, Read, Update, Delete) com validações:**

**CRUD 1 — Agendamentos**

| Método | Rota | Ação |
|--------|------|------|
| GET | `/api/v2/appointments` | Lista todos |
| POST | `/api/v2/appointments` | Cria agendamento |
| PUT | `/api/v2/appointments/{key}/status` | Atualiza status |
| DELETE | `/api/v2/appointments/{key}` | Remove |

**CRUD 2 — Pacientes** (com paginação de 10 por página)

| Método | Rota | Ação |
|--------|------|------|
| GET | `/api/v2/pacientes?page=1&page_size=10` | Lista paginada |
| POST | `/api/v2/pacientes` | Cadastra |
| PUT | `/api/v2/pacientes/{id}` | Edita |
| DELETE | `/api/v2/pacientes/{id}` | Remove |

Além dos CRUDs de **Salas**, **Insumos** e **Usuários** com a mesma estrutura.

**Recursos do CRUD:**
- Paginação padrão de 10 registros por página (`?page=1&page_size=10`)
- Endpoint `/all` para preenchimento de selects sem paginação
- Exclusão de usuários via **soft delete** (campo `ativo = false`) — mantém histórico
- Autenticação JWT obrigatória em todas as rotas
- Logout funcional com remoção do token do `localStorage`

---

### Etapa 10 — Regras de Negócio, Stored Procedures e Relatórios ✅

**Validações de regras de negócio no backend (camada de serviços):**

| Regra | Onde |
|-------|------|
| Nome de sala não pode ser duplicado | `SalaService._verificar_nome_duplicado` |
| Não remover sala com agendamentos futuros ativos | `SalaService._verificar_agendamentos_futuros` |
| CPF único por paciente | `PacienteService._verificar_cpf_duplicado` |
| Não excluir paciente com histórico de agendamentos | `PacienteService._verificar_sem_historico` |
| Nome de insumo único | `InsumoService._verificar_nome_duplicado` |
| Quantidade de insumo não pode ser negativa | `InsumoService._validar_quantidade_positiva` |
| E-mail único por usuário | `UsuarioService._verificar_email_duplicado` |
| Admin não pode desativar a própria conta | `UsuarioService._verificar_auto_desativacao` |
| Tipo de usuário deve ser um dos valores válidos | `UsuarioService._validar_tipo` |

**2 Stored Procedures:**

```sql
-- SP 1: Relatório de agendamentos por período e médico (consulta complexa)
CALL sp_relatorio_agendamentos('2025-01-01', '2025-12-31', NULL);
-- Retorna: listagem detalhada + resumo por status

-- SP 2: Reserva transacional de insumos com controle de estoque
CALL sp_reservar_insumos(1, 3, 2);
-- Verifica estoque → insere reserva → debita via trigger
```

**Relatório com filtros (Relatório 1 — Dashboard):**
- Cards: total, realizadas, confirmadas, agendadas, canceladas, no_show, pacientes, salas
- Filtros: `?data_inicio=&data_fim=&status=&medico_id=`

**Relatório com listagem (Relatório 2 — Listagem filtrada):**
- Tabela com: id, paciente, médico, sala, serviço, data/hora, status
- Exibe até 100 registros com orientação para usar filtros

**Níveis de acesso implementados:**

| Tipo | Permissões |
|------|-----------|
| `administrador` | CRUD completo + gestão de usuários |
| `medico` | Criar/alterar agendamentos, leitura de todos os módulos |
| `enfermeiro` / `tecnico` | Leitura geral, sem criação de usuários/insumos/salas |

---

### Etapa 11 — Documentação Final ✅

Este README constitui a documentação final do sistema, contendo:
- Descrição completa de todas as funcionalidades implementadas
- Estrutura de arquivos e pastas atualizada
- Tabela de validações de regras de negócio
- Código e descrição das Stored Procedures
- Variáveis de ambiente e configuração
- Instruções de execução com usuários de teste

---

### Etapa 12 — Apresentação Final

Slides disponíveis separadamente. Roteiro da demonstração ao vivo:

1. Login com usuário administrador
2. Visualização da agenda semanal
3. Criar novo agendamento (CRUD 1)
4. Alterar status do agendamento
5. Cadastrar paciente com validação de CPF (CRUD 2)
6. Visualizar relatório com filtros aplicados
7. Demonstrar controle de acesso (login como médico, tentar acessar usuários)

---

## 🏗 Arquitetura do Sistema

O backend segue **Clean Architecture** + **SOLID** + **Object Calisthenics**:

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION                         │
│   presentation/routes/  (um arquivo por recurso)         │
│   salas.py · pacientes.py · insumos.py · usuarios.py     │
│   relatorios.py · filiais.py · appointments.py           │
├─────────────────────────────────────────────────────────┤
│                     APPLICATION                          │
│   Use Cases (agendamentos) + Services (demais recursos)  │
│   SalaService · PacienteService · InsumoService          │
│   UsuarioService · RelatorioService                      │
├─────────────────────────────────────────────────────────┤
│                      DOMAIN                              │
│   Entities · Value Objects · Interface Repository        │
├─────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                         │
│   SQLAlchemy Models + SQLAppointmentRepository           │
├─────────────────────────────────────────────────────────┤
│                       CORE                               │
│   database.py · security.py · deps.py                    │
└─────────────────────────────────────────────────────────┘
```

**Princípios SOLID aplicados:**

| Princípio | Aplicação |
|-----------|-----------|
| **S** — Single Responsibility | Cada rota em seu próprio arquivo; cada Service cuida de um único recurso |
| **O** — Open/Closed | Services podem ser estendidos sem modificar as rotas |
| **L** — Liskov Substitution | `AppointmentRepository` é uma interface; `SQLAppointmentRepository` é substituível |
| **I** — Interface Segregation | `interface_repository.py` define apenas o contrato necessário |
| **D** — Dependency Inversion | Rotas dependem de abstrações (Services via Depends), não de implementações |

---

## 🔐 Autenticação e Segurança

### Bcrypt + JWT

As senhas **nunca** são armazenadas em texto plano. O fluxo é:

```
1. POST /auth/login (email + senha)
2. Backend busca usuário no banco pelo email
3. Verifica senha com bcrypt.verify (salt automático por hash)
4. Gera JWT assinado com HS256 + secret_key (variável de ambiente)
5. Frontend armazena token em localStorage
6. Todas as requisições incluem: Authorization: Bearer <token>
7. Backend valida assinatura + verifica se usuário está ativo
```

### Controle de acesso por tipo

```python
# Rota restrita a administradores
@router.post("", dependencies=[Depends(require_admin)])

# Rota acessível a qualquer usuário autenticado
@router.get("", dependencies=[Depends(get_current_user)])
```

---

## 🗄 Banco de Dados

### Triggers

```sql
trg_conflito_medico   -- Bloqueia agendamento com conflito de horário
trg_atualiza_estoque  -- Debita estoque ao registrar reserva de insumo
trg_log_status        -- Registra log automático de toda mudança de status
```

### Stored Procedures

```sql
-- Relatório complexo por período e médico
CALL sp_relatorio_agendamentos('2025-06-01', '2025-06-30', NULL);

-- Reserva transacional de insumos com verificação de estoque
CALL sp_reservar_insumos(1, 3, 2);
```

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React + Vite | 18.x |
| **Backend** | FastAPI | 0.109.x |
| **ORM** | SQLAlchemy | 2.0.x |
| **Validação** | Pydantic v2 | 2.6.x |
| **Banco** | MySQL | 9.1 |
| **Auth** | python-jose + passlib (bcrypt) | — |
| **Server** | Uvicorn | 0.27.x |
| **Container** | Docker + Docker Compose | — |

---

## 📂 Estrutura de Pastas

```
projeto-integrador-faculdade/
│
├── .env                          # Variáveis de ambiente (NÃO commitar)
├── .env.example                  # Modelo para configuração (commitar)
├── .gitignore                    # .env já incluído
├── docker-compose.yml            # Orquestração com variáveis de ambiente
├── README.md                     # Este arquivo
├── MODELO BPMN AGENDA QUICK.png  # Diagrama BPMN do processo
│
├── Banco de Dados/
│   ├── agenda_quickMER.mwb       # Diagrama MER (MySQL Workbench)
│   └── agenda_quick_db.sql       # DDL completo: 17 tabelas + triggers + SPs + dados
│
├── Backend/
│   ├── main.py                   # Entry point — registra todos os routers
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   ├── core/
│   │   ├── database.py           # Engine SQLAlchemy + get_db
│   │   ├── security.py           # Bcrypt + JWT (chaves via env vars)
│   │   └── deps.py               # get_current_user · require_admin · require_medico_or_admin
│   │
│   ├── domain/
│   │   ├── entities.py           # Entidade Appointment (dataclass)
│   │   ├── value_objects.py      # AppointmentStatus, AppointmentKey
│   │   └── interface_repository.py
│   │
│   ├── application/
│   │   ├── create_appointment.py
│   │   ├── get_appointments.py
│   │   ├── update_appointment.py
│   │   ├── delete_appointment.py
│   │   └── services/             # Camada de serviços (regras de negócio)
│   │       ├── sala_service.py
│   │       ├── paciente_service.py
│   │       ├── insumo_service.py
│   │       ├── usuario_service.py
│   │       └── relatorio_service.py
│   │
│   ├── infrastructure/
│   │   ├── models.py             # 8 modelos ORM mapeados
│   │   └── sql_repository.py     # Implementação do repositório de agendamentos
│   │
│   └── presentation/
│       ├── auth.py               # POST /auth/login
│       ├── schemas.py            # Todos os schemas Pydantic
│       └── routes/               # Um arquivo por recurso (SRP)
│           ├── appointments.py
│           ├── salas.py
│           ├── pacientes.py
│           ├── insumos.py
│           ├── usuarios.py
│           ├── relatorios.py
│           └── filiais.py
│
└── Frontend/
    └── agenda-quick-app/
        └── src/
            ├── App.jsx
            ├── components/
            │   ├── Login.jsx
            │   ├── Sidebar.jsx
            │   ├── Topbar.jsx
            │   ├── CalendarGrid.jsx
            │   ├── AppointmentModal.jsx
            │   ├── DetailPanel.jsx
            │   ├── SummaryCards.jsx
            │   └── Toast.jsx
            └── pages/
                ├── SalasPage.jsx
                ├── PacientesPage.jsx
                ├── InsumosPage.jsx
                ├── RelatoriosPage.jsx
                └── UsuariosPage.jsx
```

---

## 🌐 Endpoints da API

Documentação interativa: **http://localhost:8000/docs**

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `POST` | `/auth/login` | — | Login, retorna JWT |
| `GET` | `/api/v2/appointments` | JWT | Lista agendamentos |
| `POST` | `/api/v2/appointments` | JWT | Cria agendamento |
| `PUT` | `/api/v2/appointments/{key}/status` | JWT | Atualiza status |
| `DELETE` | `/api/v2/appointments/{key}` | JWT | Remove agendamento |
| `GET` | `/api/v2/salas?page=1&page_size=10` | JWT | Lista salas (paginado) |
| `POST` | `/api/v2/salas` | Admin | Cria sala |
| `PUT` | `/api/v2/salas/{id}` | Admin | Edita sala |
| `DELETE` | `/api/v2/salas/{id}` | Admin | Remove sala |
| `GET` | `/api/v2/pacientes?page=1&nome=` | JWT | Lista pacientes (paginado + filtro) |
| `POST` | `/api/v2/pacientes` | JWT | Cadastra paciente |
| `GET` | `/api/v2/insumos?page=1` | JWT | Lista insumos (paginado) |
| `GET` | `/api/v2/relatorios?data_inicio=&data_fim=&status=` | JWT | Dashboard + listagem filtrada |
| `GET` | `/api/v2/usuarios?page=1` | Admin | Lista usuários |
| `POST` | `/api/v2/usuarios` | Admin | Cria usuário |
| `DELETE` | `/api/v2/usuarios/{id}` | Admin | Desativa usuário (soft delete) |

---

## 🚀 Como Executar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Portas **3306**, **8000** e **5173** livres

### Passo a passo

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd projeto-integrador-faculdade

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações (ou use os valores padrão para desenvolvimento)

# 3. Suba todos os containers
docker compose up --build

# 4. Aguarde o MySQL inicializar (~30 segundos)
# Você verá: "Uvicorn running on http://0.0.0.0:8000"

# 5. Acesse
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/docs
```

### Reiniciar com banco limpo

```bash
docker compose down -v   # Remove volumes (apaga dados do MySQL)
docker compose up --build
```

---

## 🔧 Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste os valores. O `.env` já está no `.gitignore`.

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão SQLAlchemy | `mysql+pymysql://agenda_app:...@db:3306/agenda_quick` |
| `JWT_SECRET_KEY` | Chave de assinatura JWT (gere com `secrets.token_hex(32)`) | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiração do token em minutos | `60` |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) | `http://localhost:5173` |
| `VITE_API_URL` | URL da API para o frontend | `http://localhost:8000` |
| `MYSQL_ROOT_PASSWORD` | Senha root do MySQL | — |

---

## 👤 Usuários de Teste

Após subir o banco com o script DDL, os seguintes usuários estão disponíveis:

| Nome | E-mail | Senha | Tipo |
|------|--------|-------|------|
| Admin Sistema | `admin@agendaquick.com` | `admin123` | administrador |
| Dr. Carlos Mendes | `carlos.mendes@agendaquick.com` | `medico123` | medico |
| Enf. Juliana Costa | `juliana.costa@agendaquick.com` | `enfermeiro123` | enfermeiro |

> Senhas armazenadas com hash Bcrypt — nunca em texto plano.

---

## 📄 Formato CSV para Importação em Massa

### Salas
```csv
nome,capacidade
Sala 10,8
Sala 11,12
```

### Pacientes
```csv
nome,cpf,telefone
João da Silva,12345678900,(62) 99999-0000
Maria Santos,98765432100,(62) 98888-1111
```

### Insumos
```csv
nome,categoria_id,unidade_medida,quantidade
Luva Cirúrgica P,1,par,500
Soro Fisiológico 1L,2,frasco,200
```

---

## 👥 Autores

Desenvolvido como **Projeto Integrador** — FPM (Faculdade de Princípios Militares) · 2025.

---

<p align="center">
  Feito com ❤️ usando <strong>FastAPI</strong>, <strong>React</strong>, <strong>MySQL</strong> e <strong>Docker</strong>
</p>
