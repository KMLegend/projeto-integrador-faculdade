<p align="center">
  <h1 align="center">🏥 Agenda Quick</h1>
  <p align="center">
    <strong>Sistema de Agendamento Cirúrgico Hospitalar</strong><br/>
    Projeto Integrador — FPM ( Faculdade de Principios Militares )
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
- [Funcionalidades](#-funcionalidades)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Modelo de Dados (ER)](#-modelo-de-dados-er)
- [Endpoints da API](#-endpoints-da-api)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Screenshots](#-screenshots)
- [Autores](#-autores)

---

## 📖 Sobre o Projeto

O **Agenda Quick** é uma aplicação web full-stack para gerenciamento de agendamentos cirúrgicos em ambiente hospitalar. O sistema permite o cadastro e controle de **salas cirúrgicas**, **pacientes**, **insumos médicos** e a gestão completa de **agendamentos de cirurgias**, com visualização em formato de calendário semanal.

O projeto foi desenvolvido como parte do **Projeto Integrador** da FPM ( Faculdade de Principios Militares ), aplicando conceitos de **Clean Architecture**, **Object-Relational Mapping (ORM)** com SQLAlchemy, e containerização com **Docker**.

---

## ✨ Funcionalidades

### 📅 Agenda (Módulo Principal)
- Visualização de cirurgias em grade semanal (calendário interativo)
- Agendamento de novas cirurgias com seleção de paciente, médico, sala e tipo de serviço
- Alteração de status do agendamento (`agendado`, `confirmado`, `realizado`, `cancelado`, `no_show`)
- Exclusão de agendamentos
- Painel de detalhes ao selecionar um agendamento

### 🚪 Salas Cirúrgicas (CRUD Completo)
- Listagem de todas as salas com status (Ativa / Inativa)
- Cadastro, edição e exclusão de salas
- Controle de capacidade por sala
- **Importação em massa via arquivo CSV**

### 👥 Pacientes (CRUD Completo)
- Listagem de pacientes com CPF e telefone
- Cadastro, edição e exclusão de pacientes
- **Importação em massa via arquivo CSV**

### 📦 Insumos e Estoque (CRUD Completo)
- Listagem de insumos com quantidade em estoque, status e unidade de medida
- Cadastro, edição e exclusão de insumos
- Controle de quantidade disponível em tempo real
- **Importação em massa via arquivo CSV**

### 📊 Relatórios (Dashboard)
- Total de agendamentos registrados
- Cirurgias realizadas vs. canceladas
- Total de pacientes cadastrados
- Total de salas cirúrgicas disponíveis

### 🎨 Interface
- Design dark-mode moderno e responsivo
- Seleção múltipla de registros com checkboxes
- Barra de ações flutuante (Floating Action Bar) para edição/exclusão em lote
- Modais de formulário para criação e edição de registros
- Sistema de notificações toast para feedback do usuário
- Tela de login simulada com seleção de perfil médico

---

## 🏗 Arquitetura do Sistema

O backend segue os princípios da **Clean Architecture**, organizado em camadas independentes:

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                       │
│          (FastAPI Routes + Pydantic Schemas)          │
├─────────────────────────────────────────────────────┤
│                   APPLICATION                        │
│              (Use Cases / Casos de Uso)               │
├─────────────────────────────────────────────────────┤
│                     DOMAIN                           │
│         (Entities + Value Objects + Interfaces)       │
├─────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                      │
│           (SQLAlchemy Models + Repositories)          │
├─────────────────────────────────────────────────────┤
│                      CORE                            │
│            (Database Engine + Session)                │
└─────────────────────────────────────────────────────┘
```

**Fluxo de dados:**

```
Frontend (React) ──HTTP──▶ FastAPI Router ──▶ Use Case ──▶ Repository ──▶ MySQL
```

---

## 🔐 Autenticação e Segurança

Para garantir a integridade dos dados e o acesso restrito às funcionalidades do sistema, implementamos um fluxo robusto de autenticação:

### 🛡️ Por que Bcrypt?
As senhas dos usuários **nunca** são armazenadas em texto plano. Utilizamos o algoritmo **Bcrypt** para realizar o hashing das senhas antes de salvá-las no banco de dados.
- **Salt Nativo:** O Bcrypt gera automaticamente um *salt* único para cada senha, protegendo contra ataques de dicionário e *rainbow tables*.
- **Work Factor:** Permite ajustar o custo computacional do hash, tornando ataques de força bruta extremamente lentos e inviáveis.

### 🎫 Autenticação via JWT (JSON Web Tokens)
Adotamos o padrão **JWT** para o gerenciamento de sessões de forma *stateless*:
- **Escalabilidade:** O servidor não precisa armazenar sessões em memória, validando o acesso apenas pela assinatura do token.
- **Segurança de Rota:** Todas as requisições para o backend (exceto o login) exigem o cabeçalho `Authorization: Bearer <token>`. O backend utiliza uma chave secreta para validar a integridade do token em cada chamada.
- **Persistência:** O frontend armazena o token de forma segura para manter o usuário conectado entre sessões.

### 🔒 Proteção de Endpoints
Todas as rotas da API são protegidas por uma camada de dependência no FastAPI que verifica a validade do token JWT antes de executar qualquer lógica de negócio, garantindo que apenas usuários autenticados possam visualizar ou manipular dados.

---

## 🛠 Stack Tecnológica

| Camada       | Tecnologia                     | Versão    |
|:-------------|:-------------------------------|:----------|
| **Frontend** | React (via Vite)               | 18.x      |
| **Backend**  | FastAPI                        | 0.109.2   |
| **ORM**      | SQLAlchemy                     | 2.0.27    |
| **Validação**| Pydantic                       | 2.6.1     |
| **Banco**    | MySQL                          | 9.1       |
| **Driver**   | PyMySQL + cryptography         | 1.1.0     |
| **Server**   | Uvicorn                        | 0.27.1    |
| **Container**| Docker + Docker Compose        | —         |
| **Testes**   | Pytest + HTTPX                 | 8.0.1     |

---

## 📂 Estrutura de Pastas

```
projeto-integrador-faculdade/
│
├── docker-compose.yml              # Orquestração dos 3 containers
├── README.md                       # Este arquivo
│
├── Banco de Dados/
│   └── ddl do banco.sql            # Script DDL completo (tabelas, seeds, FKs)
│
├── Backend/
│   ├── Dockerfile                  # Imagem Python 3.11
│   ├── requirements.txt            # Dependências pip
│   ├── main.py                     # Entry point FastAPI
│   │
│   ├── core/
│   │   └── database.py             # Engine SQLAlchemy + SessionLocal
│   │
│   ├── domain/
│   │   ├── entities.py             # Entidade Appointment (dataclass)
│   │   ├── value_objects.py        # AppointmentStatus, AppointmentKey
│   │   └── interface_repository.py # Interface abstrata do repositório
│   │
│   ├── application/
│   │   ├── create_appointment.py   # Use case: criar agendamento
│   │   ├── get_appointments.py     # Use case: listar agendamentos
│   │   ├── update_appointment.py   # Use case: atualizar status
│   │   └── delete_appointment.py   # Use case: excluir agendamento
│   │
│   ├── infrastructure/
│   │   ├── models.py               # Modelos ORM (Paciente, Sala, Insumo, etc.)
│   │   └── sql_repository.py       # Implementação concreta do repositório
│   │
│   └── presentation/
│       ├── routes.py               # Rotas de Agendamentos (Clean Architecture)
│       ├── other_routes.py         # Rotas CRUD: Salas, Pacientes, Insumos, Relatórios
│       └── schemas.py              # Schemas Pydantic para validação de requests
│
└── Frontend/
    └── agenda-quick-app/
        ├── Dockerfile              # Imagem Node.js para Vite dev server
        ├── package.json            # Dependências npm
        │
        └── src/
            ├── main.jsx            # Ponto de entrada React
            ├── App.jsx             # Componente raiz + roteamento por estado
            ├── index.css           # Estilos globais (dark theme)
            │
            ├── components/
            │   ├── Sidebar.jsx     # Menu lateral com navegação
            │   ├── Topbar.jsx      # Barra superior com busca
            │   ├── CalendarGrid.jsx# Grade semanal de agendamentos
            │   ├── AppointmentModal.jsx # Modal de criação de cirurgia
            │   ├── DetailPanel.jsx # Painel de detalhes do agendamento
            │   ├── SummaryCards.jsx# Cards de resumo (dashboard inicial)
            │   ├── Login.jsx       # Tela de login simulada
            │   ├── Toast.jsx       # Componente de notificação
            │   └── TableComponents.css # Estilos das tabelas CRUD
            │
            └── pages/
                ├── SalasPage.jsx      # CRUD de Salas Cirúrgicas
                ├── PacientesPage.jsx  # CRUD de Pacientes
                ├── InsumosPage.jsx    # CRUD de Insumos + Estoque
                └── RelatoriosPage.jsx # Dashboard de Métricas
```

---

## 🗄 Modelo de Dados (ER)

As principais tabelas do sistema e seus relacionamentos:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  paciente    │     │  usuario     │     │     sala     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ nome         │     │ nome         │     │ nome         │
│ cpf          │     │ tipo (enum)  │     │ centro_id    │
│ telefone     │     └──────┬───────┘     │ capacidade   │
│ filial_id    │            │             │ ativo        │
└──────┬───────┘            │             └──────┬───────┘
       │                    │                    │
       └───────────┐  ┌────┘  ┌─────────────────┘
                   ▼  ▼       ▼
             ┌──────────────────┐     ┌──────────────┐
             │   agendamento    │     │ tipo_servico  │
             ├──────────────────┤     ├──────────────┤
             │ id (PK)          │     │ id (PK)      │
             │ paciente_id (FK) │     │ nome         │
             │ medico_id (FK)   │◄────┤              │
             │ sala_id (FK)     │     └──────────────┘
             │ tipo_servico_id  │
             │ inicio (datetime)│
             │ fim (datetime)   │
             │ status (enum)    │
             │ observacoes      │
             └──────────────────┘

┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ categoria_insumo │     │    insumo    │     │ estoque_sala │
├──────────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)          │◄────│ categoria_id │     │ sala_id (PK) │
│ nome             │     │ id (PK)      │◄────│ insumo_id(PK)│
│ descricao        │     │ nome         │     │ qtd_disponiv │
└──────────────────┘     │ unidade_med  │     │ atualizado_em│
                         │ quantidade   │     └──────────────┘
                         │ ativo        │
                         └──────────────┘
```

**Status possíveis do agendamento:**
`agendado` → `confirmado` → `realizado` | `cancelado` | `no_show`

---

## 🌐 Endpoints da API

A documentação interativa da API está disponível em **http://localhost:8000/docs** (Swagger UI).

### Agendamentos (`/api/appointments`)

| Método   | Rota                            | Descrição                        |
|:---------|:--------------------------------|:---------------------------------|
| `GET`    | `/api/appointments`             | Lista todos os agendamentos      |
| `POST`   | `/api/appointments`             | Cria um novo agendamento         |
| `PUT`    | `/api/appointments/{key}/status`| Atualiza o status de um agendamento |
| `DELETE` | `/api/appointments/{key}`       | Remove um agendamento            |

### Salas (`/api/salas`)

| Método   | Rota                 | Descrição                       |
|:---------|:---------------------|:--------------------------------|
| `GET`    | `/api/salas`         | Lista todas as salas            |
| `POST`   | `/api/salas`         | Cadastra uma nova sala          |
| `PUT`    | `/api/salas/{id}`    | Edita uma sala existente        |
| `DELETE` | `/api/salas/{id}`    | Remove uma sala                 |
| `POST`   | `/api/salas/bulk`    | Importação em massa (CSV/JSON)  |

### Pacientes (`/api/pacientes`)

| Método   | Rota                    | Descrição                       |
|:---------|:------------------------|:--------------------------------|
| `GET`    | `/api/pacientes`        | Lista todos os pacientes        |
| `POST`   | `/api/pacientes`        | Cadastra um novo paciente       |
| `PUT`    | `/api/pacientes/{id}`   | Edita um paciente               |
| `DELETE` | `/api/pacientes/{id}`   | Remove um paciente              |
| `POST`   | `/api/pacientes/bulk`   | Importação em massa (CSV/JSON)  |

### Insumos (`/api/insumos`)

| Método   | Rota                   | Descrição                       |
|:---------|:-----------------------|:--------------------------------|
| `GET`    | `/api/insumos`         | Lista todos os insumos          |
| `POST`   | `/api/insumos`         | Cadastra um novo insumo         |
| `PUT`    | `/api/insumos/{id}`    | Edita um insumo                 |
| `DELETE` | `/api/insumos/{id}`    | Remove um insumo                |
| `POST`   | `/api/insumos/bulk`    | Importação em massa (CSV/JSON)  |

### Relatórios (`/api/relatorios`)

| Método   | Rota                 | Descrição                        |
|:---------|:---------------------|:---------------------------------|
| `GET`    | `/api/relatorios`    | Retorna métricas agregadas       |

---

## 🚀 Como Executar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Porta **3306** (MySQL), **8000** (API) e **5173** (Frontend) livres

### Passo a passo

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd projeto-integrador-faculdade

# 2. Suba todos os containers
docker-compose up --build

# 3. Aguarde o MySQL inicializar e o Backend conectar (~30 segundos)
# Você verá: "Uvicorn running on http://0.0.0.0:8000"

# 4. Acesse a aplicação
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/docs
# MySQL:     localhost:3306 (user: root / pass: root)
```

### Parar os containers

```bash
docker-compose down
```

### Reiniciar com banco limpo

```bash
docker-compose down -v   # Remove os volumes (dados do MySQL)
docker-compose up --build
```

---

## 🔧 Variáveis de Ambiente

| Variável         | Container  | Valor Padrão                                    |
|:-----------------|:-----------|:-------------------------------------------------|
| `DATABASE_URL`   | backend    | `mysql+pymysql://root:root@db:3306/agenda_quick` |
| `VITE_API_URL`   | frontend   | `http://localhost:8000`                           |
| `MYSQL_ROOT_PASSWORD` | db    | `root`                                           |
| `MYSQL_DATABASE` | db         | `agenda_quick`                                   |

---

## 📸 Screenshots

> Acesse `http://localhost:5173` após subir os containers para visualizar a interface completa.

| Tela                  | Descrição                                                |
|:----------------------|:---------------------------------------------------------|
| **Login**             | Seleção de perfil médico com avatar e nome               |
| **Agenda (Calendário)**| Grade semanal com os agendamentos do dia, hora e sala   |
| **Salas**             | Tabela CRUD com checkboxes, filtros e ações em lote      |
| **Pacientes**         | Cadastro completo com CPF e telefone                     |
| **Insumos**           | Controle de estoque com quantidade e unidade de medida   |
| **Relatórios**        | Dashboard com cards de métricas agregadas                |

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
João da Silva,123.456.789-00,(62) 99999-0000
Maria Santos,987.654.321-00,(62) 98888-1111
```

### Insumos
```csv
nome,categoria_id,unidade_medida,quantidade
Luva Cirúrgica P,1,par,500
Soro Fisiológico 1L,2,frasco,200
```

---

## 👥 Autores

Desenvolvido como **Projeto Integrador** — FPM ( Faculdade de Principios Militares ).

---

<p align="center">
  Feito com ❤️ usando <strong>FastAPI</strong>, <strong>React</strong>, <strong>MySQL</strong> e <strong>Docker</strong>
</p>
