import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NovoAgendamento({ token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Dados auxiliares
  const [docentes, setDocentes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [ucsDoCurso, setUcsDoCurso] = useState([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState([]);

  // Estados do formulário
  const [turmaId, setTurmaId] = useState('');
  const [curso, setCurso] = useState('');
  const [unidadeCurricular, setUnidadeCurricular] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [turno, setTurno] = useState('MATUTINO');
  const [sala, setSala] = useState('');
  const [instrutorId, setInstrutorId] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const carregarDocentes = async () => {
    try {
      const resp = await api.get('/instrutores?page=0&size=100', authHeaders);
      const lista = resp.data.content || resp.data;
      setDocentes(lista.filter((d) => d.perfil !== 'ADMIN'));
    } catch (error) {
      console.error('Erro ao buscar docentes:', error);
    }
  };

  const carregarTurmas = async () => {
    try {
      const resp = await api.get('/turmas?size=100', authHeaders);
      const lista = resp.data.content || resp.data || [];
      setTurmas(lista.filter(t => t.ativo));
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  useEffect(() => {
    carregarDocentes();
    carregarTurmas();
  }, []);

  // Carrega salas disponíveis quando turno ou datas mudam
  const carregarSalasDisponiveis = useCallback(async () => {
    if (!dataInicio || !dataFim) {
      // Sem datas, carrega todas as salas ativas
      try {
        const resp = await api.get('/salas?size=100', authHeaders);
        const todas = resp.data.content || resp.data || [];
        setSalasDisponiveis(todas.filter(s => s.ativo));
      } catch { setSalasDisponiveis([]); }
      return;
    }
    try {
      const resp = await api.get(
        `/salas/disponiveis?turno=${turno}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
        authHeaders
      );
      setSalasDisponiveis(resp.data || []);
      // Se a sala selecionada não está mais disponível, limpa
      if (sala && !(resp.data || []).some(s => s.nome === sala)) {
        setSala('');
      }
    } catch { /* silencioso */ }
  }, [turno, dataInicio, dataFim]);

  useEffect(() => {
    carregarSalasDisponiveis();
  }, [carregarSalasDisponiveis]);

  // Ao selecionar uma turma, preenche curso automaticamente
  const handleTurmaChange = async (id) => {
    setTurmaId(id);
    if (!id) {
      setCurso('');
      setUnidadeCurricular('');
      setUcsDoCurso([]);
      return;
    }
    const turmaSelecionada = turmas.find(t => String(t.id) === String(id));
    if (turmaSelecionada) {
      setCurso(turmaSelecionada.curso || '');
      try {
        const respUc = await api.get(`/ucs/por-curso?curso=${encodeURIComponent(turmaSelecionada.curso || '')}`, authHeaders);
        setUcsDoCurso(respUc.data || []);
        setUnidadeCurricular('');
      } catch { setUcsDoCurso([]); }
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    const turmaSelecionada = turmas.find(t => String(t.id) === String(turmaId));
    const codigoTurma = turmaSelecionada ? turmaSelecionada.codigo : '';

    const dados = {
      curso,
      turma: codigoTurma,
      unidadeCurricular,
      dataInicio,
      dataFim,
      turno,
      sala,
      horario,
      observacoes,
      instrutor: { id: Number(instrutorId) },
    };

    setLoading(true);
    try {
      await api.post('/agendamentos', dados, authHeaders);
      toast.success('Agendamento realizado com sucesso!');
      navigate('/agendamentos');
    } catch (error) {
      const erroData = error.response?.data;
      let mensagem = 'Erro ao salvar agendamento.';
      if (erroData) {
        if (typeof erroData === 'string') {
          mensagem = erroData;
        } else if (erroData.mensagem) {
          mensagem = erroData.mensagem;
        } else if (erroData.erro && erroData.mensagem) {
          mensagem = erroData.mensagem;
        }
      }
      toast.error(mensagem, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Novo Agendamento de Turma</h2>
          <p>Preencha os dados abaixo para agendar uma aula. As salas são filtradas por disponibilidade no período.</p>
        </div>

        <form onSubmit={handleSalvar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Turma (Select) */}
            <div className="input-group">
              <label>Turma</label>
              <select
                required
                value={turmaId}
                onChange={(e) => handleTurmaChange(e.target.value)}
              >
                <option value="">Selecione uma turma</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.codigo} — {t.curso}</option>
                ))}
              </select>
            </div>

            {/* Curso (preenchido automaticamente) */}
            <div className="input-group">
              <label>Curso (automático)</label>
              <input
                type="text"
                value={curso}
                readOnly
                style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                placeholder="Selecionado da turma"
              />
            </div>

            {/* Unidade Curricular (Select das UCs do curso) */}
            <div className="input-group">
              <label>Unidade Curricular</label>
              <select
                required
                value={unidadeCurricular}
                onChange={(e) => setUnidadeCurricular(e.target.value)}
                disabled={!turmaId}
              >
                <option value="">Selecione a UC</option>
                {ucsDoCurso.filter(uc => uc.ativo).map(uc => (
                  <option key={uc.id} value={uc.nome}>{uc.nome} ({uc.cargaHoraria}h)</option>
                ))}
              </select>
              {!turmaId && <small style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Selecione uma turma primeiro</small>}
            </div>

            {/* Data Início */}
            <div className="input-group">
              <label>Data Início / Aula</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            {/* Data Fim */}
            <div className="input-group">
              <label>Data Fim</label>
              <input
                type="date"
                required
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            {/* Turno */}
            <div className="input-group">
              <label>Turno</label>
              <select value={turno} onChange={(e) => setTurno(e.target.value)}>
                <option value="MATUTINO">Matutino</option>
                <option value="VESPERTINO">Vespertino</option>
                <option value="NOTURNO">Noturno</option>
              </select>
            </div>

            {/* Sala (Select de disponíveis) */}
            <div className="input-group">
              <label>Sala ({salasDisponiveis.length} disponíveis)</label>
              <select
                required
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                disabled={!dataInicio || !dataFim}
              >
                <option value="">Selecione uma sala</option>
                {salasDisponiveis.map(s => (
                  <option key={s.id} value={s.nome}>
                    {s.nome} — {s.tipo} ({s.capacidade} alunos)
                  </option>
                ))}
              </select>
              {(!dataInicio || !dataFim) && <small style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Informe as datas para ver disponibilidade</small>}
            </div>

            {/* Professor */}
            <div className="input-group">
              <label>Professor</label>
              <select
                value={instrutorId}
                onChange={(e) => setInstrutorId(e.target.value)}
                required
              >
                <option value="">Selecione um professor</option>
                {docentes.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nome}{doc.curso ? ` (${doc.curso})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Horário */}
            <div className="input-group">
              <label>Horário</label>
              <input
                type="text"
                required
                placeholder="Ex: 14:00 - 18:00"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
          </div>

          {/* Observações (largura total) */}
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label>Observações</label>
            <textarea
              rows={2}
              placeholder="Informações adicionais (opcional)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Rodapé com ações */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/agendamentos')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}