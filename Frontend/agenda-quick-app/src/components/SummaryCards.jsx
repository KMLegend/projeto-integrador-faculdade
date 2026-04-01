import { fmtDate } from '../data/appointments';
import './SummaryCards.css';

/**
 * SummaryCards — Cards de resumo do dashboard.
 * Exibe: Cirurgias Hoje, Salas Ocupadas, Insumos Reservados.
 *
 * Props:
 * - appointments: objeto com todos os agendamentos
 * - today: Date do dia atual
 */
export default function SummaryCards({ appointments, today }) {
  const todayStr = fmtDate(today);
  const todayAppts = Object.entries(appointments).filter(([k]) => k.startsWith(todayStr));
  const active = todayAppts.filter(([, a]) => a.status !== 'gray');
  const rooms = new Set(active.map(([, a]) => a.room).filter(Boolean));

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-icon blue">🏥</div>
        <div className="card-body">
          <div className="card-label">Cirurgias Hoje</div>
          <div className="card-value">{active.length}</div>
          <div className="card-sub">procedimentos agendados</div>
        </div>
        <div className="trend up">+2 ↑</div>
      </div>
      <div className="summary-card">
        <div className="card-icon green">🚪</div>
        <div className="card-body">
          <div className="card-label">Salas Ocupadas</div>
          <div className="card-value">{rooms.size}</div>
          <div className="card-sub">de 5 disponíveis</div>
        </div>
        <div className="trend up">ativas</div>
      </div>
      <div className="summary-card">
        <div className="card-icon amber">📦</div>
        <div className="card-body">
          <div className="card-label">Insumos Reservados</div>
          <div className="card-value">{active.length * 5}</div>
          <div className="card-sub">itens para hoje</div>
        </div>
        <div className="trend up">98% ↑</div>
      </div>
    </div>
  );
}
