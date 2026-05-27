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
export default function Sidebar({ onToast, currentView, setCurrentView, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">🏥</span>
        Agenda<span>Quick</span>
      </div>

      <div className="sidebar-scrollable-content">
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
        <div className="profile-card" onClick={() => onToast(`👤 Perfil de ${user?.name || 'Usuário'}`, 'success')}>
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="profile-info">
            <div className="profile-name">{user?.name || 'Usuário'}</div>
            <div className="profile-role">{user?.role || 'Acesso'}</div>
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
        <a className={`nav-item ${currentView === 'usuarios' ? 'active' : ''}`} href="#" onClick={e => { e.preventDefault(); setCurrentView('usuarios'); }}>
          <span className="icon">👤</span>Usuários
        </a>
        <a className="nav-item" href="#" onClick={e => { e.preventDefault(); onToast('⚙️ Configurações — em desenvolvimento', 'success'); }}>
          <span className="icon">⚙️</span>Configurações
        </a>
        
        <a className="nav-item" href="#" onClick={e => { e.preventDefault(); onLogout(); }} style={{ color: '#ef4444' }}>
          <span className="icon">🚪</span>Sair (Logout)
        </a>
      </div>

      {/* Rodapé */}
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot">●</span>
          <span className="status-text">Online: <strong>{user?.name || 'Usuário'}</strong></span>
        </div>
      </div>
    </aside>
  );
}
