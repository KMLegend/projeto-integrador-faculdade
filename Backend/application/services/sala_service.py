"""
SalaService — Regras de negocio para o recurso Sala.

Responsabilidade unica (SRP): centraliza toda logica de negocio
relacionada a salas, mantendo as rotas como simples orquestradores HTTP.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from infrastructure.models import Sala, Agendamento
from presentation.schemas import SalaCreate, SalaUpdate, SalaSchema, PaginatedResponse


class SalaService:
    def __init__(self, db: Session):
        self._db = db

    def listar(self, page: int, page_size: int) -> PaginatedResponse:
        query = self._db.query(Sala)
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedResponse(
            items=[SalaSchema.model_validate(s).model_dump() for s in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=self._calcular_total_paginas(total, page_size),
        )

    def listar_todas(self) -> list[SalaSchema]:
        return self._db.query(Sala).all()

    def criar(self, dados: SalaCreate) -> dict:
        self._verificar_nome_duplicado(dados.nome)
        sala = Sala(
            nome=dados.nome,
            capacidade=dados.capacidade,
            ativo=dados.ativo,
            centro_id=1,
        )
        self._db.add(sala)
        self._db.commit()
        return {"status": "success", "message": "Sala criada com sucesso"}

    def atualizar(self, sala_id: int, dados: SalaUpdate) -> dict:
        sala = self._buscar_por_id(sala_id)
        if dados.nome is not None:
            self._verificar_nome_duplicado(dados.nome, excluir_id=sala_id)
            sala.nome = dados.nome
        if dados.capacidade is not None:
            sala.capacidade = dados.capacidade
        if dados.ativo is not None:
            sala.ativo = dados.ativo
        self._db.commit()
        return {"status": "success"}

    def remover(self, sala_id: int) -> dict:
        sala = self._buscar_por_id(sala_id)
        self._verificar_agendamentos_futuros(sala_id)
        self._db.delete(sala)
        self._db.commit()
        return {"status": "success"}

    def criar_em_lote(self, lista: list[SalaCreate]) -> dict:
        novas = [
            Sala(nome=s.nome, capacidade=s.capacidade, ativo=s.ativo, centro_id=1)
            for s in lista
        ]
        self._db.add_all(novas)
        self._db.commit()
        return {"status": "success", "inserted": len(novas)}

    # ── Metodos privados de validacao ──

    def _buscar_por_id(self, sala_id: int) -> Sala:
        sala = self._db.query(Sala).filter(Sala.id == sala_id).first()
        if not sala:
            raise HTTPException(status_code=404, detail="Sala nao encontrada")
        return sala

    def _verificar_nome_duplicado(self, nome: str, excluir_id: int = None) -> None:
        query = self._db.query(Sala).filter(Sala.nome == nome)
        if excluir_id is not None:
            query = query.filter(Sala.id != excluir_id)
        if query.first():
            raise HTTPException(status_code=400, detail="Ja existe uma sala com este nome")

    def _verificar_agendamentos_futuros(self, sala_id: int) -> None:
        futuros = self._db.query(Agendamento).filter(
            Agendamento.sala_id == sala_id,
            Agendamento.inicio >= datetime.utcnow(),
            Agendamento.status.notin_(["cancelado"]),
        ).count()
        if futuros > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Sala possui {futuros} agendamento(s) futuro(s). Cancele-os antes de remover.",
            )

    @staticmethod
    def _calcular_total_paginas(total: int, page_size: int) -> int:
        return (total + page_size - 1) // page_size
