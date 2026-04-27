import { useState, useEffect, useRef } from 'react';
import '../components/TableComponents.css';

export default function PacientesPage({ onToast }) {
  const [pacientes, setPacientes] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchPacientes = () => {
    fetch('http://localhost:8000/api/pacientes')
      .then(res => res.json())
      .then(data => setPacientes(data))
      .catch(err => onToast('Erro ao carregar pacientes', 'error'));
  };

  useEffect(() => { fetchPacientes(); }, []);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pacientes.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pacientes.map(p => p.id)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      cpf: formData.get('cpf'),
      telefone: formData.get('telefone')
    };

    const method = editingPaciente ? 'PUT' : 'POST';
    const url = editingPaciente 
      ? `http://localhost:8000/api/pacientes/${editingPaciente.id}`
      : `http://localhost:8000/api/pacientes`;

    try {
      const resp = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        onToast(`Paciente ${editingPaciente ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        setIsModalOpen(false);
        fetchPacientes();
        setSelectedIds(new Set());
      } else {
        onToast('Erro ao salvar paciente', 'error');
      }
    } catch (e) { onToast('Erro de conexão', 'error'); }
  };

  const handleDelete = async () => {
    try {
        for (let id of selectedIds) {
            await fetch(`http://localhost:8000/api/pacientes/${id}`, { method: 'DELETE' });
        }
        onToast('Pacientes removidos', 'success');
        setSelectedIds(new Set());
        fetchPacientes();
    } catch {
        onToast('Erro ao remover', 'error');
    }
  };

  const openEdit = () => {
      const id = Array.from(selectedIds)[0];
      const p = pacientes.find(x => x.id === id);
      if(p) {
          setEditingPaciente(p);
          setIsModalOpen(true);
      }
  };

  const openNew = () => {
      setEditingPaciente(null);
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
             // CSV: nome,cpf,telefone
             const parsed = lines.map(line => {
                 const cols = line.split(',');
                 return { nome: cols[0]?.trim(), cpf: cols[1]?.trim()||'', telefone: cols[2]?.trim()||'' };
             });
             if(parsed[0].nome && parsed[0].nome.toLowerCase() === 'nome') parsed.shift();

             const resp = await fetch('http://localhost:8000/api/pacientes/bulk', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(parsed)
             });
             if(resp.ok) {
                 onToast('Pacientes importados com sucesso via CSV!', 'success');
                 fetchPacientes();
             }
          } catch (e) {
              onToast('Falha ao enviar o CSV', 'error');
          }
      };
      reader.readAsText(file);
      e.target.value = null; 
  };

  return (
    <div className="saas-container">
      <div className="saas-header">
        <div className="saas-title-group">
            <h2 className="saas-title">Pacientes</h2>
            <span className="saas-badge">{pacientes.length}</span>
        </div>
        <div className="saas-actions">
            <input type="text" className="saas-search" placeholder="Filtre pacientes..." />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
            <button className="saas-btn saas-btn-outline" onClick={() => fileInputRef.current.click()}>📄 Upload CSV</button>
            <button className="saas-btn" onClick={openNew}>+ Novo Paciente</button>
        </div>
      </div>
      
      <div className="saas-table-wrapper">
        <table className="saas-table">
          <thead>
            <tr>
              <th className="saas-checkbox-cell">
                <input type="checkbox" className="custom-checkbox" 
                   onChange={toggleSelectAll} 
                   checked={pacientes.length > 0 && selectedIds.size === pacientes.length} />
              </th>
              <th>Order #</th>
              <th>Paciente Name</th>
              <th>CPF / Docs</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(p => {
                const isSelected = selectedIds.has(p.id);
                return (
              <tr key={p.id} className={isSelected ? 'selected' : ''} onClick={() => toggleSelect(p.id)}>
                <td className="saas-checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} />
                </td>
                <td style={{ color: '#94a3b8' }}>#PAC-00{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.nome}</td>
                <td>{p.cpf}</td>
                <td style={{ color: '#475569' }}>{p.telefone || '-'}</td>
              </tr>
            )})}
            {pacientes.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum paciente.</td></tr>
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
                      {editingPaciente ? 'Editar Paciente' : 'New Paciente'}
                      <button onClick={() => setIsModalOpen(false)} style={{ background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
                  </div>
                  <form onSubmit={handleSave}>
                      <div className="modal-body">
                          <div className="form-group">
                              <label>Nome Completo</label>
                              <input name="nome" required defaultValue={editingPaciente?.nome || ''} />
                          </div>
                          <div className="form-group">
                              <label>CPF</label>
                              <input name="cpf" defaultValue={editingPaciente?.cpf || ''} />
                          </div>
                          <div className="form-group">
                              <label>Telefone</label>
                              <input name="telefone" defaultValue={editingPaciente?.telefone || ''} />
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
