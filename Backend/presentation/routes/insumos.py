"""
Rotas de Insumos — apenas orquestracao HTTP.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user, require_admin
from infrastructure.models import Usuario
from presentation.schemas import InsumoCreate, InsumoUpdate, InsumoSchema, PaginatedResponse
from application.services.insumo_service import InsumoService

router = APIRouter(
    prefix="/insumos",
    tags=["insumos"],
    dependencies=[Depends(get_current_user)],
)


def get_service(db: Session = Depends(get_db)) -> InsumoService:
    return InsumoService(db)


@router.get("", response_model=PaginatedResponse)
def listar_insumos(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nome: Optional[str] = Query(None),
    service: InsumoService = Depends(get_service),
):
    return service.listar(page, page_size, nome)


@router.get("/all", response_model=List[InsumoSchema])
def listar_todos_insumos(service: InsumoService = Depends(get_service)):
    """Retorna todos os insumos sem paginacao (para selects)."""
    return service.listar_todos()


@router.post("", status_code=201)
def criar_insumo(
    dados: InsumoCreate,
    service: InsumoService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.criar(dados)


@router.put("/{insumo_id}")
def atualizar_insumo(
    insumo_id: int,
    dados: InsumoUpdate,
    service: InsumoService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.atualizar(insumo_id, dados)


@router.delete("/{insumo_id}")
def remover_insumo(
    insumo_id: int,
    service: InsumoService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.remover(insumo_id)


@router.post("/bulk", status_code=201)
def criar_insumos_em_lote(
    lista: List[InsumoCreate],
    service: InsumoService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.criar_em_lote(lista)
