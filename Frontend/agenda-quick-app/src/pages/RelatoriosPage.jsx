import { useState, useEffect } from 'react';

export default function RelatoriosPage({ onToast }) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/relatorios')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => onToast('Erro ao carregar relatórios', 'error'));
  }, [onToast]);

  return (
    <div style={{ backgroundColor: '#1e293b', padding: 24, borderRadius: 12, color: '#fff' }}>
      <h2 style={{ borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 16 }}>
        📊 Relatórios e Métricas
      </h2>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
            <div style={{ background: '#334155', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{stats.total_cirurgias}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Total de Agendamentos</div>
            </div>
            <div style={{ background: '#334155', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ade80' }}>{stats.realizadas}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Cirurgias Realizadas</div>
            </div>
            <div style={{ background: '#334155', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f87171' }}>{stats.canceladas}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Agendamentos Cancelados</div>
            </div>
            <div style={{ background: '#334155', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a78bfa' }}>{stats.total_pacientes}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Pacientes Registrados</div>
            </div>
            <div style={{ background: '#334155', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats.total_salas}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Salas Cirúrgicas</div>
            </div>
        </div>
      ) : (
        <div style={{ opacity: 0.5, marginTop: 24 }}>Carregando dados...</div>
      )}
    </div>
  );
}
