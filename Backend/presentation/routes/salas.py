"""
Rotas de Salas — apenas orquestracao HTTP.
Toda regra de negocio esta em SalaService.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user, require_admin
from infrastructure.models import Usuario
from presentation.schemas import SalaCreate, SalaUpdate, SalaSchema, PaginatedResponse
from application.services.sala_service import SalaService

router = APIRouter(
    prefix="/salas",
    tags=["salas"],
    dependencies=[Depends(get_current_user)],
)


def get_service(db: Session = Depends(get_db)) -> SalaService:
    return SalaService(db)


@router.get("", response_model=PaginatedResponse)
def listar_salas(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    service: SalaService = Depends(get_service),
):
    return service.listar(page, page_size)


@router.get("/all", response_model=List[SalaSchema])
def listar_todas_salas(service: SalaService = Depends(get_service)):
    """Retorna todas as salas sem paginacao (para preenchimento de selects)."""
    return service.listar_todas()


@router.post("", status_code=201)
def criar_sala(
    dados: SalaCreate,
    service: SalaService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.criar(dados)


@router.put("/{sala_id}")
def atualizar_sala(
    sala_id: int,
    dados: SalaUpdate,
    service: SalaService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.atualizar(sala_id, dados)


@router.delete("/{sala_id}")
def remover_sala(
    sala_id: int,
    service: SalaService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.remover(sala_id)


@router.post("/bulk", status_code=201)
def criar_salas_em_lote(
    lista: List[SalaCreate],
    service: SalaService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.criar_em_lote(lista)
