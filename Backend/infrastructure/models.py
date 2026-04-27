from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base


class Paciente(Base):
    __tablename__ = "paciente"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    filial_id = Column(Integer, nullable=False, default=1)
    cpf = Column(String(14))
    telefone = Column(String(20))

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    tipo = Column(Enum('administrador', 'medico', 'enfermeiro', 'tecnico'))

class Sala(Base):
    __tablename__ = "sala"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    centro_id = Column(Integer, nullable=False, default=1)
    capacidade = Column(Integer, default=0)
    ativo = Column(Integer, default=1)

class TipoServico(Base):
    __tablename__ = "tipo_servico"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)

class Agendamento(Base):
    __tablename__ = "agendamento"
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("paciente.id"), nullable=False)
    medico_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    sala_id = Column(Integer, ForeignKey("sala.id"), nullable=False)
    tipo_servico_id = Column(Integer, ForeignKey("tipo_servico.id"), nullable=False)
    inicio = Column(DateTime, nullable=False)
    fim = Column(DateTime, nullable=False)
    status = Column(Enum('agendado', 'confirmado', 'realizado', 'cancelado', 'no_show'), nullable=False, default='agendado')
    observacoes = Column(Text)
    
    paciente = relationship("Paciente")
    medico = relationship("Usuario")
    sala = relationship("Sala")
    tipo_servico = relationship("TipoServico")

class CategoriaInsumo(Base):
    __tablename__ = "categoria_insumo"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text)

class Insumo(Base):
    __tablename__ = "insumo"
    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categoria_insumo.id"), nullable=False)
    nome = Column(String(150), nullable=False, unique=True)
    unidade_medida = Column(String(30), nullable=False, default='unidade')
    quantidade = Column(Integer, default=0)
    ativo = Column(Integer, default=1)
    
    categoria = relationship("CategoriaInsumo")

class EstoqueSala(Base):
    __tablename__ = "estoque_sala"
    sala_id = Column(Integer, ForeignKey("sala.id"), primary_key=True)
    insumo_id = Column(Integer, ForeignKey("insumo.id"), primary_key=True)
    quantidade_disponivel = Column(Integer, nullable=False, default=0)
    atualizado_em = Column(DateTime)
    
    sala = relationship("Sala")
    insumo = relationship("Insumo")
