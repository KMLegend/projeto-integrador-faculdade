from dataclasses import dataclass
from typing import Optional
from .value_objects import AppointmentStatus, AppointmentKey

@dataclass
class Appointment:
    id: Optional[int]
    key: AppointmentKey
    service_name: str
    patient_name: str
    room_name: str
    surgeon_name: str
    status: AppointmentStatus
    notes: Optional[str]

    def update_status(self, new_status: AppointmentStatus):
        self.status = new_status
