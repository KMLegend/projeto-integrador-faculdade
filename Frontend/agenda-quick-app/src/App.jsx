import { useState, useCallback, useEffect } from 'react';
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
import SalasPage from './pages/SalasPage';
import PacientesPage from './pages/PacientesPage';
import InsumosPage from './pages/InsumosPage';
import RelatoriosPage from './pages/RelatoriosPage';

export default function App() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const API_URL = 'http://localhost:8000/api/appointments';

  // ── Authentication State ──
  const [user, setUser] = useState(null);

  // ── Appointments State ──
  const [appointments, setAppointments] = useState({});

  // ── UI States ──
  const [currentView, setCurrentView] = useState('agenda');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalTime, setModalTime] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelData, setPanelData] = useState({ key: null, appointment: null, date: null, hour: null });
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [searchTerm, setSearchTerm] = useState('');

  // ── Callbacks (Declared early to avoid TDZ) ──
  const showToast = useCallback((message, type) => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data || {});
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      showToast('⚠️ Erro ao conectar ao servidor', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  // ── Handlers ──
  function handleOpenModal() {
    setModalDate(new Date());
    setModalTime(null);
    setModalOpen(true);
  }

  function handleSlotClick(date, hour) {
    setModalDate(date);
    setModalTime(hour);
    setModalOpen(true);
  }

  function handleApptClick(key, date, hour) {
    setPanelData({ key, appointment: appointments[key], date, hour });
    setPanelOpen(true);
  }

  async function handleSaveAppointment({ key, data }) {
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
      if (resp.ok) {
        fetchAppointments();
        setModalOpen(false);
        showToast('✅ Cirurgia agendada com sucesso! Insumos reservados automaticamente.', 'success');
      } else {
        const err = await resp.json();
        showToast(`❌ Erro no backend: ${err.detail || 'Falha'}`, 'error');
      }
    } catch (e) {
      showToast('❌ Erro ao salvar agendamento', 'error');
    }
  }

  async function handleUpdateStatus(key, newStatus) {
    try {
      const resp = await fetch(`${API_URL}/${key}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        fetchAppointments();
        setPanelOpen(false);
        showToast(`✅ Status atualizado para ${STATUS_LABELS[newStatus]}`, 'success');
      }
    } catch (e) {
      showToast('❌ Erro ao atualizar status', 'error');
    }
  }

  async function handleDelete(key) {
    try {
      const resp = await fetch(`${API_URL}/${key}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        fetchAppointments();
        setPanelOpen(false);
        showToast('🗑 Agendamento cancelado', 'success');
      }
    } catch (e) {
      showToast('❌ Erro ao cancelar agendamento', 'error');
    }
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  let MainContent = null;
  if (currentView === 'agenda') {
    MainContent = (
      <>
        <SummaryCards appointments={appointments} today={today} />
        <CalendarGrid
          appointments={appointments}
          today={today}
          searchTerm={searchTerm}
          onSlotClick={handleSlotClick}
          onApptClick={handleApptClick}
          onToast={showToast}
        />
      </>
    );
  } else if (currentView === 'salas') {
    MainContent = <SalasPage onToast={showToast} />;
  } else if (currentView === 'pacientes') {
    MainContent = <PacientesPage onToast={showToast} />;
  } else if (currentView === 'insumos') {
    MainContent = <InsumosPage onToast={showToast} />;
  } else if (currentView === 'relatorios') {
    MainContent = <RelatoriosPage onToast={showToast} />;
  }

  return (
    <>
      <Sidebar onToast={showToast} currentView={currentView} setCurrentView={setCurrentView} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onSearch={setSearchTerm} onToast={showToast} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {MainContent}
        </div>
      </div>

      <button className="fab" onClick={handleOpenModal}>＋ Nova Cirurgia</button>

      {currentView === 'agenda' && (
        <>
          <AppointmentModal
            isOpen={modalOpen}
            initialDate={modalDate}
            initialTime={modalTime}
            appointments={appointments}
            onSave={handleSaveAppointment}
            onClose={() => setModalOpen(false)}
            onToast={showToast}
          />

          <DetailPanel
            isOpen={panelOpen}
            appointment={panelData.appointment}
            appointmentKey={panelData.key}
            date={panelData.date}
            hour={panelData.hour}
            onClose={() => setPanelOpen(false)}
            onChangeStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        </>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
}
