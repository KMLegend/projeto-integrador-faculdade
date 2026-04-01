import './Topbar.css';

/**
 * Topbar — Barra superior com título, busca e notificações.
 * Props:
 * - onSearch(value): callback para filtrar agendamentos
 * - onToast(msg, type): callback para exibir notificação
 */
export default function Topbar({ onSearch, onToast }) {
  return (
    <div className="topbar">
      <div className="page-title">Painel de Agendamento Cirúrgico</div>
      <div className="search-box">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Pesquisar paciente ou procedimento..."
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <div className="topbar-icons">
        <div className="icon-btn" onClick={() => onToast('🔔 4 cirurgias aguardando confirmação', 'success')}>
          🔔<div className="notif-count">4</div>
        </div>
        <div className="icon-btn" onClick={() => onToast('⚙️ Configurações abertas', 'success')}>
          ⚙️
        </div>
      </div>
    </div>
  );
}
