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
