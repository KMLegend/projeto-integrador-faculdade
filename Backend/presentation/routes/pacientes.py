"""
Rotas de Pacientes — apenas orquestracao HTTP.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user, require_admin
from infrastructure.models import Usuario
from presentation.schemas import PacienteCreate, PacienteUpdate, PacienteSchema, PaginatedResponse
from application.services.paciente_service import PacienteService

router = APIRouter(
    prefix="/pacientes",
    tags=["pacientes"],
    dependencies=[Depends(get_current_user)],
)


def get_service(db: Session = Depends(get_db)) -> PacienteService:
    return PacienteService(db)


@router.get("", response_model=PaginatedResponse)
def listar_pacientes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nome: Optional[str] = Query(None),
    service: PacienteService = Depends(get_service),
):
    return service.listar(page, page_size, nome)


@router.get("/all", response_model=List[PacienteSchema])
def listar_todos_pacientes(service: PacienteService = Depends(get_service)):
    """Retorna todos os pacientes sem paginacao (para selects)."""
    return service.listar_todos()


@router.post("", status_code=201)
def criar_paciente(
    dados: PacienteCreate,
    service: PacienteService = Depends(get_service),
):
    return service.criar(dados)


@router.put("/{paciente_id}")
def atualizar_paciente(
    paciente_id: int,
    dados: PacienteUpdate,
    service: PacienteService = Depends(get_service),
):
    return service.atualizar(paciente_id, dados)


@router.delete("/{paciente_id}")
def remover_paciente(
    paciente_id: int,
    service: PacienteService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.remover(paciente_id)


@router.post("/bulk", status_code=201)
def criar_pacientes_em_lote(
    lista: List[PacienteCreate],
    service: PacienteService = Depends(get_service),
):
    return service.criar_em_lote(lista)
