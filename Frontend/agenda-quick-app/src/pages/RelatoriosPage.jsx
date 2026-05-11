import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8000/api/v2/relatorios';

const STATUS_LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  no_show: 'No-Show',
};

const STATUS_COLORS = {
  agendado: '#60a5fa',
  confirmado: '#34d399',
  realizado: '#4ade80',
  cancelado: '#f87171',
  no_show: '#fbbf24',
};

function Card({ value, label, color }) {
  return (
    <div style={{
      background: '#334155',
      padding: '24px',
      borderRadius: '10px',
      textAlign: 'center',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value ?? '—'}</div>
      <div style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

export default function RelatoriosPage({ onToast, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  const fetchRelatorios = useCallback(() => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (statusFiltro) params.append('status', statusFiltro);

    setLoading(true);
    fetch(`${API}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar relatórios');
        return res.json();
      })
      .then((data) => setStats(data))
      .catch(() => onToast('Erro ao carregar relatórios', 'error'))
      .finally(() => setLoading(false));
  }, [dataInicio, dataFim, statusFiltro, token, onToast]);

  useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  function handleLimparFiltros() {
    setDataInicio('');
    setDataFim('');
    setStatusFiltro('');
  }

  const inputStyle = {
    background: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '6px',
    color: '#e2e8f0',
    padding: '8px 12px',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    color: '#94a3b8',
    fontSize: '0.75rem',
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Painel de filtros ── */}
      <div style={{
        background: '#1e293b',
        padding: 20,
        borderRadius: 12,
        border: '1px solid #334155',
      }}>
        <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '0.95rem' }}>
          🔍 Filtros de Pesquisa
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          alignItems: 'flex-end',
        }}>
          <div>
            <label style={labelStyle}>Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={fetchRelatorios}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Aplicar
            </button>
            <button
              onClick={handleLimparFiltros}
              style={{
                padding: '8px 16px',
                background: '#475569',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* ── Cards de resumo ── */}
      <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
        <h2 style={{
          color: '#e2e8f0',
          borderBottom: '1px solid #334155',
          paddingBottom: 12,
          marginTop: 0,
          marginBottom: 20,
        }}>
          📊 Dashboard — Resumo Geral
        </h2>

        {loading && (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>
            Carregando dados...
          </div>
        )}

        {!loading && stats && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}>
              <Card value={stats.total_cirurgias} label="Total de Agendamentos" color="#60a5fa" />
              <Card value={stats.realizadas} label="Realizadas" color="#4ade80" />
              <Card value={stats.confirmadas} label="Confirmadas" color="#34d399" />
              <Card value={stats.agendadas} label="Aguardando" color="#a78bfa" />
              <Card value={stats.canceladas} label="Canceladas" color="#f87171" />
              <Card value={stats.no_show} label="No-Show" color="#fbbf24" />
              <Card value={stats.total_pacientes} label="Pacientes" color="#e879f9" />
              <Card value={stats.total_salas} label="Salas Ativas" color="#fb923c" />
            </div>

            {/* ── Listagem detalhada ── */}
            <h3 style={{ color: '#e2e8f0', marginBottom: 12, fontSize: '0.95rem' }}>
              📋 Listagem de Agendamentos
              {(dataInicio || dataFim || statusFiltro) && (
                <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, fontSize: '0.8rem' }}>
                  (filtros aplicados)
                </span>
              )}
            </h3>

            {stats.agendamentos.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>
                Nenhum agendamento encontrado para os filtros selecionados.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a' }}>
                      {['#', 'Paciente', 'Médico', 'Sala', 'Serviço', 'Data/Hora', 'Status'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            color: '#94a3b8',
                            fontWeight: 600,
                            borderBottom: '1px solid #334155',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.agendamentos.map((a, idx) => (
                      <tr
                        key={a.id}
                        style={{ background: idx % 2 === 0 ? 'transparent' : '#0f172a' }}
                      >
                        <td style={{ padding: '9px 12px', color: '#64748b' }}>{a.id}</td>
                        <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{a.paciente}</td>
                        <td style={{ padding: '9px 12px', color: '#cbd5e1' }}>{a.medico}</td>
                        <td style={{ padding: '9px 12px', color: '#cbd5e1' }}>{a.sala}</td>
                        <td style={{ padding: '9px 12px', color: '#cbd5e1' }}>{a.servico}</td>
                        <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {new Date(a.inicio).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{
                            background: (STATUS_COLORS[a.status] || '#94a3b8') + '22',
                            color: STATUS_COLORS[a.status] || '#94a3b8',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}>
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stats.agendamentos.length === 100 && (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '12px 0', fontSize: '0.8rem' }}>
                    Exibindo os 100 registros mais recentes. Use os filtros para refinar a busca.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
