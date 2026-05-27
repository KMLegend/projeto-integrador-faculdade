import { useState } from 'react';
import { HOURS, DAY_NAMES, MONTHS, STATUS_LABELS, fmtDate, getWeekDays } from '../data/appointments';
import './CalendarGrid.css';

function getMonthGridDays(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - startDayOfWeek);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function fmtDayLabel(d) {
  const dayName = DAY_NAMES[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
}

export default function CalendarGrid({ appointments, today, searchTerm, onSlotClick, onApptClick, onToast }) {
  const [offset, setOffset] = useState(0);
  const [activeView, setActiveView] = useState('semanal');

  // Compute view metadata
  let rangeLabel = '';
  let subLabel = '';
  let days = [];

  if (activeView === 'diaria') {
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    days = [selectedDate];
    rangeLabel = fmtDayLabel(selectedDate);
    subLabel = 'Visão Diária · Centro Cirúrgico A';
  } else if (activeView === 'semanal') {
    days = getWeekDays(today, offset);
    const start = days[0];
    const end = days[6];
    rangeLabel = `${start.getDate()} – ${end.getDate()} ${MONTHS[end.getMonth()]} de ${end.getFullYear()}`;
    subLabel = 'Visão Semanal · Centro Cirúrgico A';
  } else if (activeView === 'mensal') {
    const selectedMonthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    rangeLabel = `${MONTHS[selectedMonthDate.getMonth()]} de ${selectedMonthDate.getFullYear()}`;
    subLabel = 'Visão Mensal · Centro Cirúrgico A';
  } else if (activeView === 'anual') {
    const selectedYear = today.getFullYear() + offset;
    rangeLabel = `Ano de ${selectedYear}`;
    subLabel = 'Visão Anual · Centro Cirúrgico A';
  }

  function handleSetView(view) {
    setActiveView(view);
    setOffset(0);
    const viewName = view === 'diaria' ? 'Diária' : view === 'semanal' ? 'Semanal' : view === 'mensal' ? 'Mensal' : 'Anual';
    onToast(`📅 Visão ${viewName} ativada`, 'success');
  }

  return (
    <div className="agenda-section">
      {/* Header do calendário */}
      <div className="agenda-header">
        <div className="agenda-title-row">
          <div className="agenda-title">{rangeLabel}</div>
          <div className="agenda-sub">{subLabel}</div>
        </div>
        <div className="nav-arrows">
          <div className="arrow-btn" onClick={() => setOffset(o => o - 1)}>◀</div>
          <div className="arrow-btn" onClick={() => setOffset(o => o + 1)}>▶</div>
        </div>
        <div className="view-toggle">
          {['diaria', 'semanal', 'mensal', 'anual'].map(v => (
            <button
              key={v}
              className={`view-btn ${activeView === v ? 'active' : ''}`}
              onClick={() => handleSetView(v)}
            >
              {v === 'diaria' ? 'Diária' : v === 'semanal' ? 'Semanal' : v === 'mensal' ? 'Mensal' : 'Anual'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="calendar-wrap">
        {activeView === 'diaria' || activeView === 'semanal' ? (
          <div className="calendar" style={{ gridTemplateColumns: activeView === 'diaria' ? '64px 1fr' : '64px repeat(7, 1fr)', minWidth: activeView === 'diaria' ? 'unset' : '800px' }}>
            {/* Header row */}
            <div className="cal-header-cell" />
            {days.map((d, i) => {
              const isToday = fmtDate(d) === fmtDate(today);
              return (
                <div key={i} className={`cal-header-cell ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{DAY_NAMES[d.getDay()]}</div>
                  <div className="day-num">{d.getDate()}</div>
                </div>
              );
            })}

            {/* Time rows */}
            {HOURS.map(hour => (
              <div key={`row-${hour}`} style={{ display: 'contents' }}>
                <div className="time-cell">{hour}</div>
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
                          <div className="appt-status">{STATUS_LABELS[appt.status] || appt.status}</div>
                          <div className="appt-service">{appt.service}</div>
                          {appt.patient && <div className="appt-client">{appt.patient}</div>}
                          {appt.room && <div className="appt-time">{appt.room}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : activeView === 'mensal' ? (
          <div className="month-calendar">
            {DAY_NAMES.map(name => (
              <div key={name} className="month-header-cell">{name}</div>
            ))}
            {getMonthGridDays(new Date(today.getFullYear(), today.getMonth() + offset, 1).getFullYear(), new Date(today.getFullYear(), today.getMonth() + offset, 1).getMonth()).map((d, idx) => {
              const isToday = fmtDate(d) === fmtDate(today);
              const isCurrentMonth = d.getMonth() === new Date(today.getFullYear(), today.getMonth() + offset, 1).getMonth();
              const dayAppts = Object.entries(appointments).filter(([key]) => key.startsWith(`${fmtDate(d)}_`));

              return (
                <div
                  key={idx}
                  className={`month-day-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today-cell' : ''}`}
                  onClick={() => {
                    const diffTime = d.getTime() - today.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    setOffset(diffDays);
                    setActiveView('diaria');
                  }}
                >
                  <div className="month-day-num">{d.getDate()}</div>
                  <div className="mini-appts">
                    {dayAppts.map(([key, appt]) => {
                      const isDimmed = searchTerm && !(`${appt.service} ${appt.patient} ${appt.room}`).toLowerCase().includes(searchTerm.toLowerCase());
                      return (
                        <div
                          key={key}
                          className={`mini-appt ${appt.status} ${isDimmed ? 'search-dim' : ''}`}
                          onClick={e => {
                            e.stopPropagation();
                            onApptClick(key, d, key.split('_')[1]);
                          }}
                        >
                          <span className="mini-appt-time">{key.split('_')[1]}</span>
                          <span className="mini-appt-name">{appt.service}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="annual-grid">
            {MONTHS.map((monthName, idx) => {
              const selectedYear = today.getFullYear() + offset;
              const monthPrefix = `${selectedYear}-${String(idx + 1).padStart(2, '0')}-`;
              const monthAppts = Object.entries(appointments).filter(([key]) => key.startsWith(monthPrefix));
              
              const counts = { green: 0, yellow: 0, blue: 0, total: monthAppts.length };
              monthAppts.forEach(([_, appt]) => {
                if (counts[appt.status] !== undefined) {
                  counts[appt.status]++;
                }
              });

              return (
                <div
                  key={monthName}
                  className="month-card"
                  onClick={() => {
                    const targetOffset = (selectedYear - today.getFullYear()) * 12 + (idx - today.getMonth());
                    setOffset(targetOffset);
                    setActiveView('mensal');
                  }}
                >
                  <div className="month-card-title">{monthName}</div>
                  <div className="month-card-stats">
                    <div className="stat-row">
                      <span>Total de Cirurgias</span>
                      <strong>{counts.total}</strong>
                    </div>
                    {counts.total > 0 && (
                      <>
                        <div className="stat-row">
                          <span><span className="status-pill green" /> Confirmadas</span>
                          <strong>{counts.green}</strong>
                        </div>
                        <div className="stat-row">
                          <span><span className="status-pill yellow" /> Pendentes</span>
                          <strong>{counts.yellow}</strong>
                        </div>
                        <div className="stat-row">
                          <span><span className="status-pill blue" /> Em andamento</span>
                          <strong>{counts.blue}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
