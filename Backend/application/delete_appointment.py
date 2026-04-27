from domain.interface_repository import AppointmentRepository
from domain.value_objects import AppointmentKey

class DeleteAppointmentUseCase:
    def __init__(self, repository: AppointmentRepository):
        self.repository = repository

    def execute(self, key_str: str):
        key = AppointmentKey.from_string(key_str)
        appointment = self.repository.get_by_key(key.date.value, key.time.value)
        
        if not appointment:
             raise ValueError(f"Appointment not found for key {key_str}")
             
        if appointment.id:
            self.repository.delete(appointment.id)
