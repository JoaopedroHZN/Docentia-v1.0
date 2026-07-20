import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function GerenciarCursos({ token }) {
  const [cursos, setCursos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  // Form
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [ativo, setAtivo] = useState(true);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const carregar = useCallback(async (pg = 0) => {
    try {
      const endpoint = termoBusca
        ? `/cursos/buscar?termo=${encodeURIComponent(termoBusca)}`
        : `/cursos?page=${pg}&size=10`;
      const resp = await api.get(endpoint, headers);
      if (Array.isArray(resp.data)) {
        setCursos(resp.data);
        setTotalPaginas(1);
      } else {
        setCursos(resp.data.content || []);
        setTotalPaginas(resp.data.totalPages || 1);
        setPagina(resp.data.number || 0);
      }
    } catch {
      toast.error('Erro ao carregar cursos.');
    }
  }, [termoBusca, token]);

  useEffect(() => { carregar(pagina); }, [pagina, termoBusca]);

  const abrirNovo = () => {
    setEditando(null);
    setNome('');
    setCodigo('');
    setCargaHoraria('');
    setAtivo(true);
    setMostrarModal(true);
  };

  const abrirEdicao = (c) => {
    setEditando(c);
    setNome(c.nome);
    setCodigo(c.codigo);
    setCargaHoraria(String(c.cargaHoraria || ''));
    setAtivo(c.ativo);
    setMostrarModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const dados = { nome, codigo, cargaHoraria: Number(cargaHoraria) || 0, ativo };
    try {
      if (editando) {
        await api.put(`/cursos/${editando.id}`, dados, headers);
        toast.success('Curso atualizado!');
      } else {
        await api.post('/cursos', dados, headers);
        toast.success('Curso cadastrado!');
      }
      setMostrarModal(false);
      carregar(pagina);
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao salvar curso.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const excluir = async (id, nomeCurso) => {
    if (!window.confirm(`Excluir o curso "${nomeCurso}"?`)) return;
    try {
      await api.delete(`/cursos/${id}`, headers);
      toast.success('Curso removido.');
      carregar(pagina);
    } catch {
      toast.error('Erro ao excluir curso.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Gerenciar Cursos</h2>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Cadastro e gestão de cursos</p>
        </div>
        <button className="btn" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }} onClick={abrirNovo}>
          + Novo Curso
        </button>
      </div>

      {/* Busca */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 28px' }}>
        <input
          type="text"
          placeholder="Buscar curso por nome..."
          value={termoBusca}
          onChange={(e) => { setTermoBusca(e.target.value); setPagina(0); }}
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Carga Horária</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', width: 130 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cursos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>Nenhum curso encontrado.</td></tr>
              ) : (
                cursos.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                    <td>{c.codigo}</td>
                    <td>{c.cargaHoraria}h</td>
                    <td>
                      <span className={`badge ${c.ativo ? 'badge-success' : 'badge-neutral'}`}>{c.ativo ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions">
                        <button onClick={() => abrirEdicao(c)} className="btn-table-edit">Editar</button>
                        <button onClick={() => excluir(c.id, c.nome)} className="btn-table-delete">Excluir</button>
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

      {/* Modal */}
      {mostrarModal && (
        <div className="backdrop" onClick={() => setMostrarModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '10vh auto', position: 'relative', zIndex: 901 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>{editando ? 'Editar Curso' : 'Novo Curso'}</h3>
            <form onSubmit={salvar}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Nome do Curso</label>
                  <input required value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Código / Sigla</label>
                  <input required value={codigo} onChange={e => setCodigo(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Carga Horária (horas)</label>
                  <input type="number" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)} />
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