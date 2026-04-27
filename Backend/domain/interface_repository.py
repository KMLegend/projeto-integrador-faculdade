from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import Appointment

class AppointmentRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Appointment]:
        pass

    @abstractmethod
    def get_by_key(self, date: str, time: str) -> Optional[Appointment]:
        pass

    @abstractmethod
    def save(self, appointment: Appointment) -> Appointment:
        pass

    @abstractmethod
    def delete(self, appointment_id: int) -> None:
        pass

    @abstractmethod
    def resolve_ids(self, service: str, patient: str, room: str, surgeon: str) -> dict:
        """Resolves names to IDs for DB insertion"""
        pass
