from enum import Enum
from dataclasses import dataclass

class AppointmentStatus(Enum):
    AGENDADO = "agendado"
    CONFIRMADO = "confirmado"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"
    NO_SHOW = "no_show"

    @classmethod
    def from_frontend(cls, color: str) -> "AppointmentStatus":
        mapping = {
            "green": cls.CONFIRMADO,
            "yellow": cls.AGENDADO,
            "blue": cls.REALIZADO,
            "gray": cls.CANCELADO
        }
        return mapping.get(color, cls.AGENDADO)

    def to_frontend(self) -> str:
        mapping = {
            self.CONFIRMADO: "green",
            self.AGENDADO: "yellow",
            self.REALIZADO: "blue",
            self.CANCELADO: "gray",
            self.NO_SHOW: "gray"
        }
        return mapping.get(self, "yellow")

@dataclass(frozen=True)
class AppointmentTime:
    value: str # Expected format "HH:mm"

    def __post_init__(self):
        if ":" not in self.value:
            raise ValueError("Invalid time format")

@dataclass(frozen=True)
class AppointmentDate:
    value: str # Expected format "YYYY-MM-DD"

    def __post_init__(self):
        if "-" not in self.value:
            raise ValueError("Invalid date format")

@dataclass(frozen=True)
class AppointmentKey:
    date: AppointmentDate
    time: AppointmentTime

    @property
    def value(self) -> str:
        return f"{self.date.value}_{self.time.value}"

    @classmethod
    def from_string(cls, key: str) -> "AppointmentKey":
        parts = key.split("_")
        if len(parts) != 2:
            raise ValueError("Invalid appointment key")
        return cls(AppointmentDate(parts[0]), AppointmentTime(parts[1]))
