"""
PacienteService — Regras de negocio para o recurso Paciente.
"""
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from infrastructure.models import Paciente, Agendamento
from presentation.schemas import PacienteCreate, PacienteUpdate, PacienteSchema, PaginatedResponse


class PacienteService:
    def __init__(self, db: Session):
        self._db = db

    def listar(self, page: int, page_size: int, nome: Optional[str] = None) -> PaginatedResponse:
        query = self._db.query(Paciente)
        if nome:
            query = query.filter(Paciente.nome.ilike(f"%{nome}%"))
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedResponse(
            items=[PacienteSchema.model_validate(p).model_dump() for p in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=self._calcular_total_paginas(total, page_size),
        )

    def listar_todos(self) -> list[PacienteSchema]:
        return self._db.query(Paciente).all()

    def criar(self, dados: PacienteCreate) -> dict:
        self._verificar_cpf_duplicado(dados.cpf)
        paciente = Paciente(
            nome=dados.nome,
            cpf=dados.cpf,
            telefone=dados.telefone,
            filial_id=1,
        )
        self._db.add(paciente)
        self._db.commit()
        return {"status": "success"}

    def atualizar(self, paciente_id: int, dados: PacienteUpdate) -> dict:
        paciente = self._buscar_por_id(paciente_id)
        if dados.cpf and dados.cpf != paciente.cpf:
            self._verificar_cpf_duplicado(dados.cpf, excluir_id=paciente_id)
        if dados.nome is not None:
            paciente.nome = dados.nome
        if dados.cpf is not None:
            paciente.cpf = dados.cpf
        if dados.telefone is not None:
            paciente.telefone = dados.telefone
        self._db.commit()
        return {"status": "success"}

    def remover(self, paciente_id: int) -> dict:
        paciente = self._buscar_por_id(paciente_id)
        self._verificar_sem_historico(paciente_id)
        self._db.delete(paciente)
        self._db.commit()
        return {"status": "success"}

    def criar_em_lote(self, lista: list[PacienteCreate]) -> dict:
        novos = [
            Paciente(nome=p.nome, cpf=p.cpf, telefone=p.telefone, filial_id=1)
            for p in lista
        ]
        self._db.add_all(novos)
        self._db.commit()
        return {"status": "success", "inserted": len(novos)}

    # ── Metodos privados de validacao ──

    def _buscar_por_id(self, paciente_id: int) -> Paciente:
        paciente = self._db.query(Paciente).filter(Paciente.id == paciente_id).first()
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente nao encontrado")
        return paciente

    def _verificar_cpf_duplicado(self, cpf: Optional[str], excluir_id: int = None) -> None:
        if not cpf:
            return
        query = self._db.query(Paciente).filter(Paciente.cpf == cpf)
        if excluir_id is not None:
            query = query.filter(Paciente.id != excluir_id)
        if query.first():
            raise HTTPException(status_code=400, detail="CPF ja cadastrado para outro paciente")

    def _verificar_sem_historico(self, paciente_id: int) -> None:
        tem_historico = self._db.query(Agendamento).filter(
            Agendamento.paciente_id == paciente_id
        ).count()
        if tem_historico:
            raise HTTPException(
                status_code=400,
                detail="Paciente possui historico de agendamentos e nao pode ser excluido",
            )

    @staticmethod
    def _calcular_total_paginas(total: int, page_size: int) -> int:
        return (total + page_size - 1) // page_size
