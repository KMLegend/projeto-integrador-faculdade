from typing import Dict
from domain.interface_repository import AppointmentRepository

class GetAppointmentsUseCase:
    def __init__(self, repository: AppointmentRepository):
        self.repository = repository

    def execute(self) -> Dict:
        appointments = self.repository.get_all()
        # Transform to frontend structure: {key: {details}}
        result = {}
        for appt in appointments:
            result[appt.key.value] = {
                "service": appt.service_name,
                "patient": appt.patient_name,
                "room": appt.room_name,
                "surgeon": appt.surgeon_name,
                "status": appt.status.to_frontend(),
                "notes": appt.notes or ""
            }
        return result
