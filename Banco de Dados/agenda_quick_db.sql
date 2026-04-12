-- ============================================================
--  AGENDA QUICK — Tabelas + Dados de Teste
--  Execute este arquivo PRIMEIRO no Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS agenda_quick
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agenda_quick;

-- ============================================================
-- BLOCO 1: ESTRUTURA HOSPITALAR
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
-- BLOCO 2: USUARIOS, GRUPOS E PERMISSOES
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
    CONSTRAINT pk_paciente        PRIMARY KEY (id),
    CONSTRAINT fk_paciente_filial FOREIGN KEY (filial_id)
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
    CONSTRAINT pk_agendamento     PRIMARY KEY (id),
    CONSTRAINT fk_ag_paciente     FOREIGN KEY (paciente_id)
        REFERENCES paciente(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_medico       FOREIGN KEY (medico_id)
        REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_sala         FOREIGN KEY (sala_id)
        REFERENCES sala(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ag_tipo_servico FOREIGN KEY (tipo_servico_id)
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

-- Tabela extra para a Trigger 3 (log de auditoria)
CREATE TABLE log_agendamento (
    id              INT       UNSIGNED NOT NULL AUTO_INCREMENT,
    agendamento_id  INT       UNSIGNED NOT NULL,
    status_anterior ENUM('agendado','confirmado','realizado','cancelado','no_show') NULL,
    status_novo     ENUM('agendado','confirmado','realizado','cancelado','no_show') NOT NULL,
    alterado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_log_agendamento PRIMARY KEY (id)
);

-- ============================================================
-- DADOS DE TESTE
-- ============================================================

INSERT INTO filial (nome, cnpj, endereco) VALUES
    ('Hospital Central Goiania', '12345678000100', 'Av. Goias, 1000 - Centro, Goiania'),
    ('Clinica Norte',            '98765432000199', 'Rua 90, 500 - Setor Norte, Goiania');

INSERT INTO centro_cirurgico (filial_id, nome, descricao) VALUES
    (1, 'Bloco A - Cirurgia Geral', 'Bloco principal de cirurgias gerais'),
    (1, 'Bloco B - Cardiologia',    'Especializado em cirurgias cardiacas'),
    (2, 'Centro Cirurgico Norte',   'Unico bloco da filial norte');

INSERT INTO sala (centro_id, nome, capacidade) VALUES
    (1, 'Sala 01',       5),
    (1, 'Sala 02',       5),
    (2, 'Sala Cardio',   8),
    (3, 'Sala Norte 01', 4);

INSERT INTO horario_funcionamento (sala_id, dia_semana, abertura, fechamento) VALUES
    (1, 1, '07:00', '18:00'),
    (1, 2, '07:00', '18:00'),
    (1, 3, '07:00', '18:00'),
    (2, 1, '07:00', '17:00'),
    (3, 1, '06:00', '20:00'),
    (4, 1, '08:00', '16:00');

INSERT INTO usuario (filial_id, nome, email, crm, tipo) VALUES
    (1, 'Dr. Ricardo Alves',  'ricardo@hospital.com',  'CRM-GO-12345', 'medico'),
    (1, 'Dra. Fernanda Lima', 'fernanda@hospital.com', 'CRM-GO-67890', 'medico'),
    (1, 'Enf. Carla Souza',   'carla@hospital.com',    NULL,           'enfermeiro'),
    (1, 'Admin Joao Silva',   'joao@hospital.com',     NULL,           'administrador'),
    (2, 'Dr. Paulo Mendes',   'paulo@clinica.com',     'CRM-GO-11111', 'medico'),
    (2, 'Enf. Ana Rodrigues', 'ana@clinica.com',       NULL,           'enfermeiro');

INSERT INTO grupo (filial_id, nome) VALUES
    (1, 'Medicos'),
    (1, 'Enfermeiros'),
    (1, 'Administradores'),
    (2, 'Medicos Norte');

INSERT INTO usuario_grupo (usuario_id, grupo_id) VALUES
    (1,1),(2,1),(3,2),(4,3),(5,4),(6,4);

INSERT INTO permissao (chave, descricao) VALUES
    ('agendamento.criar',    'Criar agendamentos'),
    ('agendamento.editar',   'Editar agendamentos'),
    ('agendamento.cancelar', 'Cancelar agendamentos'),
    ('paciente.gerenciar',   'Criar e editar pacientes'),
    ('insumo.gerenciar',     'Gerenciar insumos e estoque'),
    ('relatorio.visualizar', 'Ver relatorios'),
    ('usuario.gerenciar',    'Gerenciar usuarios');

INSERT INTO grupo_permissao (grupo_id, permissao_id) VALUES
    (1,1),(1,2),(1,6),
    (2,1),(2,5),
    (3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),
    (4,1),(4,2),(4,6);

INSERT INTO paciente (filial_id, nome, cpf, telefone) VALUES
    (1, 'Maria Aparecida Santos', '12345678901', '62999991111'),
    (1, 'Jose Carlos Oliveira',   '23456789012', '62999992222'),
    (1, 'Ana Paula Ferreira',     '34567890123', '62999993333'),
    (1, 'Roberto Costa Lima',     '45678901234', '62999994444'),
    (2, 'Lucia Helena Barbosa',   '56789012345', '62999995555'),
    (2, 'Pedro Henrique Souza',   '67890123456', '62999996666');

INSERT INTO tipo_servico (nome, duracao_minutos) VALUES
    ('Cirurgia Geral',    120),
    ('Cirurgia Cardiaca', 240),
    ('Colonoscopia',       60),
    ('Ortopedia',         150),
    ('Oftalmologia',       45);

INSERT INTO agendamento (paciente_id, medico_id, sala_id, tipo_servico_id, inicio, fim, status) VALUES
    (1, 1, 1, 1, '2025-08-04 08:00:00', '2025-08-04 10:00:00', 'realizado'),
    (2, 1, 1, 3, '2025-08-04 11:00:00', '2025-08-04 12:00:00', 'realizado'),
    (3, 2, 3, 2, '2025-08-05 07:00:00', '2025-08-05 11:00:00', 'confirmado'),
    (4, 1, 2, 4, '2025-08-06 09:00:00', '2025-08-06 11:30:00', 'agendado'),
    (5, 5, 4, 1, '2025-08-07 08:00:00', '2025-08-07 10:00:00', 'agendado'),
    (6, 5, 4, 5, '2025-08-07 11:00:00', '2025-08-07 11:45:00', 'agendado');

INSERT INTO ausencia (agendamento_id, motivo) VALUES
    (2, 'Paciente nao compareceu e nao avisou.');

INSERT INTO categoria_insumo (nome) VALUES
    ('Anestesicos'),('Descartaveis'),('Instrumentais'),('Medicamentos');

INSERT INTO insumo (categoria_id, nome, unidade_medida) VALUES
    (1, 'Propofol 200mg',         'ampola'),
    (1, 'Lidocaina 2%',           'frasco'),
    (2, 'Luva cirurgica G',       'par'),
    (2, 'Curativo esteril 10x10', 'unidade'),
    (2, 'Seringa 20ml',           'unidade'),
    (3, 'Bisturi cabo nr 4',      'unidade'),
    (4, 'Soro fisiologico 500ml', 'frasco');

INSERT INTO estoque_sala (sala_id, insumo_id, quantidade_disponivel) VALUES
    (1,1,20),(1,2,15),(1,3,50),(1,4,30),(1,5,100),(1,6,5),(1,7,25),
    (2,1,10),(2,3,40),(2,5,80),(2,7,20),
    (3,1,30),(3,2,20),(3,3,60),(3,6,8),(3,7,40),
    (4,3,30),(4,5,50),(4,7,15);

INSERT INTO reserva_insumo (agendamento_id, insumo_id, quantidade) VALUES
    (3,1,2),(3,3,4),(3,7,2),
    (4,3,2),(4,5,5);

-- ============================================================
--  AGENDA QUICK — Triggers
--  Execute este arquivo DEPOIS do arquivo 1_tabelas_dados.sql
--  No Workbench: File > Open SQL Script > execute com o raio
-- ============================================================

USE agenda_quick;

DELIMITER $$

-- ============================================================
-- TRIGGER 1: Impedir conflito de horario do medico
-- Dispara: BEFORE INSERT em agendamento
-- Logica: bloqueia o INSERT se o medico ja tiver outro
-- agendamento ativo no mesmo intervalo de tempo.
-- ============================================================

CREATE TRIGGER trg_conflito_medico
BEFORE INSERT ON agendamento
FOR EACH ROW
BEGIN
    DECLARE v_conflito INT DEFAULT 0;

    SELECT COUNT(*) INTO v_conflito
    FROM   agendamento
    WHERE  medico_id = NEW.medico_id
      AND  status NOT IN ('cancelado', 'no_show')
      AND  NEW.inicio < fim
      AND  NEW.fim    > inicio;

    IF v_conflito > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Conflito de horario: medico ja possui agendamento neste intervalo.';
    END IF;
END$$

-- ============================================================
-- TRIGGER 2: Atualizar estoque ao reservar insumo
-- Dispara: AFTER INSERT em reserva_insumo
-- Logica: debita automaticamente a quantidade do estoque
-- da sala vinculada ao agendamento. Bloqueia se insuficiente.
-- ============================================================

CREATE TRIGGER trg_atualiza_estoque
AFTER INSERT ON reserva_insumo
FOR EACH ROW
BEGIN
    DECLARE v_sala_id    INT UNSIGNED DEFAULT 0;
    DECLARE v_disponivel INT UNSIGNED DEFAULT 0;

    SELECT sala_id INTO v_sala_id
    FROM   agendamento
    WHERE  id = NEW.agendamento_id;

    SELECT quantidade_disponivel INTO v_disponivel
    FROM   estoque_sala
    WHERE  sala_id   = v_sala_id
      AND  insumo_id = NEW.insumo_id;

    IF v_disponivel < NEW.quantidade THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estoque insuficiente para reservar este insumo nesta sala.';
    END IF;

    UPDATE estoque_sala
    SET    quantidade_disponivel = quantidade_disponivel - NEW.quantidade
    WHERE  sala_id   = v_sala_id
      AND  insumo_id = NEW.insumo_id;
END$$

-- ============================================================
-- TRIGGER 3: Registrar log de mudanca de status
-- Dispara: AFTER UPDATE em agendamento
-- Logica: toda vez que o status muda, grava automaticamente
-- em log_agendamento o valor anterior e o novo.
-- ============================================================

CREATE TRIGGER trg_log_status
AFTER UPDATE ON agendamento
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO log_agendamento
            (agendamento_id, status_anterior, status_novo)
        VALUES
            (NEW.id, OLD.status, NEW.status);
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- TESTE — rode apos criar as triggers
-- ============================================================

-- Testa a Trigger 3: muda status e verifica o log
UPDATE agendamento SET status = 'confirmado' WHERE id = 4;
UPDATE agendamento SET status = 'realizado'  WHERE id = 4;

-- Deve retornar 2 linhas no log
SELECT * FROM log_agendamento;