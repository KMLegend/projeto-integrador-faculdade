import { useState, useEffect } from 'react';
import '../components/TableComponents.css';

export default function UsuariosPage({ onToast, token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [userType, setUserType] = useState('tecnico');

  const fetchUsuarios = () => {
    fetch('http://localhost:8000/api/v2/usuarios', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => onToast('Erro ao carregar usuários', 'error'));
  };

  const fetchFiliais = () => {
    fetch('http://localhost:8000/api/v2/filiais', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFiliais(data))
      .catch(err => onToast('Erro ao carregar filiais', 'error'));
  };

  useEffect(() => { 
    fetchUsuarios(); 
    fetchFiliais();
  }, []);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === usuarios.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(usuarios.map(u => u.id)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      tipo: formData.get('tipo'),
      crm: formData.get('tipo') === 'medico' ? formData.get('crm') : null,
      filial_id: parseInt(formData.get('filial_id'), 10),
      ativo: formData.get('ativo') === 'on'
    };

    const password = formData.get('password');
    if (password) {
        data.password = password;
    }

    const method = editingUsuario ? 'PUT' : 'POST';
    const url = editingUsuario 
      ? `http://localhost:8000/api/v2/usuarios/${editingUsuario.id}`
      : `http://localhost:8000/api/v2/usuarios`;

    try {
      const resp = await fetch(url, {
        method, 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        onToast(`Usuário ${editingUsuario ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        setIsModalOpen(false);
        fetchUsuarios();
        setSelectedIds(new Set());
      } else {
        const err = await resp.json();
        onToast(err.detail || 'Erro ao salvar usuário', 'error');
      }
    } catch (e) { onToast('Erro de conexão', 'error'); }
  };

  const handleDelete = async () => {
    try {
        for (let id of selectedIds) {
            await fetch(`http://localhost:8000/api/v2/usuarios/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        onToast('Usuários desativados', 'success');
        setSelectedIds(new Set());
        fetchUsuarios();
    } catch {
        onToast('Erro ao remover', 'error');
    }
  };

  const openEdit = () => {
      const id = Array.from(selectedIds)[0];
      const u = usuarios.find(x => x.id === id);
      if(u) {
          setEditingUsuario(u);
          setUserType(u.tipo);
          setIsModalOpen(true);
      }
  };

  const openNew = () => {
      setEditingUsuario(null);
      setUserType('tecnico');
      setIsModalOpen(true);
  };

  return (
    <div className="saas-container">
      <div className="saas-header">
        <div className="saas-title-group">
            <h2 className="saas-title">Usuários</h2>
            <span className="saas-badge">{usuarios.length}</span>
        </div>
        <div className="saas-actions">
            <input type="text" className="saas-search" placeholder="Filtre usuários..." />
            <button className="saas-btn" onClick={openNew}>+ Novo Usuário</button>
        </div>
      </div>
      
      <div className="saas-table-wrapper">
        <table className="saas-table">
          <thead>
            <tr>
              <th className="saas-checkbox-cell">
                <input type="checkbox" className="custom-checkbox" 
                   onChange={toggleSelectAll} 
                   checked={usuarios.length > 0 && selectedIds.size === usuarios.length} />
              </th>
              <th>Order #</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Filial</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => {
                const isSelected = selectedIds.has(u.id);
                const filialNome = filiais.find(f => f.id === u.filial_id)?.nome || 'N/A';
                return (
              <tr key={u.id} className={isSelected ? 'selected' : ''} onClick={() => toggleSelect(u.id)}>
                <td className="saas-checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(u.id)} />
                </td>
                <td style={{ color: '#94a3b8' }}>#USR-00{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                    <span className={`saas-badge ${u.tipo === 'administrador' ? 'danger' : u.tipo === 'medico' ? 'primary' : 'info'}`}>
                        {u.tipo.toUpperCase()}
                    </span>
                </td>
                <td>{filialNome}</td>
                <td>
                    <span style={{ color: u.ativo ? '#10b981' : '#ef4444' }}>
                        {u.ativo ? '● Ativo' : '○ Inativo'}
                    </span>
                </td>
              </tr>
            )})}
            {usuarios.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Nenhum usuário.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
          <div className="floating-action-bar">
              <span className="fab-count">{selectedIds.size}</span>
              <span>items selecionados</span>
              <div className="fab-divider"></div>
              {selectedIds.size === 1 && (
                <button className="fab-btn" onClick={openEdit}>✎ Editar</button>
              )}
              <button className="fab-btn danger" onClick={handleDelete}>🗑 Desativar</button>
          </div>
      )}

      {isModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <div className="modal-header">
                      {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                      <button onClick={() => setIsModalOpen(false)} style={{ background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
                  </div>
                  <form onSubmit={handleSave}>
                      <div className="modal-body">
                          <div className="form-group">
                              <label>Nome Completo</label>
                              <input name="nome" required defaultValue={editingUsuario?.nome || ''} />
                          </div>
                          <div className="form-group">
                              <label>E-mail</label>
                              <input name="email" type="email" required defaultValue={editingUsuario?.email || ''} />
                          </div>
                          <div className="form-group">
                              <label>Senha {editingUsuario && '(deixe em branco para manter)'}</label>
                              <input name="password" type="password" required={!editingUsuario} />
                          </div>
                          <div className="form-row">
                              <div className="form-group">
                                  <label>Tipo de Perfil</label>
                                  <select name="tipo" value={userType} onChange={e => setUserType(e.target.value)}>
                                      <option value="administrador">Administrador</option>
                                      <option value="medico">Médico</option>
                                      <option value="enfermeiro">Enfermeiro</option>
                                      <option value="tecnico">Técnico</option>
                                  </select>
                              </div>
                              <div className="form-group">
                                  <label>Filial</label>
                                  <select name="filial_id" defaultValue={editingUsuario?.filial_id || filiais[0]?.id}>
                                      {filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                  </select>
                              </div>
                          </div>
                          {userType === 'medico' && (
                              <div className="form-group">
                                  <label>CRM</label>
                                  <input name="crm" required defaultValue={editingUsuario?.crm || ''} />
                              </div>
                          )}
                          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <input type="checkbox" name="ativo" defaultChecked={editingUsuario ? editingUsuario.ativo : true} />
                              <label>Usuário Ativo</label>
                          </div>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="saas-btn saas-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                          <button type="submit" className="saas-btn">Salvar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
