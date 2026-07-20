import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function GerenciarSalas({ token }) {
  const [salas, setSalas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [tipo, setTipo] = useState('Sala de Aula');
  const [ativo, setAtivo] = useState(true);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const carregar = useCallback(async (pg = 0) => {
    try {
      const endpoint = termoBusca
        ? `/salas/buscar?termo=${encodeURIComponent(termoBusca)}`
        : `/salas?page=${pg}&size=10`;
      const resp = await api.get(endpoint, headers);
      if (Array.isArray(resp.data)) {
        setSalas(resp.data);
        setTotalPaginas(1);
      } else {
        setSalas(resp.data.content || []);
        setTotalPaginas(resp.data.totalPages || 1);
        setPagina(resp.data.number || 0);
      }
    } catch {
      toast.error('Erro ao carregar salas.');
    }
  }, [termoBusca, token]);

  useEffect(() => { carregar(pagina); }, [pagina, termoBusca]);

  const abrirNovo = () => {
    setEditando(null);
    setNome('');
    setCapacidade('');
    setTipo('Sala de Aula');
    setAtivo(true);
    setMostrarModal(true);
  };

  const abrirEdicao = (s) => {
    setEditando(s);
    setNome(s.nome);
    setCapacidade(String(s.capacidade || ''));
    setTipo(s.tipo);
    setAtivo(s.ativo);
    setMostrarModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const dados = { nome, capacidade: Number(capacidade), tipo, ativo };
    try {
      if (editando) {
        await api.put(`/salas/${editando.id}`, dados, headers);
        toast.success('Sala atualizada!');
      } else {
        await api.post('/salas', dados, headers);
        toast.success('Sala cadastrada!');
      }
      setMostrarModal(false);
      carregar(pagina);
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar sala.');
    }
  };

  const excluir = async (id, nomeSala) => {
    if (!window.confirm(`Excluir "${nomeSala}"?`)) return;
    try {
      await api.delete(`/salas/${id}`, headers);
      toast.success('Sala removida.');
      carregar(pagina);
    } catch { toast.error('Erro ao excluir.'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Gerenciar Salas</h2>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Cadastro e gestão de salas e laboratórios</p>
        </div>
        <button className="btn" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }} onClick={abrirNovo}>+ Nova Sala</button>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '16px 28px' }}>
        <input type="text" placeholder="Buscar sala por nome..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPagina(0); }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none' }} />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Capacidade</th>
                <th>Tipo</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', width: 130 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {salas.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>Nenhuma sala encontrada.</td></tr>
              ) : (
                salas.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.nome}</td>
                    <td>{s.capacidade} alunos</td>
                    <td>{s.tipo}</td>
                    <td><span className={`badge ${s.ativo ? 'badge-success' : 'badge-neutral'}`}>{s.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions">
                        <button onClick={() => abrirEdicao(s)} className="btn-table-edit">Editar</button>
                        <button onClick={() => excluir(s.id, s.nome)} className="btn-table-delete">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!termoBusca && totalPaginas > 1 && (
            <div className="pagination">
              <span className="pagination-info">Página {pagina + 1} de {totalPaginas}</span>
              <div className="pagination-buttons">
                <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 0} className="pagination-btn">Anterior</button>
                <button onClick={() => setPagina(p => p + 1)} disabled={pagina + 1 >= totalPaginas} className="pagination-btn">Próxima</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="backdrop" onClick={() => setMostrarModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{editando ? 'Editar Sala' : 'Nova Sala'}</h3>
            <form onSubmit={salvar}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group"><label>Nome / Número</label><input required value={nome} onChange={e => setNome(e.target.value)} /></div>
                <div className="input-group"><label>Capacidade (alunos)</label><input type="number" required min={1} value={capacidade} onChange={e => setCapacidade(e.target.value)} /></div>
                <div className="input-group">
                  <label>Tipo de Sala</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option>Sala de Aula</option>
                    <option>Laboratório</option>
                    <option>Auditório</option>
                    <option>Oficina</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editando ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}