from pydantic import BaseModel
from typing import Optional, Dict

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

class SalaSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    capacidade: Optional[int] = None
    ativo: Optional[bool] = True
    
    class Config:
        from_attributes = True

class PacienteSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

class InsumoSchema(BaseModel):
    id: Optional[int] = None
    nome: str
    categoria_id: int
    unidade_medida: str = "unidade"
    quantidade: int = 0
    ativo: Optional[bool] = True
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_type: str

class FilialResponse(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True

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

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    tipo: Optional[str] = None
    crm: Optional[str] = None
    filial_id: Optional[int] = None
    ativo: Optional[bool] = None
