from domain.interface_repository import AppointmentRepository
from domain.value_objects import AppointmentKey, AppointmentStatus

class UpdateAppointmentStatusUseCase:
    def __init__(self, repository: AppointmentRepository):
        self.repository = repository

    def execute(self, key_str: str, status_color: str):
        key = AppointmentKey.from_string(key_str)
        appointment = self.repository.get_by_key(key.date.value, key.time.value)
        
        if not appointment:
            raise ValueError(f"Appointment not found for key {key_str}")
        
        # Object Calisthenics: Encapsulated logic, no else
        new_status = AppointmentStatus.from_frontend(status_color)
        appointment.update_status(new_status)
        
        # Re-save updated entity
        return self.repository.save(appointment)
