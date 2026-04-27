from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from domain.interface_repository import AppointmentRepository
from domain.entities import Appointment
from domain.value_objects import AppointmentStatus, AppointmentKey, AppointmentDate, AppointmentTime
from .models import Agendamento, Paciente, Usuario, Sala, TipoServico

class SQLAppointmentRepository(AppointmentRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Appointment]:
        db_items = self.db.query(Agendamento).options(
            joinedload(Agendamento.paciente),
            joinedload(Agendamento.medico),
            joinedload(Agendamento.sala),
            joinedload(Agendamento.tipo_servico)
        ).all()
        return [self._to_entity(item) for item in db_items]

    def get_by_key(self, date: str, time: str) -> Optional[Appointment]:
        # Simple string matching for demo purposes, in production use datetime parsing
        # Start of hour: "YYYY-MM-DD HH:mm:00"
        ts_str = f"{date} {time}:00"
        ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
        
        db_item = self.db.query(Agendamento).filter(Agendamento.inicio == ts).first()
        if not db_item:
            return None
        return self._to_entity(db_item)

    def save(self, appointment: Appointment) -> Appointment:
        ids = self.resolve_ids(
            appointment.service_name, 
            appointment.patient_name, 
            appointment.room_name, 
            appointment.surgeon_name
        )
        
        ts_inicio = datetime.strptime(f"{appointment.key.date.value} {appointment.key.time.value}:00", "%Y-%m-%d %H:%M:%S")
        # Assume 1 hour duration if not specified
        ts_fim = datetime.fromtimestamp(ts_inicio.timestamp() + 3600)

        db_item = Agendamento(
            paciente_id=ids['patient_id'],
            medico_id=ids['medico_id'],
            sala_id=ids['sala_id'],
            tipo_servico_id=ids['tipo_servico_id'],
            inicio=ts_inicio,
            fim=ts_fim,
            status=appointment.status.value,
            observacoes=appointment.notes
        )
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return self._to_entity(db_item)

    def delete(self, appointment_id: int) -> None:
        db_item = self.db.query(Agendamento).filter(Agendamento.id == appointment_id).first()
        if db_item:
            self.db.delete(db_item)
            self.db.commit()

    def resolve_ids(self, service: str, patient: str, room: str, surgeon: str) -> dict:
        s = self.db.query(TipoServico).filter(TipoServico.nome == service).first()
        r = self.db.query(Sala).filter(Sala.nome == room).first()
        m = self.db.query(Usuario).filter(Usuario.nome == surgeon).first()
        
        if not s:
            raise ValueError(f"Service type '{service}' not found in database.")
        if not r:
            raise ValueError(f"Room '{room}' not found in database.")
        if not m:
            raise ValueError(f"Surgeon '{surgeon}' not found in database.")

        p = self.db.query(Paciente).filter(Paciente.nome == patient).first()
        if not p:
            # Auto-create patient for simplicity in this MVP
            default_filial_id = 1
            p = Paciente(nome=patient, filial_id=default_filial_id)
            self.db.add(p)
            self.db.commit()
            self.db.refresh(p)
            
        return {
            'tipo_servico_id': s.id,
            'patient_id': p.id,
            'sala_id': r.id,
            'medico_id': m.id
        }

    def _to_entity(self, db_item: Agendamento) -> Appointment:
        date_str = db_item.inicio.strftime("%Y-%m-%d")
        time_str = db_item.inicio.strftime("%H:%M")
        
        return Appointment(
            id=db_item.id,
            key=AppointmentKey(AppointmentDate(date_str), AppointmentTime(time_str)),
            service_name=db_item.tipo_servico.nome,
            patient_name=db_item.paciente.nome,
            room_name=db_item.sala.nome,
            surgeon_name=db_item.medico.nome,
            status=AppointmentStatus(db_item.status),
            notes=db_item.observacoes
        )
