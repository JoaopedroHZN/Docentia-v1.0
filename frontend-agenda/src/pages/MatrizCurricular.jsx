import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MatrizCurricular({ token }) {
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [ucs, setUcs] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const carregarCursos = async () => {
      try {
        const resp = await api.get('/cursos?size=100', headers);
        setCursos(resp.data.content || resp.data || []);
      } catch { toast.error('Erro ao carregar cursos.'); }
    };
    carregarCursos();
  }, []);

  useEffect(() => {
    if (!cursoSelecionado) { setUcs([]); return; }
    const carregarUcs = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/ucs/por-curso?curso=${encodeURIComponent(cursoSelecionado)}`, headers);
        setUcs(resp.data || []);
      } catch { toast.error('Erro ao carregar UCs.'); }
      finally { setLoading(false); }
    };
    carregarUcs();
  }, [cursoSelecionado]);

  return (
    <div>
      <div className="mb-4"><h2 style={{ fontSize: '22px', fontWeight: 700 }}>Matriz Curricular</h2><p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Visualize as UCs vinculadas a cada curso</p></div>
      
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="input-group" style={{ maxWidth: 400 }}>
          <label>Selecione o Curso</label>
          <select value={cursoSelecionado} onChange={e => setCursoSelecionado(e.target.value)}>
            <option value="">-- Selecione --</option>
            {cursos.map(c => <option key={c.id} value={c.nome}>{c.nome} ({c.codigo})</option>)}
          </select>
        </div>
      </div>

      {cursoSelecionado && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Unidades Curriculares — {cursoSelecionado}</h3>
          {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> :
            ucs.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma UC vinculada a este curso.</p> :
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Nome da UC</th><th>Carga Horária</th><th>Status</th></tr></thead>
                <tbody>{ucs.map(u => (<tr key={u.id}><td style={{ fontWeight: 500 }}>{u.nome}</td><td>{u.cargaHoraria}h</td><td><span className={`badge ${u.ativo ? 'badge-success' : 'badge-neutral'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td></tr>))}</tbody>
              </table>
            </div>
          }
        </div>
      )}
    </div>
  );
}