import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function GerenciarProfessores({ token }) {
  const [instrutores, setInstrutores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // Form de cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('INSTRUTOR');
  const [curso, setCurso] = useState('');

  // Edição inline
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPerfil, setEditPerfil] = useState('INSTRUTOR');
  const [editCurso, setEditCurso] = useState('');

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const carregarCursos = async () => {
    try {
      const resp = await api.get('/cursos?size=100', authHeaders);
      setCursos(resp.data.content || resp.data || []);
    } catch { /* silencioso */ }
  };

  const carregarInstrutores = async (pagina = 0) => {
    try {
      const resposta = await api.get(`/instrutores?page=${pagina}&size=10`, authHeaders);
      const dados = resposta.data;
      setInstrutores(dados.content || dados);
      setPaginaAtual(dados.number || 0);
      setTotalPaginas(dados.totalPages || 1);
      setTotalElementos(dados.totalElements || dados.length || 0);
    } catch (error) {
      console.error('Erro ao carregar instrutores:', error);
      toast.error('Não foi possível carregar a lista de docentes.');
    }
  };

  useEffect(() => {
    carregarCursos();
    carregarInstrutores(0);
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/instrutores', { nome, email, senha: '', perfil, curso }, authHeaders);
      toast.success(`Docente ${nome} cadastrado com sucesso.`);
      setNome('');
      setEmail('');
      setPerfil('INSTRUTOR');
      setCurso('');
      carregarInstrutores(0);
    } catch (error) {
      const msg = error.response?.data || 'Erro no cadastro. Verifique se o e-mail já está em uso.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const abrirEdicao = (inst) => {
    setEditando(inst);
    setEditNome(inst.nome);
    setEditEmail(inst.email);
    setEditPerfil(inst.perfil);
    setEditCurso(inst.curso || '');
    setMostrarModal(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/instrutores/${editando.id}`, { nome: editNome, email: editEmail, perfil: editPerfil, curso: editCurso, senha: '' }, authHeaders);
      toast.success('Docente atualizado!');
      setMostrarModal(false);
      carregarInstrutores(paginaAtual);
    } catch (error) {
      const msg = error.response?.data || 'Erro ao atualizar.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleExcluir = async (id, nomeInstrutor) => {
    if (!window.confirm(`Confirma a remoção do docente ${nomeInstrutor}?`)) return;
    try {
      await api.delete(`/instrutores/${id}`, authHeaders);
      toast.success('Docente removido do sistema.');
      if (instrutores.length === 1 && paginaAtual > 0) {
        carregarInstrutores(paginaAtual - 1);
      } else {
        carregarInstrutores(paginaAtual);
      }
    } catch (error) {
      toast.error('Sem permissão para excluir ou falha de comunicação.');
    }
  };

  return (
    <div>
      {/* Card de Cadastro */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Novo Docente</h2>
          <p>
            O docente pré-cadastrado deverá utilizar a opção "Primeiro Acesso"
            no portal inicial para definir sua credencial.
          </p>
        </div>
        <form onSubmit={handleCadastrar} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div className="input-group">
            <label>Nome Completo</label>
            <input type="text" required placeholder="Ex: Carlos Silva" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="input-group">
            <label>E-mail Corporativo</label>
            <input type="email" required placeholder="carlos@gmail.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Perfil de Acesso</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              <option value="INSTRUTOR">INSTRUTOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="input-group">
            <label>Curso Vinculado</label>
            <select value={curso} onChange={(e) => setCurso(e.target.value)}>
              <option value="">-- Nenhum --</option>
              {cursos.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            Cadastrar
          </button>
        </form>
      </div>

      {/* Tabela de Docentes */}
      <div className="card">
        <div className="card-header">
          <h2>Docentes Cadastrados</h2>
          <p>Total: {totalElementos}</p>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Curso</th>
                <th>Perfil</th>
                <th style={{ textAlign: 'center', width: '140px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {instrutores.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    Nenhum docente encontrado.
                  </td>
                </tr>
              ) : (
                instrutores.map((inst) => (
                  <tr key={inst.id}>
                    <td style={{ fontWeight: 600 }}>#{inst.id}</td>
                    <td>{inst.nome}</td>
                    <td>{inst.email}</td>
                    <td>{inst.curso || '—'}</td>
                    <td>
                      <span className={`badge ${inst.perfil === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                        {inst.perfil}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions">
                        <button onClick={() => abrirEdicao(inst)} className="btn-table-edit">Editar</button>
                        <button onClick={() => handleExcluir(inst.id, inst.nome)} className="btn-table-delete">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <div className="pagination-info">
              Página {paginaAtual + 1} de {totalPaginas === 0 ? 1 : totalPaginas}
            </div>
            <div className="pagination-buttons">
              <button onClick={() => carregarInstrutores(paginaAtual - 1)} disabled={paginaAtual === 0} className="pagination-btn">
                Anterior
              </button>
              <button onClick={() => carregarInstrutores(paginaAtual + 1)} disabled={paginaAtual + 1 >= totalPaginas} className="pagination-btn">
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {mostrarModal && (
        <div className="backdrop" onClick={() => setMostrarModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Editar Docente</h3>
            <form onSubmit={salvarEdicao}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Nome Completo</label>
                  <input required value={editNome} onChange={e => setEditNome(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>E-mail Corporativo</label>
                  <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Perfil de Acesso</label>
                  <select value={editPerfil} onChange={e => setEditPerfil(e.target.value)}>
                    <option value="INSTRUTOR">Docente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Curso Vinculado</label>
                  <select value={editCurso} onChange={e => setEditCurso(e.target.value)}>
                    <option value="">-- Nenhum --</option>
                    {cursos.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}