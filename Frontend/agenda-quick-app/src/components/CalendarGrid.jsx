import { useState } from 'react';
import { HOURS, DAY_NAMES, MONTHS, STATUS_LABELS, fmtDate, getWeekDays } from '../data/appointments';
import './CalendarGrid.css';

/**
 * CalendarGrid — Calendário semanal com grid de horários.
 * É o componente principal ("coração") do sistema.
 *
 * Props:
 * - appointments: objeto com agendamentos
 * - today: Date do dia atual
 * - searchTerm: string para filtrar agendamentos
 * - onSlotClick(date, hour): abre modal de novo agendamento
 * - onApptClick(key, date, hour): abre painel de detalhes
 * - onToast(msg, type): callback para notificações
 */
export default function CalendarGrid({ appointments, today, searchTerm, onSlotClick, onApptClick, onToast }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeView, setActiveView] = useState('semanal');

  const days = getWeekDays(today, weekOffset);
  const start = days[0];
  const end = days[6];
  const rangeLabel = `${start.getDate()} – ${end.getDate()} ${MONTHS[end.getMonth()]}, ${end.getFullYear()}`;

  function handleSetView(view, e) {
    setActiveView(view);
    onToast(`📅 Visão ${e.target.textContent} ativada`, 'success');
  }

  return (
    <div className="agenda-section">
      {/* Header do calendário */}
      <div className="agenda-header">
        <div className="agenda-title-row">
          <div className="agenda-title">{rangeLabel}</div>
          <div className="agenda-sub">Visão Semanal · Centro Cirúrgico A</div>
        </div>
        <div className="nav-arrows">
          <div className="arrow-btn" onClick={() => setWeekOffset(w => w - 1)}>◀</div>
          <div className="arrow-btn" onClick={() => setWeekOffset(w => w + 1)}>▶</div>
        </div>
        <div className="view-toggle">
          {['diaria', 'semanal', 'mensal'].map(v => (
            <button
              key={v}
              className={`view-btn ${activeView === v ? 'active' : ''}`}
              onClick={e => handleSetView(v, e)}
            >
              {v === 'diaria' ? 'Diária' : v === 'semanal' ? 'Semanal' : 'Mensal'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="calendar-wrap">
        <div className="calendar">
          {/* Header row */}
          <div className="cal-header-cell" />
          {days.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            return (
              <div key={i} className={`cal-header-cell ${isToday ? 'today' : ''}`}>
                <div className="day-name">{DAY_NAMES[d.getDay()]} {d.getDate()}</div>
              </div>
            );
          })}

          {/* Time rows */}
          {HOURS.map(hour => (
            <>
              <div key={`t-${hour}`} className="time-cell">{hour}</div>
              {days.map((d, i) => {
                const key = `${fmtDate(d)}_${hour}`;
                const appt = appointments[key];
                const isDimmed = searchTerm && appt &&
                  !(`${appt.service} ${appt.patient} ${appt.room}`).toLowerCase().includes(searchTerm.toLowerCase());

                return (
                  <div
                    key={`s-${hour}-${i}`}
                    className={`slot ${appt ? '' : 'empty'}`}
                    onClick={!appt ? () => onSlotClick(d, hour) : undefined}
                  >
                    {appt && (
                      <div
                        className={`appt ${appt.status} ${isDimmed ? 'search-dim' : ''}`}
                        onClick={e => { e.stopPropagation(); onApptClick(key, d, hour); }}
                      >
                        <div className="appt-status">{STATUS_LABELS[appt.status]}</div>
                        <div className="appt-service">{appt.service}</div>
                        {appt.patient && <div className="appt-client">{appt.patient}</div>}
                        {appt.room && <div className="appt-time">{appt.room}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
