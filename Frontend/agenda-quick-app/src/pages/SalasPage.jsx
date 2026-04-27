import { useState, useEffect, useRef } from 'react';
import '../components/TableComponents.css';

export default function SalasPage({ onToast }) {
  const [salas, setSalas] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchSalas = () => {
    fetch('http://localhost:8000/api/salas')
      .then(res => res.json())
      .then(data => setSalas(data))
      .catch(err => onToast('Erro ao carregar salas', 'error'));
  };

  useEffect(() => { fetchSalas(); }, []);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === salas.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(salas.map(s => s.id)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      capacidade: parseInt(formData.get('capacidade') || 0, 10),
      ativo: formData.get('ativo') === 'on'
    };

    const method = editingSala ? 'PUT' : 'POST';
    const url = editingSala 
      ? `http://localhost:8000/api/salas/${editingSala.id}`
      : `http://localhost:8000/api/salas`;

    try {
      const resp = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        onToast(`Sala ${editingSala ? 'atualizada' : 'criada'} com sucesso!`, 'success');
        setIsModalOpen(false);
        fetchSalas();
        setSelectedIds(new Set());
      } else {
        onToast('Erro ao salvar sala', 'error');
      }
    } catch (e) { onToast('Erro de conexão', 'error'); }
  };

  const handleDelete = async () => {
    try {
        for (let id of selectedIds) {
            await fetch(`http://localhost:8000/api/salas/${id}`, { method: 'DELETE' });
        }
        onToast('Salas removidas com sucesso', 'success');
        setSelectedIds(new Set());
        fetchSalas();
    } catch {
        onToast('Erro ao remover', 'error');
    }
  };

  const openEdit = () => {
      const id = Array.from(selectedIds)[0];
      const sala = salas.find(s => s.id === id);
      if(sala) {
          setEditingSala(sala);
          setIsModalOpen(true);
      }
  };

  const openNew = () => {
      setEditingSala(null);
      setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
          const text = evt.target.result;
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          try {
             // Basic parsing: nome,capacidade
             const parsed = lines.map(line => {
                 const cols = line.split(',');
                 return { nome: cols[0]?.trim(), capacidade: parseInt(cols[1]||0), ativo: true };
             });
             if(parsed[0].nome && parsed[0].nome.toLowerCase() === 'nome') parsed.shift();

             const resp = await fetch('http://localhost:8000/api/salas/bulk', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(parsed)
             });
             if(resp.ok) {
                 onToast('Salas importadas com sucesso via CSV!', 'success');
                 fetchSalas();
             }
          } catch (e) {
              onToast('Falha ao formatar ou enviar o CSV', 'error');
          }
      };
      reader.readAsText(file);
      e.target.value = null; 
  };

  return (
    <div className="saas-container">
      <div className="saas-header">
        <div className="saas-title-group">
            <h2 className="saas-title">Salas</h2>
            <span className="saas-badge">{salas.length}</span>
        </div>
        <div className="saas-actions">
            <input type="text" className="saas-search" placeholder="Filtre salas..." />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
            <button className="saas-btn saas-btn-outline" onClick={() => fileInputRef.current.click()}>📄 Upload CSV</button>
            <button className="saas-btn" onClick={openNew}>+ Nova sala</button>
        </div>
      </div>
      
      <div className="saas-table-wrapper">
        <table className="saas-table">
          <thead>
            <tr>
              <th className="saas-checkbox-cell">
                <input type="checkbox" className="custom-checkbox" 
                   onChange={toggleSelectAll} 
                   checked={salas.length > 0 && selectedIds.size === salas.length} />
              </th>
              <th>Order #</th>
              <th>Nome da sala</th>
              <th>Status</th>
              <th>Capacidade</th>
            </tr>
          </thead>
          <tbody>
            {salas.map(s => {
                const isSelected = selectedIds.has(s.id);
                return (
              <tr key={s.id} className={isSelected ? 'selected' : ''} onClick={() => toggleSelect(s.id)}>
                <td className="saas-checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(s.id)} />
                </td>
                <td style={{ color: '#94a3b8' }}>#SLA-00{s.id}</td>
                <td style={{ fontWeight: 600 }}>{s.nome}</td>
                <td>
                    {s.ativo ? 
                     <div className="status-pill"><span className="status-dot green"></span> Ativa</div> :
                     <div className="status-pill yellow"><span className="status-dot yellow"></span> Inativa</div>}
                </td>
                <td style={{ color: '#94a3b8' }}>{s.capacidade || 0}</td>
              </tr>
            )})}
            {salas.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhuma sala encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
          <div className="floating-action-bar">
              <span className="fab-count">{selectedIds.size}</span>
              <span>items selected</span>
              <div className="fab-divider"></div>
              {selectedIds.size === 1 && (
                <button className="fab-btn" onClick={openEdit}>✎ Edit</button>
              )}
              <button className="fab-btn danger" onClick={handleDelete}>🗑 Delete</button>
          </div>
      )}

      {isModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <div className="modal-header">
                      {editingSala ? 'Editar Sala' : 'New Sala'}
                      <button onClick={() => setIsModalOpen(false)} style={{ background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
                  </div>
                  <form onSubmit={handleSave}>
                      <div className="modal-body">
                          <div className="form-group">
                              <label>Nome da Sala</label>
                              <input name="nome" required defaultValue={editingSala?.nome || ''} />
                          </div>
                          <div className="form-group">
                              <label>Capacidade (pessoas)</label>
                              <input name="capacidade" type="number" defaultValue={editingSala?.capacidade || ''} />
                          </div>
                          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <input name="ativo" type="checkbox" className="custom-checkbox" defaultChecked={editingSala ? editingSala.ativo : true} />
                              <label>Ativo</label>
                          </div>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="saas-btn saas-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                          <button type="submit" className="saas-btn">Submit</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
