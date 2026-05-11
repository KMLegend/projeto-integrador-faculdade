"""
RelatorioService — Regras de negocio para geracao de relatorios.
"""
from datetime import datetime, date
from typing import Optional
from sqlalchemy.orm import Session, joinedload

from infrastructure.models import Agendamento, Paciente, Sala
from presentation.schemas import RelatorioResponse, AgendamentoResumo


class RelatorioService:
    def __init__(self, db: Session):
        self._db = db

    def gerar(
        self,
        data_inicio: Optional[date],
        data_fim: Optional[date],
        status_filtro: Optional[str],
        medico_id: Optional[int],
    ) -> RelatorioResponse:
        totais = self._calcular_totais()
        agendamentos = self._buscar_agendamentos_filtrados(
            data_inicio, data_fim, status_filtro, medico_id
        )
        return RelatorioResponse(
            **totais,
            agendamentos=agendamentos,
        )

    # ── Metodos privados ──

    def _calcular_totais(self) -> dict:
        query = self._db.query(Agendamento)
        return {
            "total_cirurgias": query.count(),
            "realizadas": query.filter(Agendamento.status == "realizado").count(),
            "canceladas": query.filter(Agendamento.status == "cancelado").count(),
            "agendadas": query.filter(Agendamento.status == "agendado").count(),
            "confirmadas": query.filter(Agendamento.status == "confirmado").count(),
            "no_show": query.filter(Agendamento.status == "no_show").count(),
            "total_pacientes": self._db.query(Paciente).count(),
            "total_salas": self._db.query(Sala).count(),
        }

    def _buscar_agendamentos_filtrados(
        self,
        data_inicio: Optional[date],
        data_fim: Optional[date],
        status_filtro: Optional[str],
        medico_id: Optional[int],
    ) -> list[AgendamentoResumo]:
        query = self._db.query(Agendamento).options(
            joinedload(Agendamento.paciente),
            joinedload(Agendamento.medico),
            joinedload(Agendamento.sala),
            joinedload(Agendamento.tipo_servico),
        )
        query = self._aplicar_filtro_data_inicio(query, data_inicio)
        query = self._aplicar_filtro_data_fim(query, data_fim)
        query = self._aplicar_filtro_status(query, status_filtro)
        query = self._aplicar_filtro_medico(query, medico_id)

        agendamentos = query.order_by(Agendamento.inicio.desc()).limit(100).all()
        return [self._para_resumo(a) for a in agendamentos]

    @staticmethod
    def _aplicar_filtro_data_inicio(query, data_inicio: Optional[date]):
        if not data_inicio:
            return query
        return query.filter(
            Agendamento.inicio >= datetime.combine(data_inicio, datetime.min.time())
        )

    @staticmethod
    def _aplicar_filtro_data_fim(query, data_fim: Optional[date]):
        if not data_fim:
            return query
        return query.filter(
            Agendamento.inicio <= datetime.combine(data_fim, datetime.max.time())
        )

    @staticmethod
    def _aplicar_filtro_status(query, status_filtro: Optional[str]):
        if not status_filtro:
            return query
        return query.filter(Agendamento.status == status_filtro)

    @staticmethod
    def _aplicar_filtro_medico(query, medico_id: Optional[int]):
        if not medico_id:
            return query
        return query.filter(Agendamento.medico_id == medico_id)

    @staticmethod
    def _para_resumo(agendamento: Agendamento) -> AgendamentoResumo:
        return AgendamentoResumo(
            id=agendamento.id,
            paciente=agendamento.paciente.nome if agendamento.paciente else "-",
            medico=agendamento.medico.nome if agendamento.medico else "-",
            sala=agendamento.sala.nome if agendamento.sala else "-",
            servico=agendamento.tipo_servico.nome if agendamento.tipo_servico else "-",
            inicio=agendamento.inicio,
            status=agendamento.status,
        )
