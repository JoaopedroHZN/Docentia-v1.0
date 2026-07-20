import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function GerenciarUsuarios({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('INSTRUTOR');

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const carregar = async (pg = 0) => {
    try {
      const resp = await api.get(`/instrutores?page=${pg}&size=10`, headers);
      const dados = resp.data;
      let lista = dados.content || dados || [];
      if (termoBusca) lista = lista.filter(u => u.nome.toLowerCase().includes(termoBusca.toLowerCase()) || u.email.toLowerCase().includes(termoBusca.toLowerCase()));
      setUsuarios(lista);
      setTotalPaginas(dados.totalPages || 1);
      setPagina(dados.number || 0);
    } catch { toast.error('Erro ao carregar usuários.'); }
  };

  useEffect(() => { carregar(pagina); }, [pagina, termoBusca]);

  const abrirNovo = () => { setEditando(null); setNome(''); setEmail(''); setPerfil('INSTRUTOR'); setMostrarModal(true); };
  const abrirEdicao = (u) => { setEditando(u); setNome(u.nome); setEmail(u.email); setPerfil(u.perfil); setMostrarModal(true); };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/instrutores/${editando.id}`, { nome, email, perfil, senha: '' }, headers);
        toast.success('Usuário atualizado!');
      } else {
        await api.post('/instrutores', { nome, email, senha: '', perfil }, headers);
        toast.success('Usuário cadastrado! O primeiro acesso definirá a senha.');
      }
      setMostrarModal(false); carregar(pagina);
    } catch (err) {
      const msg = err.response?.data || 'Erro ao salvar.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const excluir = async (id, nomeU) => {
    if (!window.confirm(`Excluir "${nomeU}"?`)) return;
    try { await api.delete(`/instrutores/${id}`, headers); toast.success('Usuário removido.'); carregar(pagina); }
    catch { toast.error('Erro ao excluir.'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><div><h2 style={{ fontSize: '22px', fontWeight: 700 }}>Gerenciar Usuários</h2><p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Controle de acesso ao sistema</p></div><button className="btn" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }} onClick={abrirNovo}>+ Novo Usuário</button></div>
      <div className="card" style={{ marginBottom: 20, padding: '16px 28px' }}><input type="text" placeholder="Buscar por nome ou e-mail..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPagina(0); }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none' }} /></div>
      <div className="card"><div className="table-container"><table className="table"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th style={{ textAlign: 'center', width: 130 }}>Ações</th></tr></thead><tbody>{usuarios.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>Nenhum usuário encontrado.</td></tr> : usuarios.map(u => (<tr key={u.id}><td style={{ fontWeight: 500 }}>{u.nome}</td><td>{u.email}</td><td><span className={`badge ${u.perfil === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>{u.perfil === 'ADMIN' ? 'Administrador' : 'Docente'}</span></td><td style={{ textAlign: 'center' }}><div className="table-actions"><button onClick={() => abrirEdicao(u)} className="btn-table-edit">Editar</button><button onClick={() => excluir(u.id, u.nome)} className="btn-table-delete">Excluir</button></div></td></tr>))}</tbody></table>
          {totalPaginas > 1 && (<div className="pagination"><span className="pagination-info">Página {pagina + 1} de {totalPaginas}</span><div className="pagination-buttons"><button onClick={() => setPagina(p => p - 1)} disabled={pagina === 0} className="pagination-btn">Anterior</button><button onClick={() => setPagina(p => p + 1)} disabled={pagina + 1 >= totalPaginas} className="pagination-btn">Próxima</button></div></div>)}
        </div></div>
      {mostrarModal && (<div className="backdrop" onClick={() => setMostrarModal(false)}><div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}><h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h3><form onSubmit={salvar}><div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><div className="input-group"><label>Nome Completo</label><input required value={nome} onChange={e => setNome(e.target.value)} /></div><div className="input-group"><label>E-mail Corporativo</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div><div className="input-group"><label>Perfil de Acesso</label><select value={perfil} onChange={e => setPerfil(e.target.value)}><option value="INSTRUTOR">Docente</option><option value="ADMIN">Administrador</option></select></div></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}><button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editando ? 'Salvar' : 'Cadastrar'}</button></div></form></div></div>)}
    </div>
  );
}