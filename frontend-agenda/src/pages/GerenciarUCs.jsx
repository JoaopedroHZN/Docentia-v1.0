import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SelectCursos from '../components/SelectCursos';

export default function GerenciarUCs({ token }) {
  const [ucs, setUcs] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [curso, setCurso] = useState('');
  const [ativo, setAtivo] = useState(true);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const carregar = useCallback(async (pg = 0) => {
    try {
      const endpoint = termoBusca ? `/ucs/buscar?termo=${encodeURIComponent(termoBusca)}` : `/ucs?page=${pg}&size=10`;
      const resp = await api.get(endpoint, headers);
      if (Array.isArray(resp.data)) { setUcs(resp.data); setTotalPaginas(1); }
      else { setUcs(resp.data.content || []); setTotalPaginas(resp.data.totalPages || 1); setPagina(resp.data.number || 0); }
    } catch { toast.error('Erro ao carregar UCs.'); }
  }, [termoBusca, token]);
  useEffect(() => { carregar(pagina); }, [pagina, termoBusca]);

  const abrirNovo = () => { setEditando(null); setNome(''); setCargaHoraria(''); setCurso(''); setAtivo(true); setMostrarModal(true); };
  const abrirEdicao = (u) => { setEditando(u); setNome(u.nome); setCargaHoraria(String(u.cargaHoraria || '')); setCurso(u.curso); setAtivo(u.ativo); setMostrarModal(true); };
  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) { await api.put(`/ucs/${editando.id}`, { nome, cargaHoraria: Number(cargaHoraria) || 0, curso, ativo }, headers); toast.success('UC atualizada!'); }
      else { await api.post('/ucs', { nome, cargaHoraria: Number(cargaHoraria) || 0, curso, ativo }, headers); toast.success('UC cadastrada!'); }
      setMostrarModal(false); carregar(pagina);
    } catch (err) { toast.error(err.response?.data?.mensagem || 'Erro ao salvar.'); }
  };
  const excluir = async (id, nomeUc) => { if (!window.confirm(`Excluir "${nomeUc}"?`)) return; try { await api.delete(`/ucs/${id}`, headers); toast.success('UC removida.'); carregar(pagina); } catch { toast.error('Erro ao excluir.'); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><div><h2 style={{ fontSize: '22px', fontWeight: 700 }}>Gerenciar UCs</h2><p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Unidades Curriculares</p></div><button className="btn" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }} onClick={abrirNovo}>+ Nova UC</button></div>
      <div className="card" style={{ marginBottom: 20, padding: '16px 28px' }}><input type="text" placeholder="Buscar UC por nome..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPagina(0); }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none' }} /></div>
      <div className="card"><div className="table-container"><table className="table"><thead><tr><th>Nome</th><th>Carga Horária</th><th>Curso</th><th>Status</th><th style={{ textAlign: 'center', width: 140 }}>Ações</th></tr></thead><tbody>{ucs.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>Nenhuma UC encontrada.</td></tr> : ucs.map(u => (<tr key={u.id}><td style={{ fontWeight: 500 }}>{u.nome}</td><td>{u.cargaHoraria}h</td><td>{u.curso}</td><td><span className={`badge ${u.ativo ? 'badge-success' : 'badge-neutral'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td><td style={{ textAlign: 'center' }}><div className="table-actions"><button onClick={() => abrirEdicao(u)} className="btn-table-edit">Editar</button><button onClick={() => excluir(u.id, u.nome)} className="btn-table-delete">Excluir</button></div></td></tr>))}</tbody></table>{!termoBusca && totalPaginas > 1 && (<div className="pagination"><span className="pagination-info">Página {pagina + 1} de {totalPaginas}</span><div className="pagination-buttons"><button onClick={() => setPagina(p => p - 1)} disabled={pagina === 0} className="pagination-btn">Anterior</button><button onClick={() => setPagina(p => p + 1)} disabled={pagina + 1 >= totalPaginas} className="pagination-btn">Próxima</button></div></div>)}</div></div>
      {mostrarModal && (<div className="backdrop" onClick={() => setMostrarModal(false)}><div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}><h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{editando ? 'Editar UC' : 'Nova UC'}</h3><form onSubmit={salvar}><div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><div className="input-group"><label>Nome da UC</label><input required value={nome} onChange={e => setNome(e.target.value)} /></div><div className="input-group"><label>Carga Horária (horas)</label><input type="number" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)} /></div><div className="input-group"><label>Curso</label><SelectCursos token={token} value={curso} onChange={setCurso} /></div><div className="input-group"><label>Status</label><select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}><option value="true">Ativo</option><option value="false">Inativo</option></select></div></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}><button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editando ? 'Salvar' : 'Cadastrar'}</button></div></form></div></div>)}
    </div>
  );
}