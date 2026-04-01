import { useState, useEffect } from 'react';
import { SERVICES, ROOMS, SURGEONS, STATUS_OPTIONS, HOURS, fmtDate } from '../data/appointments';
import './AppointmentModal.css';

/**
 * AppointmentModal — Modal para criar novo agendamento cirúrgico.
 * Valida conflitos de sala+horário antes de salvar.
 *
 * Props:
 * - isOpen: boolean indicando se o modal está aberto
 * - initialDate: Date pré-selecionada
 * - initialTime: string de horário pré-selecionado
 * - appointments: objeto com agendamentos existentes
 * - onSave(appointmentData): callback ao salvar
 * - onClose(): callback ao fechar
 * - onToast(msg, type): callback para notificações
 */
export default function AppointmentModal({ isOpen, initialDate, initialTime, appointments, onSave, onClose, onToast }) {
  const [patient, setPatient] = useState('');
  const [service, setService] = useState(SERVICES[0]);
  const [room, setRoom] = useState(ROOMS[0]);
  const [surgeon, setSurgeon] = useState(SURGEONS[0]);
  const [status, setStatus] = useState('yellow');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(HOURS[0]);
  const [notes, setNotes] = useState('');

  // Atualiza campos quando o modal abre com data/hora pré-selecionada
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate ? fmtDate(initialDate) : fmtDate(new Date()));
      setTime(initialTime || HOURS[0]);
    }
  }, [isOpen, initialDate, initialTime]);

  function handleSave() {
    if (!patient.trim()) {
      onToast('⚠️ Informe o nome do paciente', 'error');
      return;
    }
    if (!date) {
      onToast('⚠️ Informe a data', 'error');
      return;
    }

    const key = `${date}_${time}`;

    // Validação de conflito: mesmo horário
    if (appointments[key]) {
      if (appointments[key].room === room) {
        onToast(`⚠️ Conflito! ${room} já está ocupada em ${time} nesta data`, 'error');
      } else {
        onToast('⚠️ Conflito! Já existe agendamento nesse horário', 'error');
      }
      return;
    }

    onSave({
      key,
      data: { service, patient: patient.trim(), room, surgeon, status, notes: notes.trim() }
    });

    // Limpa o formulário
    setPatient('');
    setNotes('');
    onToast('✅ Cirurgia agendada com sucesso! Insumos reservados automaticamente.', 'success');
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🏥 Novo Agendamento Cirúrgico</div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Paciente</label>
            <input className="form-input" type="text" value={patient}
              onChange={e => setPatient(e.target.value)}
              placeholder="Nome completo do paciente..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Serviço</label>
              <select className="form-select" value={service} onChange={e => setService(e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sala Cirúrgica</label>
              <select className="form-select" value={room} onChange={e => setRoom(e.target.value)}>
                {ROOMS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cirurgião Responsável</label>
              <select className="form-select" value={surgeon} onChange={e => setSurgeon(e.target.value)}>
                {SURGEONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Horário</label>
              <select className="form-select" value={time} onChange={e => setTime(e.target.value)}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações</label>
            <input className="form-input" type="text" value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre o procedimento..." />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Confirmar Agendamento</button>
        </div>
      </div>
    </div>
  );
}
