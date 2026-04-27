from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from infrastructure.sql_repository import SQLAppointmentRepository
from application.get_appointments import GetAppointmentsUseCase
from application.create_appointment import CreateAppointmentUseCase
from application.update_appointment import UpdateAppointmentStatusUseCase
from application.delete_appointment import DeleteAppointmentUseCase
from .schemas import AppointmentCreateRequest, StatusUpdateRequest

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

def get_repository(db: Session = Depends(get_db)):
    return SQLAppointmentRepository(db)

@router.get("")
def get_all(repo: SQLAppointmentRepository = Depends(get_repository)):
    use_case = GetAppointmentsUseCase(repo)
    try:
        return use_case.execute()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database or Logic Error: {str(e)}")

@router.post("")
def create(request: AppointmentCreateRequest, repo: SQLAppointmentRepository = Depends(get_repository)):
    use_case = CreateAppointmentUseCase(repo)
    try:
        use_case.execute(request.key, request.data.model_dump())
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{key}/status")
def update_status(key: str, request: StatusUpdateRequest, repo: SQLAppointmentRepository = Depends(get_repository)):
    use_case = UpdateAppointmentStatusUseCase(repo)
    try:
        use_case.execute(key, request.status)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{key}")
def delete(key: str, repo: SQLAppointmentRepository = Depends(get_repository)):
    use_case = DeleteAppointmentUseCase(repo)
    try:
        use_case.execute(key)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
