import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Relatorios({ token }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [turno, setTurno] = useState('');
  const [turma, setTurma] = useState('');
  const [professor, setProfessor] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  // Dados para os dropdowns
  const [turmas, setTurmas] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // Carrega turmas e docentes ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [respTurmas, respDocentes] = await Promise.all([
          api.get('/turmas?size=100', headers),
          api.get('/instrutores?page=0&size=100', headers),
        ]);
        setTurmas((respTurmas.data.content || respTurmas.data || []).filter(t => t.ativo));
        const listaDocentes = respDocentes.data.content || respDocentes.data || [];
        setDocentes(listaDocentes.filter(d => d.perfil !== 'ADMIN'));
      } catch { /* silencioso */ }
    };
    carregarDados();
  }, []);

  const buscar = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const resp = await api.get('/agendamentos?size=200', headers);
      let lista = resp.data.content || resp.data || [];
      if (dataInicio) lista = lista.filter(a => a.dataInicio >= dataInicio);
      if (dataFim) lista = lista.filter(a => a.dataFim <= dataFim);
      if (turno) lista = lista.filter(a => a.turno === turno);
      if (turma) lista = lista.filter(a => a.turma === turma);
      if (professor) lista = lista.filter(a => a.instrutor?.nome === professor);
      setResultados(lista);
    } catch {
      toast.error('Erro ao buscar dados para relatório.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (d) => d ? d.split('-').reverse().join('/') : '';

  const exportarCSV = () => {
    if (resultados.length === 0) { toast.error('Nenhum dado para exportar.'); return; }
    let csv = 'Período Início,Período Fim,Turno,Curso,Turma,Unidade Curricular,Sala,Professor,Horário\n';
    resultados.forEach(a => {
      csv += `${formatarData(a.dataInicio)},${formatarData(a.dataFim)},${a.turno},"${a.curso}","${a.turma || ''}","${a.unidadeCurricular}","${a.sala}","${a.instrutor?.nome || ''}",${a.horario}\n`;
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'relatorio-docentia.csv'; link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado!');
  };

  const limpar = () => {
    setDataInicio('');
    setDataFim('');
    setTurno('');
    setTurma('');
    setProfessor('');
    setResultados([]);
    setBuscou(false);
  };

  return (
    <div>
      <div className="mb-4"><h2 style={{ fontSize: '22px', fontWeight: 700 }}>Relatórios</h2><p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>Filtre e exporte os agendamentos</p></div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="input-group"><label>Data Início</label><input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></div>
          <div className="input-group"><label>Data Fim</label><input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></div>
          <div className="input-group">
            <label>Turno</label>
            <select value={turno} onChange={e => setTurno(e.target.value)}>
              <option value="">Todos</option>
              <option>MATUTINO</option>
              <option>VESPERTINO</option>
              <option>NOTURNO</option>
            </select>
          </div>
          <div className="input-group">
            <label>Turma</label>
            <select value={turma} onChange={e => setTurma(e.target.value)}>
              <option value="">Todas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.codigo}>{t.codigo} — {t.curso}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Professor</label>
            <select value={professor} onChange={e => setProfessor(e.target.value)}>
              <option value="">Todos</option>
              {docentes.map(d => (
                <option key={d.id} value={d.nome}>{d.nome}{d.curso ? ` (${d.curso})` : ''}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={limpar}>Limpar</button>
          <button className="btn btn-primary" onClick={buscar} disabled={loading}>{loading ? 'Buscando...' : 'Filtrar'}</button>
          {resultados.length > 0 && <button className="btn btn-accent" onClick={exportarCSV}> Exportar CSV</button>}
        </div>
      </div>

      {/* Resultados */}
      {buscou && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{resultados.length} agendamentos encontrados</h3>
          {resultados.length === 0 ? <p className="text-muted">Nenhum agendamento encontrado com esses filtros.</p> : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Período</th><th>Turno</th><th>Curso</th><th>Turma</th><th>UC</th><th>Sala</th><th>Professor</th><th>Horário</th></tr></thead>
                <tbody>{resultados.map(a => (<tr key={a.id}><td>{formatarData(a.dataInicio)} → {formatarData(a.dataFim)}</td><td><span className="badge badge-neutral">{a.turno}</span></td><td style={{ fontWeight: 500 }}>{a.curso}</td><td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{a.turma || '—'}</td><td>{a.unidadeCurricular}</td><td>{a.sala}</td><td>{a.instrutor?.nome}</td><td>{a.horario}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}