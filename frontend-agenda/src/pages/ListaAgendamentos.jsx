import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ListaAgendamentos({ token }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);

  // Estados do formulário de edição
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horario, setHorario] = useState('');
  const [turno, setTurno] = useState('MATUTINO');
  const [curso, setCurso] = useState('');
  const [turma, setTurma] = useState('');
  const [unidadeCurricular, setUnidadeCurricular] = useState('');
  const [sala, setSala] = useState('');
  const [instrutorId, setInstrutorId] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [docentes, setDocentes] = useState([]);

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const carregarDocentes = async () => {
    try {
      const resp = await api.get('/instrutores?page=0&size=100', authHeaders);
      const lista = resp.data.content || resp.data;
      const apenasInstrutores = lista.filter((d) => d.perfil !== 'ADMIN');
      setDocentes(apenasInstrutores);
    } catch (error) {
      console.error('Erro ao buscar docentes:', error);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const resp = await api.get('/agendamentos?page=0&size=50', authHeaders);
      setAgendamentos(resp.data.content || resp.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Não foi possível carregar a grade geral de aulas.');
    }
  };

  useEffect(() => {
    carregarDocentes();
    carregarAgendamentos();
  }, []);

  // Preparar formulário para edição
  const handleIniciarEdicao = (aula) => {
    setAgendamentoEditando(aula);
    setDataInicio(aula.dataInicio);
    setDataFim(aula.dataFim);
    setHorario(aula.horario);
    setTurno(aula.turno);
    setCurso(aula.curso);
    setTurma(aula.turma || '');
    setUnidadeCurricular(aula.unidadeCurricular);
    setSala(aula.sala);
    setObservacoes(aula.observacoes || '');
    setInstrutorId(aula.instrutor ? aula.instrutor.id : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFormulario = () => {
    setAgendamentoEditando(null);
    setCurso('');
    setTurma('');
    setUnidadeCurricular('');
    setSala('');
    setObservacoes('');
    setHorario('');
    setDataInicio('');
    setDataFim('');
    setTurno('MATUTINO');
  };

  // Handler unificado para salvar (apenas Edição)
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    const dados = {
      curso,
      turma,
      unidadeCurricular,
      dataInicio,
      dataFim,
      turno,
      sala,
      horario,
      observacoes,
      instrutor: { id: Number(instrutorId) },
    };

    try {
      await api.put(`/agendamentos/${agendamentoEditando.id}`, dados, authHeaders);
      toast.success('Agendamento atualizado com sucesso!');
      limparFormulario();
      carregarAgendamentos();
    } catch (error) {
      const erroData = error.response?.data;
      let mensagem = 'Erro ao salvar agendamento.';
      if (erroData) {
        if (typeof erroData === 'string') mensagem = erroData;
        else if (erroData.mensagem) mensagem = erroData.mensagem;
      }
      toast.error(mensagem);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Confirma a exclusão deste agendamento?')) return;
    try {
      await api.delete(`/agendamentos/${id}`, authHeaders);
      toast.success('Agendamento removido.');
      carregarAgendamentos();
    } catch (error) {
      toast.error('Não foi possível excluir.');
    }
  };

  // Formata data para exibição
  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  return (
    <div>
      {/* Cabeçalho com botão Novo Agendamento */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Agendamentos</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Grade geral de agendamentos de turmas
          </p>
        </div>
        <Link to="/agendamentos/novo" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          Novo Agendamento
        </Link>
      </div>

      {/* Card de Edição (aparece quando está editando) */}
      {agendamentoEditando && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2>Editando Agendamento</h2>
          </div>
          <form onSubmit={handleSalvarEdicao}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group"><label>Curso</label><input type="text" required value={curso} onChange={(e) => setCurso(e.target.value)} /></div>
              <div className="input-group"><label>Turma (código)</label><input type="text" required value={turma} onChange={(e) => setTurma(e.target.value)} /></div>
              <div className="input-group"><label>Unidade Curricular</label><input type="text" required value={unidadeCurricular} onChange={(e) => setUnidadeCurricular(e.target.value)} /></div>
              <div className="input-group">
                <label>Professor</label>
                <select value={instrutorId} onChange={(e) => setInstrutorId(e.target.value)} required>
                  <option value="">Selecione</option>
                  {docentes.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group"><label>Data Início</label><input type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
              <div className="input-group"><label>Data Fim</label><input type="date" required value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
              <div className="input-group">
                <label>Turno</label>
                <select value={turno} onChange={(e) => setTurno(e.target.value)}>
                  <option value="MATUTINO">Matutino</option>
                  <option value="VESPERTINO">Vespertino</option>
                  <option value="NOTURNO">Noturno</option>
                </select>
              </div>
              <div className="input-group"><label>Sala</label><input type="text" required value={sala} onChange={(e) => setSala(e.target.value)} /></div>
              <div className="input-group"><label>Horário</label><input type="text" required value={horario} onChange={(e) => setHorario(e.target.value)} /></div>
            </div>
            <div className="input-group" style={{ marginTop: '16px' }}>
              <label>Observações</label>
              <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-secondary" onClick={limparFormulario}>Cancelar Edição</button>
              <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de Agendamentos */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Horário</th>
                <th>Turno</th>
                <th>Professor</th>
                <th>Curso</th>
                <th>Turma</th>
                <th>UC</th>
                <th>Sala</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                agendamentos.map((aula) => (
                  <tr key={aula.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {formatarData(aula.dataInicio)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        até {formatarData(aula.dataFim)}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px' }}>{aula.horario}</td>
                    <td>
                      <span className="badge badge-neutral">{aula.turno}</span>
                    </td>
                    <td>{aula.instrutor?.nome}</td>
                    <td style={{ fontWeight: 500 }}>{aula.curso}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{aula.turma || '—'}</td>
                    <td>{aula.unidadeCurricular}</td>
                    <td>{aula.sala}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions">
                        <button onClick={() => handleIniciarEdicao(aula)} className="btn-table-edit">Editar</button>
                        <button onClick={() => handleExcluir(aula.id)} className="btn-table-delete">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}