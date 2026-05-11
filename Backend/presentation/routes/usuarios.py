"""
Rotas de Usuarios — apenas orquestracao HTTP.
Gerenciamento de usuarios e restrito a administradores.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user, require_admin
from infrastructure.models import Usuario
from presentation.schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse, PaginatedResponse
from application.services.usuario_service import UsuarioService

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(get_current_user)],
)


def get_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioService(db)


@router.get("", response_model=PaginatedResponse)
def listar_usuarios(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    service: UsuarioService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.listar(page, page_size)


@router.get("/all", response_model=List[UsuarioResponse])
def listar_todos_usuarios(
    service: UsuarioService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    """Retorna todos os usuarios ativos sem paginacao (para selects)."""
    return service.listar_ativos()


@router.get("/medicos", response_model=List[UsuarioResponse])
def listar_medicos(service: UsuarioService = Depends(get_service)):
    """Lista medicos ativos — disponivel a qualquer usuario autenticado para preenchimento de formularios."""
    return service.listar_medicos()


@router.post("", response_model=UsuarioResponse, status_code=201)
def criar_usuario(
    dados: UsuarioCreate,
    service: UsuarioService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.criar(dados)


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: int,
    dados: UsuarioUpdate,
    service: UsuarioService = Depends(get_service),
    _: Usuario = Depends(require_admin),
):
    return service.atualizar(usuario_id, dados)


@router.delete("/{usuario_id}")
def desativar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_service),
    current_user: Usuario = Depends(require_admin),
):
    return service.desativar(usuario_id, solicitante_id=current_user.id)
