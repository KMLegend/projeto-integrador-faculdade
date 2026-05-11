from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Generic, TypeVar
from datetime import datetime

# ─────────────────────────────────────────────
# Agendamentos
# ─────────────────────────────────────────────

class AppointmentData(BaseModel):
    service: str
    patient: str
    room: str
    surgeon: str
    status: str
    notes: Optional[str] = ""

class AppointmentCreateRequest(BaseModel):
    key: str
    data: AppointmentData

class StatusUpdateRequest(BaseModel):
    status: str

class AppointmentResponse(BaseModel):
    id: Optional[int] = None
    key: str
    data: AppointmentData

# ─────────────────────────────────────────────
# Paginação genérica
# ─────────────────────────────────────────────

T = TypeVar("T")

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int

# ─────────────────────────────────────────────
# Salas
# ─────────────────────────────────────────────

class SalaCreate(BaseModel):
    nome: str
    capacidade: Optional[int] = None
    ativo: Optional[bool] = True

class SalaUpdate(BaseModel):
    nome: Optional[str] = None
    capacidade: Optional[int] = None
    ativo: Optional[bool] = None

class SalaSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    capacidade: Optional[int] = None
    ativo: Optional[bool] = True

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────
# Pacientes
# ─────────────────────────────────────────────

class PacienteCreate(BaseModel):
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, v):
        if v is not None:
            digits = "".join(c for c in v if c.isdigit())
            if len(digits) != 11:
                raise ValueError("CPF deve conter 11 dígitos numéricos")
        return v

class PacienteUpdate(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

class PacienteSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────
# Insumos
# ─────────────────────────────────────────────

class InsumoCreate(BaseModel):
    nome: str
    categoria_id: int
    unidade_medida: str = "unidade"
    quantidade: int = 0
    ativo: Optional[bool] = True

class InsumoUpdate(BaseModel):
    nome: Optional[str] = None
    categoria_id: Optional[int] = None
    unidade_medida: Optional[str] = None
    quantidade: Optional[int] = None
    ativo: Optional[bool] = None

class InsumoSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    categoria_id: int
    unidade_medida: str = "unidade"
    quantidade: int = 0
    ativo: Optional[bool] = True

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────
# Autenticação
# ─────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_type: str

# ─────────────────────────────────────────────
# Filiais
# ─────────────────────────────────────────────

class FilialResponse(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────
# Usuários
# ─────────────────────────────────────────────

TIPOS_USUARIO = ("administrador", "medico", "enfermeiro", "tecnico")

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    tipo: str
    crm: Optional[str] = None
    filial_id: int
    ativo: bool

    class Config:
        from_attributes = True

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    password: str
    tipo: str
    crm: Optional[str] = None
    filial_id: int

    @field_validator("tipo")
    @classmethod
    def validate_tipo(cls, v):
        if v not in TIPOS_USUARIO:
            raise ValueError(f"Tipo inválido. Valores aceitos: {', '.join(TIPOS_USUARIO)}")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("A senha deve ter pelo menos 6 caracteres")
        return v

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    tipo: Optional[str] = None
    crm: Optional[str] = None
    filial_id: Optional[int] = None
    ativo: Optional[bool] = None

# ─────────────────────────────────────────────
# Relatórios
# ─────────────────────────────────────────────

class AgendamentoResumo(BaseModel):
    id: int
    paciente: str
    medico: str
    sala: str
    servico: str
    inicio: datetime
    status: str

    class Config:
        from_attributes = True

class RelatorioResponse(BaseModel):
    total_cirurgias: int
    realizadas: int
    canceladas: int
    agendadas: int
    confirmadas: int
    no_show: int
    total_pacientes: int
    total_salas: int
    agendamentos: List[AgendamentoResumo] = []
