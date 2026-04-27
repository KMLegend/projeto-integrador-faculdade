from domain.interface_repository import AppointmentRepository
from domain.entities import Appointment
from domain.value_objects import AppointmentKey, AppointmentStatus

class CreateAppointmentUseCase:
    def __init__(self, repository: AppointmentRepository):
        self.repository = repository

    def execute(self, key_str: str, data: dict) -> Appointment:
        key = AppointmentKey.from_string(key_str)
        
        appointment = Appointment(
            id=None,
            key=key,
            service_name=data.get("service"),
            patient_name=data.get("patient"),
            room_name=data.get("room"),
            surgeon_name=data.get("surgeon"),
            status=AppointmentStatus.from_frontend(data.get("status")),
            notes=data.get("notes")
        )
        
        return self.repository.save(appointment)
