"""
UsuarioService — Regras de negocio para o recurso Usuario.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException

from infrastructure.models import Usuario
from presentation.schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse, PaginatedResponse
from core.security import get_password_hash

TIPOS_VALIDOS = frozenset({"administrador", "medico", "enfermeiro", "tecnico"})


class UsuarioService:
    def __init__(self, db: Session):
        self._db = db

    def listar(self, page: int, page_size: int) -> PaginatedResponse:
        query = self._db.query(Usuario)
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedResponse(
            items=[UsuarioResponse.model_validate(u).model_dump() for u in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=self._calcular_total_paginas(total, page_size),
        )

    def listar_ativos(self) -> list[UsuarioResponse]:
        return self._db.query(Usuario).filter(Usuario.ativo == True).all()

    def listar_medicos(self) -> list[UsuarioResponse]:
        return self._db.query(Usuario).filter(
            Usuario.tipo == "medico", Usuario.ativo == True
        ).all()

    def criar(self, dados: UsuarioCreate) -> Usuario:
        self._verificar_email_duplicado(dados.email)
        self._validar_tipo(dados.tipo)
        usuario = Usuario(
            nome=dados.nome,
            email=dados.email,
            senha_hash=get_password_hash(dados.password),
            tipo=dados.tipo,
            crm=dados.crm,
            filial_id=dados.filial_id,
            ativo=True,
        )
        self._db.add(usuario)
        self._db.commit()
        self._db.refresh(usuario)
        return usuario

    def atualizar(self, usuario_id: int, dados: UsuarioUpdate) -> Usuario:
        usuario = self._buscar_por_id(usuario_id)
        if dados.email is not None:
            self._verificar_email_duplicado(dados.email, excluir_id=usuario_id)
            usuario.email = dados.email
        if dados.nome is not None:
            usuario.nome = dados.nome
        if dados.password is not None:
            usuario.senha_hash = get_password_hash(dados.password)
        if dados.tipo is not None:
            self._validar_tipo(dados.tipo)
            usuario.tipo = dados.tipo
        if dados.crm is not None:
            usuario.crm = dados.crm
        if dados.filial_id is not None:
            usuario.filial_id = dados.filial_id
        if dados.ativo is not None:
            usuario.ativo = dados.ativo
        self._db.commit()
        self._db.refresh(usuario)
        return usuario

    def desativar(self, usuario_id: int, solicitante_id: int) -> dict:
        usuario = self._buscar_por_id(usuario_id)
        self._verificar_auto_desativacao(usuario_id, solicitante_id)
        usuario.ativo = False
        self._db.commit()
        return {"status": "success", "message": f"Usuario '{usuario.nome}' desativado"}

    # ── Metodos privados de validacao ──

    def _buscar_por_id(self, usuario_id: int) -> Usuario:
        usuario = self._db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        return usuario

    def _verificar_email_duplicado(self, email: str, excluir_id: int = None) -> None:
        query = self._db.query(Usuario).filter(Usuario.email == email)
        if excluir_id is not None:
            query = query.filter(Usuario.id != excluir_id)
        if query.first():
            raise HTTPException(status_code=400, detail="E-mail ja cadastrado")

    @staticmethod
    def _validar_tipo(tipo: str) -> None:
        if tipo not in TIPOS_VALIDOS:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo invalido. Valores aceitos: {', '.join(sorted(TIPOS_VALIDOS))}",
            )

    @staticmethod
    def _verificar_auto_desativacao(usuario_id: int, solicitante_id: int) -> None:
        if usuario_id == solicitante_id:
            raise HTTPException(
                status_code=400, detail="Voce nao pode desativar sua propria conta"
            )

    @staticmethod
    def _calcular_total_paginas(total: int, page_size: int) -> int:
        return (total + page_size - 1) // page_size
