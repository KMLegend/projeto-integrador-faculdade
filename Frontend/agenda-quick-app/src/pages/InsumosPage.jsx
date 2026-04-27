import { useState, useEffect, useRef } from 'react';
import '../components/TableComponents.css';

export default function InsumosPage({ onToast }) {
  const [insumos, setInsumos] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchInsumos = () => {
    fetch('http://localhost:8000/api/insumos')
      .then(res => res.json())
      .then(data => setInsumos(data))
      .catch(err => onToast('Erro ao carregar insumos', 'error'));
  };

  useEffect(() => { fetchInsumos(); }, []);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === insumos.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(insumos.map(p => p.id)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      categoria_id: parseInt(formData.get('categoria_id') || 1, 10),
      unidade_medida: formData.get('unidade_medida'),
      quantidade: parseInt(formData.get('quantidade') || 0, 10),
      ativo: formData.get('ativo') === 'on'
    };

    const method = editingInsumo ? 'PUT' : 'POST';
    const url = editingInsumo 
      ? `http://localhost:8000/api/insumos/${editingInsumo.id}`
      : `http://localhost:8000/api/insumos`;

    try {
      const resp = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        onToast(`Insumo salvo com sucesso!`, 'success');
        setIsModalOpen(false);
        fetchInsumos();
        setSelectedIds(new Set());
      } else {
        onToast('Erro ao salvar insumo', 'error');
      }
    } catch (e) { onToast('Erro de conexão', 'error'); }
  };

  const handleDelete = async () => {
    try {
        for (let id of selectedIds) {
            await fetch(`http://localhost:8000/api/insumos/${id}`, { method: 'DELETE' });
        }
        onToast('Insumos removidos', 'success');
        setSelectedIds(new Set());
        fetchInsumos();
    } catch {
        onToast('Erro ao remover', 'error');
    }
  };

  const openEdit = () => {
      const id = Array.from(selectedIds)[0];
      const p = insumos.find(x => x.id === id);
      if(p) {
          setEditingInsumo(p);
          setIsModalOpen(true);
      }
  };

  const openNew = () => {
      setEditingInsumo(null);
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
             // CSV: nome,categoria_id,unidade_medida,quantidade
             const parsed = lines.map(line => {
                 const cols = line.split(',');
                 return { 
                     nome: cols[0]?.trim(), 
                     categoria_id: parseInt(cols[1]?.trim()||1, 10), 
                     unidade_medida: cols[2]?.trim()||'unidade',
                     quantidade: parseInt(cols[3]?.trim()||0, 10),
                     ativo: true
                  };
             });
             if(parsed[0].nome && parsed[0].nome.toLowerCase() === 'nome') parsed.shift();

             const resp = await fetch('http://localhost:8000/api/insumos/bulk', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(parsed)
             });
             if(resp.ok) {
                 onToast('Insumos importados c/ sucesso via CSV!', 'success');
                 fetchInsumos();
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
            <h2 className="saas-title">Insumos Orders</h2>
            <span className="saas-badge">{insumos.length}</span>
        </div>
        <div className="saas-actions">
            <input type="text" className="saas-search" placeholder="Filtre insumos..." />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
            <button className="saas-btn saas-btn-outline" onClick={() => fileInputRef.current.click()}>📄 Upload CSV</button>
            <button className="saas-btn" onClick={openNew}>+ New Insumo</button>
        </div>
      </div>
      
      <div className="saas-table-wrapper">
        <table className="saas-table">
          <thead>
            <tr>
              <th className="saas-checkbox-cell">
                <input type="checkbox" className="custom-checkbox" 
                   onChange={toggleSelectAll} 
                   checked={insumos.length > 0 && selectedIds.size === insumos.length} />
              </th>
              <th>Cód. Insumo</th>
              <th>Nome do Produto</th>
              <th>Quantidade</th>
              <th>Status</th>
              <th>UX / Medida</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map(p => {
                const isSelected = selectedIds.has(p.id);
                return (
              <tr key={p.id} className={isSelected ? 'selected' : ''} onClick={() => toggleSelect(p.id)}>
                <td className="saas-checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} />
                </td>
                <td style={{ color: '#94a3b8' }}>#{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.nome}</td>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{p.quantidade || 0}</td>
                <td>
                    {p.ativo ? 
                     <div className="status-pill blue"><span className="status-dot blue"></span> Ativo</div> :
                     <div className="status-pill yellow"><span className="status-dot yellow"></span> Desativado</div>}
                </td>
                <td style={{ color: '#94a3b8' }}>{p.unidade_medida || 'un'}</td>
              </tr>
            )})}
            {insumos.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum insumo encontrado.</td></tr>
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
                      {editingInsumo ? 'Editar Insumo' : 'New Insumo'}
                      <button onClick={() => setIsModalOpen(false)} style={{ background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
                  </div>
                  <form onSubmit={handleSave}>
                      <div className="modal-body">
                          <div className="form-group">
                              <label>Nome do Produto (Insumo)</label>
                              <input name="nome" required defaultValue={editingInsumo?.nome || ''} />
                          </div>
                          <div className="form-group">
                              <label>Quantidade em Estoque</label>
                              <input name="quantidade" type="number" defaultValue={editingInsumo?.quantidade || 0} />
                          </div>
                          <div className="form-group">
                              <label>Categoria (ID)</label>
                              <input name="categoria_id" type="number" defaultValue={editingInsumo?.categoria_id || 1} />
                          </div>
                          <div className="form-group">
                              <label>Unidade de Medida (ex: CX, L, UN)</label>
                              <input name="unidade_medida" defaultValue={editingInsumo?.unidade_medida || 'unidade'} />
                          </div>
                          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <input name="ativo" type="checkbox" className="custom-checkbox" defaultChecked={editingInsumo ? editingInsumo.ativo : true} />
                              <label>Item Ativo no Estoque</label>
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
