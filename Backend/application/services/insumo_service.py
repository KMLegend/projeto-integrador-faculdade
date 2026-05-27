"""
InsumoService — Regras de negocio para o recurso Insumo.
"""
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from infrastructure.models import Insumo
from presentation.schemas import InsumoCreate, InsumoUpdate, InsumoSchema, PaginatedResponse


class InsumoService:
    def __init__(self, db: Session):
        self._db = db

    def listar(self, page: int, page_size: int, nome: Optional[str] = None) -> PaginatedResponse:
        query = self._db.query(Insumo)
        if nome:
            query = query.filter(Insumo.nome.ilike(f"%{nome}%"))
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedResponse(
            items=[InsumoSchema.model_validate(i).model_dump() for i in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=self._calcular_total_paginas(total, page_size),
        )

    def listar_todos(self) -> list[InsumoSchema]:
        return self._db.query(Insumo).all()

    def criar(self, dados: InsumoCreate) -> dict:
        self._verificar_nome_duplicado(dados.nome)
        insumo = Insumo(
            nome=dados.nome,
            categoria_id=dados.categoria_id,
            unidade_medida=dados.unidade_medida,
            quantidade=dados.quantidade,
            ativo=dados.ativo,
        )
        self._db.add(insumo)
        self._db.commit()
        self._db.refresh(insumo)
        return InsumoSchema.model_validate(insumo).model_dump()

    def atualizar(self, insumo_id: int, dados: InsumoUpdate) -> dict:
        insumo = self._buscar_por_id(insumo_id)
        if dados.nome is not None:
            self._verificar_nome_duplicado(dados.nome, excluir_id=insumo_id)
            insumo.nome = dados.nome
        if dados.categoria_id is not None:
            insumo.categoria_id = dados.categoria_id
        if dados.unidade_medida is not None:
            insumo.unidade_medida = dados.unidade_medida
        if dados.quantidade is not None:
            self._validar_quantidade_positiva(dados.quantidade)
            insumo.quantidade = dados.quantidade
        if dados.ativo is not None:
            insumo.ativo = dados.ativo
        self._db.commit()
        return {"status": "success"}

    def remover(self, insumo_id: int) -> dict:
        insumo = self._buscar_por_id(insumo_id)
        self._db.delete(insumo)
        self._db.commit()
        return {"status": "success"}

    def criar_em_lote(self, lista: list[InsumoCreate]) -> dict:
        novos = [
            Insumo(
                nome=i.nome,
                categoria_id=i.categoria_id,
                unidade_medida=i.unidade_medida,
                quantidade=i.quantidade,
                ativo=i.ativo,
            )
            for i in lista
        ]
        self._db.add_all(novos)
        self._db.commit()
        return {"status": "success", "inserted": len(novos)}

    # ── Metodos privados de validacao ──

    def _buscar_por_id(self, insumo_id: int) -> Insumo:
        insumo = self._db.query(Insumo).filter(Insumo.id == insumo_id).first()
        if not insumo:
            raise HTTPException(status_code=404, detail="Insumo nao encontrado")
        return insumo

    def _verificar_nome_duplicado(self, nome: str, excluir_id: int = None) -> None:
        query = self._db.query(Insumo).filter(Insumo.nome == nome)
        if excluir_id is not None:
            query = query.filter(Insumo.id != excluir_id)
        if query.first():
            raise HTTPException(status_code=400, detail="Ja existe um insumo com este nome")

    @staticmethod
    def _validar_quantidade_positiva(quantidade: int) -> None:
        if quantidade < 0:
            raise HTTPException(status_code=400, detail="Quantidade nao pode ser negativa")

    @staticmethod
    def _calcular_total_paginas(total: int, page_size: int) -> int:
        return (total + page_size - 1) // page_size
