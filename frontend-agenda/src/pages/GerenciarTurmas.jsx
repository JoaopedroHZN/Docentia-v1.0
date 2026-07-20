import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SelectCursos from '../components/SelectCursos';

export default function GerenciarTurmas({ token }) {
  const [turmas, setTurmas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const [codigo, setCodigo] = useState('');
  const [curso, setCurso] = useState('');
  const [turnoPadrao, setTurnoPadrao] = useState('MATUTINO');
  const [periodoLetivo, setPeriodoLetivo] = useState('');
  const [ativo, setAtivo] = useState(true);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const carregar = useCallback(async (pg = 0) => {
    try {
      const endpoint = termoBusca
        ? `/turmas/buscar?termo=${encodeURIComponent(termoBusca)}`
        : `/turmas?page=${pg}&size=10`;
      const resp = await api.get(endpoint, headers);
      if (Array.isArray(resp.data)) { setTurmas(resp.data); setTotalPaginas(1); }
      else { setTurmas(resp.data.content || []); setTotalPaginas(resp.data.totalPages || 1); setPagina(resp.data.number || 0); }
    } catch { toast.error('Erro ao carregar turmas.'); }
  }, [termoBusca, token]);

  useEffect(() => { carregar(pagina); }, [pagina, termoBusca]);

  const abrirNovo = () => { setEditando(null); setCodigo(''); setCurso(''); setTurnoPadrao('MATUTINO'); setPeriodoLetivo(''); setAtivo(true); setMostrarModal(true); };
  const abrirEdicao = (t) => { setEditando(t); setCodigo(t.codigo); setCurso(t.curso); setTurnoPadrao(t.turnoPadrao); setPeriodoLetivo(t.periodoLetivo); setAtivo(t.ativo); setMostrarModal(true); };

  const salvar = async (e) => {
    e.preventDefault();
    const dados = { codigo, curso, turnoPadrao, periodoLetivo, ativo };
    try {
      if (editando) { await api.put(`/turmas/${editando.id}`, dados, headers); toast.success('Turma atualizada!'); }
      else { await api.post('/turmas', dados, headers); toast.success('Turma cadastrada!'); }
      setMostrarModal(false); carregar(pagina);
    } catch (err) { toast.error(err.response?.data?.mensagem || 'Erro ao salvar.'); }
  };

  const excluir = async (id, cod) => {
    if (!window.confirm(`Excluir turma "${cod}"?`)) return;
    try { await api.delete(`/turmas/${id}`, headers); toast.success('Turma removida.'); carregar(pagina); }
    catch { toast.error('Erro ao excluir.'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div><h2 style={{ fontSize: '22px', fontWeight: 700 }}>Gerenciar Turmas</h2><p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Cadastro e gestão de turmas</p></div>
        <button className="btn" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }} onClick={abrirNovo}>+ Nova Turma</button>
      </div>
      <div className="card" style={{ marginBottom: 20, padding: '16px 28px' }}>
        <input type="text" placeholder="Buscar turma por código..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPagina(0); }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none' }} />
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table"><thead><tr><th>Código</th><th>Curso</th><th>Turno</th><th>Período Letivo</th><th>Status</th><th style={{ textAlign: 'center', width: 140 }}>Ações</th></tr></thead>
            <tbody>
              {turmas.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>Nenhuma turma encontrada.</td></tr> :
                turmas.map(t => (<tr key={t.id}><td style={{ fontWeight: 600 }}>{t.codigo}</td><td>{t.curso}</td><td>{t.turnoPadrao}</td><td>{t.periodoLetivo}</td><td><span className={`badge ${t.ativo ? 'badge-success' : 'badge-neutral'}`}>{t.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions">
                      <button onClick={() => abrirEdicao(t)} className="btn-table-edit">Editar</button>
                      <button onClick={() => excluir(t.id, t.codigo)} className="btn-table-delete">Excluir</button>
                    </div>
                  </td></tr>))}
            </tbody></table>
          {!termoBusca && totalPaginas > 1 && (<div className="pagination"><span className="pagination-info">Página {pagina + 1} de {totalPaginas}</span><div className="pagination-buttons"><button onClick={() => setPagina(p => p - 1)} disabled={pagina === 0} className="pagination-btn">Anterior</button><button onClick={() => setPagina(p => p + 1)} disabled={pagina + 1 >= totalPaginas} className="pagination-btn">Próxima</button></div></div>)}
        </div>
      </div>
      {mostrarModal && (<div className="backdrop" onClick={() => setMostrarModal(false)}><div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}><h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{editando ? 'Editar Turma' : 'Nova Turma'}</h3>
            <form onSubmit={salvar}><div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group"><label>Código da Turma</label><input required value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: APE.2026.100" /></div>
              <div className="input-group"><label>Curso Vinculado</label><SelectCursos token={token} value={curso} onChange={setCurso} /></div>
              <div className="input-group"><label>Turno Padrão</label><select value={turnoPadrao} onChange={e => setTurnoPadrao(e.target.value)}><option>MATUTINO</option><option>VESPERTINO</option><option>NOTURNO</option></select></div>
              <div className="input-group"><label>Período Letivo</label><input required value={periodoLetivo} onChange={e => setPeriodoLetivo(e.target.value)} placeholder="Ex: 2026.1" /></div>
              <div className="input-group"><label>Status</label><select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}><option value="true">Ativo</option><option value="false">Inativo</option></select></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}><button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editando ? 'Salvar' : 'Cadastrar'}</button></div></form></div></div>)}
    </div>
  );
}