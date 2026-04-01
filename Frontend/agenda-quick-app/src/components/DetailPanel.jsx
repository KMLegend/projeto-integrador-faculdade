import { STATUS_LABELS, MONTHS, INSUMOS } from '../data/appointments';
import './DetailPanel.css';

/**
 * DetailPanel — Painel lateral de detalhes do agendamento.
 * Exibe informações do agendamento, insumos reservados e ações.
 *
 * Props:
 * - isOpen: boolean
 * - appointment: objeto do agendamento selecionado
 * - appointmentKey: chave do agendamento
 * - date: Date do agendamento
 * - hour: string de horário
 * - onClose(): fechar painel
 * - onChangeStatus(key, status): alterar status
 * - onDelete(key): cancelar agendamento
 */
export default function DetailPanel({ isOpen, appointment, appointmentKey, date, hour, onClose, onChangeStatus, onDelete }) {
  if (!appointment) return <div className="detail-panel" />;

  const a = appointment;
  const dateStr = date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : '';
  const insumos = INSUMOS[a.service] || INSUMOS['Cirurgia Geral'] || [];

  return (
    <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <div className="panel-title">{a.service}</div>
        <div className="modal-close" onClick={onClose}>✕</div>
      </div>
      <div className="panel-body">
        {/* Status Badge */}
        <div>
          <span className={`status-badge ${a.status}`}>● {STATUS_LABELS[a.status]}</span>
        </div>

        {/* Informações */}
        <div className="detail-info">
          <div className="detail-row">
            <span className="detail-key">📅 Data</span>
            <span className="detail-val">{dateStr}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">🕐 Horário</span>
            <span className="detail-val">{hour}</span>
          </div>
          {a.patient && (
            <div className="detail-row">
              <span className="detail-key">👤 Paciente</span>
              <span className="detail-val">{a.patient}</span>
            </div>
          )}
          {a.room && (
            <div className="detail-row">
              <span className="detail-key">🚪 Sala</span>
              <span className="detail-val">{a.room}</span>
            </div>
          )}
          {a.surgeon && (
            <div className="detail-row">
              <span className="detail-key">🩺 Cirurgião</span>
              <span className="detail-val">{a.surgeon}</span>
            </div>
          )}
          {a.notes && (
            <div className="detail-row">
              <span className="detail-key">📝 Obs</span>
              <span className="detail-val">{a.notes}</span>
            </div>
          )}
        </div>

        <div className="panel-divider" />

        {/* Insumos Reservados */}
        <div>
          <div className="insumo-section-title">📦 Insumos Reservados</div>
          <ul className="insumo-list">
            {insumos.map((ins, i) => (
              <li key={i} className="insumo-item">
                <span className="insumo-icon">{ins.icon}</span>
                <span className="insumo-name">{ins.name}</span>
                <span className="insumo-qty">{ins.qty}</span>
                <span className="insumo-check">✓</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-divider" />

        {/* Ações */}
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={() => onChangeStatus(appointmentKey, 'green')}>
            ✅ Confirmar Cirurgia
          </button>
          <button className="btn btn-secondary" onClick={() => onChangeStatus(appointmentKey, 'blue')}>
            🔵 Iniciar Procedimento
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(appointmentKey)}>
            🗑 Cancelar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
