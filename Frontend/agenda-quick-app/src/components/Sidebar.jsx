import { FILIAIS, CENTROS } from '../data/appointments';
import './Sidebar.css';

/**
 * Sidebar — Menu lateral do sistema.
 * Contém: logo, seletor de filial/centro cirúrgico,
 * perfil do usuário, menu de navegação e rodapé.
 *
 * Props:
 * - onToast(msg, type): callback para exibir notificação
 */
export default function Sidebar({ onToast, currentView, setCurrentView }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">🏥</span>
        Agenda<span>Quick</span>
      </div>

      {/* Seletor de Filial */}
      <div className="filial-select">
        <label>Filial</label>
        <select onChange={e => onToast(`🏥 Filial: ${e.target.value}`, 'success')}>
          {FILIAIS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Seletor de Centro Cirúrgico */}
      <div className="filial-select" style={{ marginTop: 8 }}>
        <label>Centro Cirúrgico</label>
        <select onChange={e => onToast(`🔬 Centro: ${e.target.value}`, 'success')}>
          {CENTROS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Perfil do Usuário */}
      <div className="profile-card" onClick={() => onToast('👤 Perfil de Dra. Ana Silva', 'success')}>
        <div className="avatar">A</div>
        <div className="profile-info">
          <div className="profile-name">Dra. Ana Silva</div>
          <div className="profile-role">Cirurgiã Chefe</div>
        </div>
        <span className="chevron">▾</span>
      </div>

      {/* Navegação */}
      <div className="nav-label">Menu</div>
      <a className={`nav-item ${currentView === 'agenda' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('agenda'); }}>
        <span className="icon">📆</span>Agenda
      </a>
      <a className={`nav-item ${currentView === 'salas' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('salas'); }}>
        <span className="icon">🚪</span>Salas<span className="nav-badge">5</span>
      </a>
      <a className={`nav-item ${currentView === 'pacientes' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('pacientes'); }}>
        <span className="icon">👥</span>Pacientes
      </a>
      <a className={`nav-item ${currentView === 'insumos' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('insumos'); }}>
        <span className="icon">📦</span>Insumos
      </a>
      <a className={`nav-item ${currentView === 'relatorios' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('relatorios'); }}>
        <span className="icon">📊</span>Relatórios
      </a>

      <div className="nav-label" style={{ marginTop: 8 }}>Sistema</div>
      <a className="nav-item" href="#" onClick={e => { e.preventDefault(); onToast('🔐 Permissões — em desenvolvimento', 'success'); }}>
        <span className="icon">🔐</span>Permissões
      </a>
      <a className="nav-item" href="#" onClick={e => { e.preventDefault(); onToast('⚙️ Configurações — em desenvolvimento', 'success'); }}>
        <span className="icon">⚙️</span>Configurações
      </a>

      {/* Rodapé */}
      <div className="sidebar-footer">
        <div className="profile-card" style={{ margin: 0 }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>A</div>
          <div className="profile-info">
            <div className="profile-name">Dra. Ana Silva</div>
            <div className="profile-role">Online agora</div>
          </div>
          <span style={{ color: '#22c55e', fontSize: 18 }}>●</span>
        </div>
      </div>
    </aside>
  );
}
