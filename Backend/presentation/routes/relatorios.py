"""
Rotas de Relatorios — apenas orquestracao HTTP.
"""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
from presentation.schemas import RelatorioResponse
from application.services.relatorio_service import RelatorioService

router = APIRouter(
    prefix="/relatorios",
    tags=["relatorios"],
    dependencies=[Depends(get_current_user)],
)


def get_service(db: Session = Depends(get_db)) -> RelatorioService:
    return RelatorioService(db)


@router.get("", response_model=RelatorioResponse)
def obter_relatorio(
    data_inicio: Optional[date] = Query(None, description="Filtrar a partir desta data (YYYY-MM-DD)"),
    data_fim: Optional[date] = Query(None, description="Filtrar ate esta data (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Status: agendado, confirmado, realizado, cancelado, no_show"),
    medico_id: Optional[int] = Query(None, description="Filtrar por ID do medico"),
    service: RelatorioService = Depends(get_service),
):
    """
    Dashboard com cards de resumo (totais globais) + listagem detalhada com filtros.
    Atende a Etapa 10 do Roteiro: relatorio com filtros por periodo, status e medico.
    """
    return service.gerar(data_inicio, data_fim, status, medico_id)
