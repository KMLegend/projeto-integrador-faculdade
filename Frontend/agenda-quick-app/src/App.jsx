import { useState, useCallback } from 'react';
import { createInitialAppointments, STATUS_LABELS } from './data/appointments';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SummaryCards from './components/SummaryCards';
import CalendarGrid from './components/CalendarGrid';
import AppointmentModal from './components/AppointmentModal';
import DetailPanel from './components/DetailPanel';
import Toast from './components/Toast';
import './components/Toast.css';

/**
 * App — Componente raiz do AgendaQuick.
 * Gerencia o estado global: autenticação, agendamentos, modal, painel de detalhes e toast.
 * Em produção, o estado seria substituído por chamadas à API do backend.
 */
export default function App() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Estado de autenticação (futuramente: JWT/Session via backend) ──
  const [user, setUser] = useState(null);

  // ── Estado dos agendamentos (futuramente: API calls) ──────
  const [appointments, setAppointments] = useState(() => createInitialAppointments());

  // ── Estado do modal ────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalTime, setModalTime] = useState(null);

  // ── Estado do painel de detalhes ───────────────────────────
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelData, setPanelData] = useState({ key: null, appointment: null, date: null, hour: null });

  // ── Estado do toast ────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // ── Estado de busca ────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');

  // ── Callbacks ─────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Abre modal para novo agendamento
  function handleOpenModal() {
    setModalDate(new Date());
    setModalTime(null);
    setModalOpen(true);
  }

  // Abre modal a partir de um slot vazio do calendário
  function handleSlotClick(date, hour) {
    setModalDate(date);
    setModalTime(hour);
    setModalOpen(true);
  }

  // Salva novo agendamento
  function handleSaveAppointment({ key, data }) {
    setAppointments(prev => ({ ...prev, [key]: data }));
    setModalOpen(false);
  }

  // Abre painel de detalhes ao clicar em um agendamento
  function handleApptClick(key, date, hour) {
    setPanelData({ key, appointment: appointments[key], date, hour });
    setPanelOpen(true);
  }

  // Muda status de um agendamento
  function handleChangeStatus(key, status) {
    setAppointments(prev => ({
      ...prev,
      [key]: { ...prev[key], status }
    }));
    setPanelOpen(false);
    showToast(`✅ Status atualizado para ${STATUS_LABELS[status]}`, 'success');
  }

  // Deleta um agendamento
  function handleDelete(key) {
    setAppointments(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPanelOpen(false);
    showToast('🗑 Agendamento cancelado e insumos liberados', 'success');
  }

  // ── Se não estiver autenticado, mostra a tela de Login ─────
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      {/* Sidebar */}
      <Sidebar onToast={showToast} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onSearch={setSearchTerm} onToast={showToast} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SummaryCards appointments={appointments} today={today} />
          <CalendarGrid
            appointments={appointments}
            today={today}
            searchTerm={searchTerm}
            onSlotClick={handleSlotClick}
            onApptClick={handleApptClick}
            onToast={showToast}
          />
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={handleOpenModal}>＋ Nova Cirurgia</button>

      {/* Modal */}
      <AppointmentModal
        isOpen={modalOpen}
        initialDate={modalDate}
        initialTime={modalTime}
        appointments={appointments}
        onSave={handleSaveAppointment}
        onClose={() => setModalOpen(false)}
        onToast={showToast}
      />

      {/* Detail Panel */}
      <DetailPanel
        isOpen={panelOpen}
        appointment={panelData.appointment}
        appointmentKey={panelData.key}
        date={panelData.date}
        hour={panelData.hour}
        onClose={() => setPanelOpen(false)}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
}
