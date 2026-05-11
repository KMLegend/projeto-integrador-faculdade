"""
Rotas de Agendamentos — apenas orquestracao HTTP.
A logica de dominio esta nos Use Cases e no SQLAppointmentRepository.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
from infrastructure.sql_repository import SQLAppointmentRepository
from application.get_appointments import GetAppointmentsUseCase
from application.create_appointment import CreateAppointmentUseCase
from application.update_appointment import UpdateAppointmentStatusUseCase
from application.delete_appointment import DeleteAppointmentUseCase
from presentation.schemas import AppointmentCreateRequest, StatusUpdateRequest

router = APIRouter(
    prefix="/appointments",
    tags=["agendamentos"],
    dependencies=[Depends(get_current_user)],
)


def get_repository(db: Session = Depends(get_db)) -> SQLAppointmentRepository:
    return SQLAppointmentRepository(db)


@router.get("")
def listar_agendamentos(repo: SQLAppointmentRepository = Depends(get_repository)):
    """
    Retorna todos os agendamentos indexados por chave (data_hora),
    compativel com o componente CalendarGrid do frontend.
    """
    use_case = GetAppointmentsUseCase(repo)
    try:
        return use_case.execute()
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar agendamentos: {exc}")


@router.post("", status_code=201)
def criar_agendamento(
    request: AppointmentCreateRequest,
    repo: SQLAppointmentRepository = Depends(get_repository),
):
    use_case = CreateAppointmentUseCase(repo)
    try:
        use_case.execute(request.key, request.data.model_dump())
        return {"status": "success"}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{key}/status")
def atualizar_status(
    key: str,
    request: StatusUpdateRequest,
    repo: SQLAppointmentRepository = Depends(get_repository),
):
    use_case = UpdateAppointmentStatusUseCase(repo)
    try:
        use_case.execute(key, request.status)
        return {"status": "success"}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{key}")
def remover_agendamento(
    key: str,
    repo: SQLAppointmentRepository = Depends(get_repository),
):
    use_case = DeleteAppointmentUseCase(repo)
    try:
        use_case.execute(key)
        return {"status": "success"}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
