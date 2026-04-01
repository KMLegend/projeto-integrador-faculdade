-- ============================================================
--  AGENDA QUICK — Script para Engenharia Reversa
--  MySQL Workbench: File > Import > Reverse Engineer MySQL Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS agenda_quick
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agenda_quick;

-- ============================================================
-- BLOCO 1: ESTRUTURA HOSPITALAR
-- filial → centro_cirurgico → sala → horario_funcionamento
-- ============================================================

CREATE TABLE filial (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(150) NOT NULL,
    cnpj      CHAR(14)     NOT NULL,
    endereco  VARCHAR(191)     NULL,
    ativo     TINYINT(1)   NOT NULL DEFAULT 1,
    criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_filial      PRIMARY KEY (id),
    CONSTRAINT uq_filial_cnpj UNIQUE (cnpj)
);

CREATE TABLE centro_cirurgico (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    filial_id INT          UNSIGNED NOT NULL,
    nome      VARCHAR(150) NOT NULL,
    descricao TEXT             NULL,
    ativo     TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_centro        PRIMARY KEY (id),
    CONSTRAINT fk_centro_filial FOREIGN KEY (filial_id)
        REFERENCES filial(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE sala (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    centro_id  INT          UNSIGNED NOT NULL,
    nome       VARCHAR(100) NOT NULL,
    capacidade TINYINT      UNSIGNED     NULL,
    ativo      TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_sala        PRIMARY KEY (id),
    CONSTRAINT fk_sala_centro FOREIGN KEY (centro_id)
        REFERENCES centro_cirurgico(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE horario_funcionamento (
    id         INT      UNSIGNED NOT NULL AUTO_INCREMENT,
    sala_id    INT      UNSIGNED NOT NULL,
    dia_semana TINYINT  UNSIGNED NOT NULL,
    abertura   TIME     NOT NULL,
    fechamento TIME     NOT NULL,
    CONSTRAINT pk_horario          PRIMARY KEY (id),
    CONSTRAINT fk_horario_sala     FOREIGN KEY (sala_id)
        REFERENCES sala(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_horario_sala_dia UNIQUE (sala_id, dia_semana)
);

-- ============================================================
-- BLOCO 2: USUÁRIOS, GRUPOS E PERMISSÕES (RBAC)
-- ============================================================

CREATE TABLE usuario (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    filial_id INT          UNSIGNED NOT NULL,
    nome      VARCHAR(150) NOT NULL,
    email     VARCHAR(191) NOT NULL,
    crm       VARCHAR(20)      NULL,
    tipo      ENUM('administrador','medico','enfermeiro','tecnico') NOT NULL,
    sso_sub   VARCHAR(191)     NULL,
    ativo     TINYINT(1)   NOT NULL DEFAULT 1,
    criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuario        PRIMARY KEY (id),
    CONSTRAINT uq_usuario_email  UNIQUE (email),
    CONSTRAINT fk_usuario_filial FOREIGN KEY (filial_id)
        REFERENCES filial(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE grupo (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    filial_id INT          UNSIGNED NOT NULL,
    nome      VARCHAR(100) NOT NULL,
    descricao TEXT             NULL,
    CONSTRAINT pk_grupo        PRIMARY KEY (id),
    CONSTRAINT fk_grupo_filial FOREIGN KEY (filial_id)
        REFERENCES filial(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- N:N entre usuario e grupo
CREATE TABLE usuario_grupo (
    usuario_id INT UNSIGNED NOT NULL,
    grupo_id   INT UNSIGNED NOT NULL,
    CONSTRAINT pk_usuario_grupo PRIMARY KEY (usuario_id, grupo_id),
    CONSTRAINT fk_ug_usuario    FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ug_grupo      FOREIGN KEY (grupo_id)
        REFERENCES grupo(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE permissao (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    chave     VARCHAR(100) NOT NULL,
    descricao VARCHAR(191)     NULL,
    CONSTRAINT pk_permissao       PRIMARY KEY (id),
    CONSTRAINT uq_permissao_chave UNIQUE (chave)
);

-- N:N entre grupo e permissao
CREATE TABLE grupo_permissao (
    grupo_id     INT UNSIGNED NOT NULL,
    permissao_id INT UNSIGNED NOT NULL,
    CONSTRAINT pk_grupo_permissao PRIMARY KEY (grupo_id, permissao_id),
    CONSTRAINT fk_gp_grupo        FOREIGN KEY (grupo_id)
        REFERENCES grupo(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_gp_permissao    FOREIGN KEY (permissao_id)
        REFERENCES permissao(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- BLOCO 3: PACIENTES
-- ============================================================

CREATE TABLE paciente (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    filial_id INT          UNSIGNED NOT NULL,
    nome      VARCHAR(150) NOT NULL,
    cpf       CHAR(11)         NULL,
    telefone  VARCHAR(20)      NULL,
    email     VARCHAR(191)     NULL,
    ativo     TINYINT(1)   NOT NULL DEFAULT 1,
    criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_paciente         PRIMARY KEY (id),
    CONSTRAINT fk_paciente_filial  FOREIGN KEY (filial_id)
        REFERENCES filial(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- BLOCO 4: AGENDAMENTOS
-- ============================================================

CREATE TABLE tipo_servico (
    id              INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(150) NOT NULL,
    duracao_minutos SMALLINT     UNSIGNED NOT NULL DEFAULT 60,
    descricao       TEXT             NULL,
    ativo           TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_tipo_servico      PRIMARY KEY (id),
    CONSTRAINT uq_tipo_servico_nome UNIQUE (nome)
);

CREATE TABLE agendamento (
    id              INT       UNSIGNED NOT NULL AUTO_INCREMENT,
    paciente_id     INT       UNSIGNED NOT NULL,
    medico_id       INT       UNSIGNED NOT NULL,
    sala_id         INT       UNSIGNED NOT NULL,
    tipo_servico_id INT       UNSIGNED NOT NULL,
    inicio          DATETIME  NOT NULL,
    fim             DATETIME  NOT NULL,
    status          ENUM('agendado','confirmado','realizado','cancelado','no_show')
                              NOT NULL DEFAULT 'agendado',
    observacoes     TEXT          NULL,
    criado_em       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_agendamento        PRIMARY KEY (id),
    CONSTRAINT fk_ag_paciente        FOREIGN KEY (paciente_id)
        REFERENCES paciente(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_medico          FOREIGN KEY (medico_id)
        REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_sala            FOREIGN KEY (sala_id)
        REFERENCES sala(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_tipo_servico    FOREIGN KEY (tipo_servico_id)
        REFERENCES tipo_servico(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE ausencia (
    id             INT       UNSIGNED NOT NULL AUTO_INCREMENT,
    agendamento_id INT       UNSIGNED NOT NULL,
    registrado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo         TEXT          NULL,
    CONSTRAINT pk_ausencia             PRIMARY KEY (id),
    CONSTRAINT uq_ausencia_agendamento UNIQUE (agendamento_id),
    CONSTRAINT fk_ausencia_agendamento FOREIGN KEY (agendamento_id)
        REFERENCES agendamento(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- BLOCO 5: INSUMOS
-- ============================================================

CREATE TABLE categoria_insumo (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(100) NOT NULL,
    descricao TEXT             NULL,
    CONSTRAINT pk_categoria_insumo      PRIMARY KEY (id),
    CONSTRAINT uq_categoria_insumo_nome UNIQUE (nome)
);

CREATE TABLE insumo (
    id             INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    categoria_id   INT          UNSIGNED NOT NULL,
    nome           VARCHAR(150) NOT NULL,
    unidade_medida VARCHAR(30)  NOT NULL DEFAULT 'unidade',
    ativo          TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_insumo           PRIMARY KEY (id),
    CONSTRAINT uq_insumo_nome      UNIQUE (nome),
    CONSTRAINT fk_insumo_categoria FOREIGN KEY (categoria_id)
        REFERENCES categoria_insumo(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- N:N entre agendamento e insumo
CREATE TABLE reserva_insumo (
    id             INT      UNSIGNED NOT NULL AUTO_INCREMENT,
    agendamento_id INT      UNSIGNED NOT NULL,
    insumo_id      INT      UNSIGNED NOT NULL,
    quantidade     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT pk_reserva_insumo    PRIMARY KEY (id),
    CONSTRAINT uq_reserva_ag_insumo UNIQUE (agendamento_id, insumo_id),
    CONSTRAINT fk_ri_agendamento    FOREIGN KEY (agendamento_id)
        REFERENCES agendamento(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ri_insumo         FOREIGN KEY (insumo_id)
        REFERENCES insumo(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE estoque_sala (
    sala_id               INT       UNSIGNED NOT NULL,
    insumo_id             INT       UNSIGNED NOT NULL,
    quantidade_disponivel INT       UNSIGNED NOT NULL DEFAULT 0,
    atualizado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_estoque_sala PRIMARY KEY (sala_id, insumo_id),
    CONSTRAINT fk_es_sala      FOREIGN KEY (sala_id)
        REFERENCES sala(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_es_insumo    FOREIGN KEY (insumo_id)
        REFERENCES insumo(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
