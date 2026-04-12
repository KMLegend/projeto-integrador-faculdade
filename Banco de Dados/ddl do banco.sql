-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: agenda_quick
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendamento`
--

DROP TABLE IF EXISTS `agendamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paciente_id` int unsigned NOT NULL,
  `medico_id` int unsigned NOT NULL,
  `sala_id` int unsigned NOT NULL,
  `tipo_servico_id` int unsigned NOT NULL,
  `inicio` datetime NOT NULL,
  `fim` datetime NOT NULL,
  `status` enum('agendado','confirmado','realizado','cancelado','no_show') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'agendado',
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ag_paciente` (`paciente_id`),
  KEY `fk_ag_medico` (`medico_id`),
  KEY `fk_ag_sala` (`sala_id`),
  KEY `fk_ag_tipo_servico` (`tipo_servico_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamento`
--

LOCK TABLES `agendamento` WRITE;
/*!40000 ALTER TABLE `agendamento` DISABLE KEYS */;
INSERT INTO `agendamento` VALUES (1,1,1,1,1,'2025-08-04 08:00:00','2025-08-04 10:00:00','realizado',NULL,'2026-04-11 00:57:54'),(2,2,1,1,3,'2025-08-04 11:00:00','2025-08-04 12:00:00','realizado',NULL,'2026-04-11 00:57:54'),(3,3,2,3,2,'2025-08-05 07:00:00','2025-08-05 11:00:00','confirmado',NULL,'2026-04-11 00:57:54'),(4,4,1,2,4,'2025-08-06 09:00:00','2025-08-06 11:30:00','realizado',NULL,'2026-04-11 00:57:54'),(5,5,5,4,1,'2025-08-07 08:00:00','2025-08-07 10:00:00','agendado',NULL,'2026-04-11 00:57:54'),(6,6,5,4,5,'2025-08-07 11:00:00','2025-08-07 11:45:00','agendado',NULL,'2026-04-11 00:57:54');
/*!40000 ALTER TABLE `agendamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ausencia`
--

DROP TABLE IF EXISTS `ausencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ausencia` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `agendamento_id` int unsigned NOT NULL,
  `registrado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ausencia_agendamento` (`agendamento_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ausencia`
--

LOCK TABLES `ausencia` WRITE;
/*!40000 ALTER TABLE `ausencia` DISABLE KEYS */;
INSERT INTO `ausencia` VALUES (1,2,'2026-04-11 00:57:54','Paciente nao compareceu e nao avisou.');
/*!40000 ALTER TABLE `ausencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_insumo`
--

DROP TABLE IF EXISTS `categoria_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_insumo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categoria_insumo_nome` (`nome`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_insumo`
--

LOCK TABLES `categoria_insumo` WRITE;
/*!40000 ALTER TABLE `categoria_insumo` DISABLE KEYS */;
INSERT INTO `categoria_insumo` VALUES (1,'Anestesicos',NULL),(2,'Descartaveis',NULL),(3,'Instrumentais',NULL),(4,'Medicamentos',NULL);
/*!40000 ALTER TABLE `categoria_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_cirurgico`
--

DROP TABLE IF EXISTS `centro_cirurgico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_cirurgico` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `filial_id` int unsigned NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_centro_filial` (`filial_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_cirurgico`
--

LOCK TABLES `centro_cirurgico` WRITE;
/*!40000 ALTER TABLE `centro_cirurgico` DISABLE KEYS */;
INSERT INTO `centro_cirurgico` VALUES (1,1,'Bloco A - Cirurgia Geral','Bloco principal de cirurgias gerais',1),(2,1,'Bloco B - Cardiologia','Especializado em cirurgias cardiacas',1),(3,2,'Centro Cirurgico Norte','Unico bloco da filial norte',1);
/*!40000 ALTER TABLE `centro_cirurgico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estoque_sala`
--

DROP TABLE IF EXISTS `estoque_sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estoque_sala` (
  `sala_id` int unsigned NOT NULL,
  `insumo_id` int unsigned NOT NULL,
  `quantidade_disponivel` int unsigned NOT NULL DEFAULT '0',
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sala_id`,`insumo_id`),
  KEY `fk_es_insumo` (`insumo_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estoque_sala`
--

LOCK TABLES `estoque_sala` WRITE;
/*!40000 ALTER TABLE `estoque_sala` DISABLE KEYS */;
INSERT INTO `estoque_sala` VALUES (1,1,20,'2026-04-11 00:57:54'),(1,2,15,'2026-04-11 00:57:54'),(1,3,50,'2026-04-11 00:57:54'),(1,4,30,'2026-04-11 00:57:54'),(1,5,100,'2026-04-11 00:57:54'),(1,6,5,'2026-04-11 00:57:54'),(1,7,25,'2026-04-11 00:57:54'),(2,1,10,'2026-04-11 00:57:54'),(2,3,40,'2026-04-11 00:57:54'),(2,5,80,'2026-04-11 00:57:54'),(2,7,20,'2026-04-11 00:57:54'),(3,1,30,'2026-04-11 00:57:54'),(3,2,20,'2026-04-11 00:57:54'),(3,3,60,'2026-04-11 00:57:54'),(3,6,8,'2026-04-11 00:57:54'),(3,7,40,'2026-04-11 00:57:54'),(4,3,30,'2026-04-11 00:57:54'),(4,5,50,'2026-04-11 00:57:54'),(4,7,15,'2026-04-11 00:57:54');
/*!40000 ALTER TABLE `estoque_sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filial`
--

DROP TABLE IF EXISTS `filial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filial` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` char(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endereco` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_filial_cnpj` (`cnpj`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filial`
--

LOCK TABLES `filial` WRITE;
/*!40000 ALTER TABLE `filial` DISABLE KEYS */;
INSERT INTO `filial` VALUES (1,'Hospital Central Goiania','12345678000100','Av. Goias, 1000 - Centro, Goiania',1,'2026-04-11 00:57:54'),(2,'Clinica Norte','98765432000199','Rua 90, 500 - Setor Norte, Goiania',1,'2026-04-11 00:57:54');
/*!40000 ALTER TABLE `filial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `filial_id` int unsigned NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_grupo_filial` (`filial_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` VALUES (1,1,'Medicos',NULL),(2,1,'Enfermeiros',NULL),(3,1,'Administradores',NULL),(4,2,'Medicos Norte',NULL);
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_permissao`
--

DROP TABLE IF EXISTS `grupo_permissao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_permissao` (
  `grupo_id` int unsigned NOT NULL,
  `permissao_id` int unsigned NOT NULL,
  PRIMARY KEY (`grupo_id`,`permissao_id`),
  KEY `fk_gp_permissao` (`permissao_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_permissao`
--

LOCK TABLES `grupo_permissao` WRITE;
/*!40000 ALTER TABLE `grupo_permissao` DISABLE KEYS */;
INSERT INTO `grupo_permissao` VALUES (1,1),(1,2),(1,6),(2,1),(2,5),(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(4,1),(4,2),(4,6);
/*!40000 ALTER TABLE `grupo_permissao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horario_funcionamento`
--

DROP TABLE IF EXISTS `horario_funcionamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_funcionamento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sala_id` int unsigned NOT NULL,
  `dia_semana` tinyint unsigned NOT NULL,
  `abertura` time NOT NULL,
  `fechamento` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_horario_sala_dia` (`sala_id`,`dia_semana`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario_funcionamento`
--

LOCK TABLES `horario_funcionamento` WRITE;
/*!40000 ALTER TABLE `horario_funcionamento` DISABLE KEYS */;
INSERT INTO `horario_funcionamento` VALUES (1,1,1,'07:00:00','18:00:00'),(2,1,2,'07:00:00','18:00:00'),(3,1,3,'07:00:00','18:00:00'),(4,2,1,'07:00:00','17:00:00'),(5,3,1,'06:00:00','20:00:00'),(6,4,1,'08:00:00','16:00:00');
/*!40000 ALTER TABLE `horario_funcionamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumo`
--

DROP TABLE IF EXISTS `insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int unsigned NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidade_medida` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unidade',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_insumo_nome` (`nome`),
  KEY `fk_insumo_categoria` (`categoria_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumo`
--

LOCK TABLES `insumo` WRITE;
/*!40000 ALTER TABLE `insumo` DISABLE KEYS */;
INSERT INTO `insumo` VALUES (1,1,'Propofol 200mg','ampola',1),(2,1,'Lidocaina 2%','frasco',1),(3,2,'Luva cirurgica G','par',1),(4,2,'Curativo esteril 10x10','unidade',1),(5,2,'Seringa 20ml','unidade',1),(6,3,'Bisturi cabo nr 4','unidade',1),(7,4,'Soro fisiologico 500ml','frasco',1);
/*!40000 ALTER TABLE `insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_agendamento`
--

DROP TABLE IF EXISTS `log_agendamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_agendamento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `agendamento_id` int unsigned NOT NULL,
  `status_anterior` enum('agendado','confirmado','realizado','cancelado','no_show') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_novo` enum('agendado','confirmado','realizado','cancelado','no_show') COLLATE utf8mb4_unicode_ci NOT NULL,
  `alterado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_agendamento`
--

LOCK TABLES `log_agendamento` WRITE;
/*!40000 ALTER TABLE `log_agendamento` DISABLE KEYS */;
INSERT INTO `log_agendamento` VALUES (1,4,'agendado','confirmado','2026-04-11 00:59:24'),(2,4,'confirmado','realizado','2026-04-11 00:59:24');
/*!40000 ALTER TABLE `log_agendamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `filial_id` int unsigned NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` char(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_paciente_filial` (`filial_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,1,'Maria Aparecida Santos','12345678901','62999991111',NULL,1,'2026-04-11 00:57:54'),(2,1,'Jose Carlos Oliveira','23456789012','62999992222',NULL,1,'2026-04-11 00:57:54'),(3,1,'Ana Paula Ferreira','34567890123','62999993333',NULL,1,'2026-04-11 00:57:54'),(4,1,'Roberto Costa Lima','45678901234','62999994444',NULL,1,'2026-04-11 00:57:54'),(5,2,'Lucia Helena Barbosa','56789012345','62999995555',NULL,1,'2026-04-11 00:57:54'),(6,2,'Pedro Henrique Souza','67890123456','62999996666',NULL,1,'2026-04-11 00:57:54');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissao`
--

DROP TABLE IF EXISTS `permissao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissao` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `chave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permissao_chave` (`chave`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissao`
--

LOCK TABLES `permissao` WRITE;
/*!40000 ALTER TABLE `permissao` DISABLE KEYS */;
INSERT INTO `permissao` VALUES (1,'agendamento.criar','Criar agendamentos'),(2,'agendamento.editar','Editar agendamentos'),(3,'agendamento.cancelar','Cancelar agendamentos'),(4,'paciente.gerenciar','Criar e editar pacientes'),(5,'insumo.gerenciar','Gerenciar insumos e estoque'),(6,'relatorio.visualizar','Ver relatorios'),(7,'usuario.gerenciar','Gerenciar usuarios');
/*!40000 ALTER TABLE `permissao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva_insumo`
--

DROP TABLE IF EXISTS `reserva_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva_insumo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `agendamento_id` int unsigned NOT NULL,
  `insumo_id` int unsigned NOT NULL,
  `quantidade` smallint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reserva_ag_insumo` (`agendamento_id`,`insumo_id`),
  KEY `fk_ri_insumo` (`insumo_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva_insumo`
--

LOCK TABLES `reserva_insumo` WRITE;
/*!40000 ALTER TABLE `reserva_insumo` DISABLE KEYS */;
INSERT INTO `reserva_insumo` VALUES (1,3,1,2),(2,3,3,4),(3,3,7,2),(4,4,3,2),(5,4,5,5);
/*!40000 ALTER TABLE `reserva_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `centro_id` int unsigned NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidade` tinyint unsigned DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_sala_centro` (`centro_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,1,'Sala 01',5,1),(2,1,'Sala 02',5,1),(3,2,'Sala Cardio',8,1),(4,3,'Sala Norte 01',4,1);
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_servico`
--

DROP TABLE IF EXISTS `tipo_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_servico` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracao_minutos` smallint unsigned NOT NULL DEFAULT '60',
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tipo_servico_nome` (`nome`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_servico`
--

LOCK TABLES `tipo_servico` WRITE;
/*!40000 ALTER TABLE `tipo_servico` DISABLE KEYS */;
INSERT INTO `tipo_servico` VALUES (1,'Cirurgia Geral',120,NULL,1),(2,'Cirurgia Cardiaca',240,NULL,1),(3,'Colonoscopia',60,NULL,1),(4,'Ortopedia',150,NULL,1),(5,'Oftalmologia',45,NULL,1);
/*!40000 ALTER TABLE `tipo_servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `filial_id` int unsigned NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crm` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('administrador','medico','enfermeiro','tecnico') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sso_sub` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `fk_usuario_filial` (`filial_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,1,'Dr. Ricardo Alves','ricardo@hospital.com','CRM-GO-12345','medico',NULL,1,'2026-04-11 00:57:54'),(2,1,'Dra. Fernanda Lima','fernanda@hospital.com','CRM-GO-67890','medico',NULL,1,'2026-04-11 00:57:54'),(3,1,'Enf. Carla Souza','carla@hospital.com',NULL,'enfermeiro',NULL,1,'2026-04-11 00:57:54'),(4,1,'Admin Joao Silva','joao@hospital.com',NULL,'administrador',NULL,1,'2026-04-11 00:57:54'),(5,2,'Dr. Paulo Mendes','paulo@clinica.com','CRM-GO-11111','medico',NULL,1,'2026-04-11 00:57:54'),(6,2,'Enf. Ana Rodrigues','ana@clinica.com',NULL,'enfermeiro',NULL,1,'2026-04-11 00:57:54');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_grupo`
--

DROP TABLE IF EXISTS `usuario_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_grupo` (
  `usuario_id` int unsigned NOT NULL,
  `grupo_id` int unsigned NOT NULL,
  PRIMARY KEY (`usuario_id`,`grupo_id`),
  KEY `fk_ug_grupo` (`grupo_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_grupo`
--

LOCK TABLES `usuario_grupo` WRITE;
/*!40000 ALTER TABLE `usuario_grupo` DISABLE KEYS */;
INSERT INTO `usuario_grupo` VALUES (1,1),(2,1),(3,2),(4,3),(5,4),(6,4);
/*!40000 ALTER TABLE `usuario_grupo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 12:27:56
