import pytest
from unittest.mock import MagicMock
from domain.entities import Appointment
from domain.value_objects import AppointmentKey, AppointmentDate, AppointmentTime, AppointmentStatus
from application.get_appointments import GetAppointmentsUseCase
from application.create_appointment import CreateAppointmentUseCase

def test_get_appointments_format():
    mock_repo = MagicMock()
    mock_appt = Appointment(
        id=1,
        key=AppointmentKey(AppointmentDate("2025-08-04"), AppointmentTime("09:00")),
        service_name="Cirurgia Geral",
        patient_name="Teresa",
        room_name="Sala 01",
        surgeon_name="Dra. Ana",
        status=AppointmentStatus.CONFIRMADO,
        notes="Notes"
    )
    mock_repo.get_all.return_value = [mock_appt]
    
    use_case = GetAppointmentsUseCase(mock_repo)
    result = use_case.execute()
    
    assert "2025-08-04_09:00" in result
    assert result["2025-08-04_09:00"]["service"] == "Cirurgia Geral"
    assert result["2025-08-04_09:00"]["status"] == "green"

def test_create_appointment_logic():
    mock_repo = MagicMock()
    use_case = CreateAppointmentUseCase(mock_repo)
    
    key_str = "2025-08-05_10:00"
    data = {
        "service": "Ortopedia",
        "patient": "João",
        "room": "Sala 02",
        "surgeon": "Dr. Carlos",
        "status": "green",
        "notes": "Test"
    }
    
    use_case.execute(key_str, data)
    
    # Verify repository save was called with correct entity
    args, _ = mock_repo.save.call_args
    appt = args[0]
    assert appt.key.date.value == "2025-08-05"
    assert appt.key.time.value == "10:00"
    assert appt.service_name == "Ortopedia"
