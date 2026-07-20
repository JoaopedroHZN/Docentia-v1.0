import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PainelInstrutor({ token, user, onLogout }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dataFormatada = dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1);

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const carregarMinhaAgenda = async () => {
    try {
      const resposta = await api.get('/agendamentos/minhas-aulas', authHeaders);
      setAgendamentos(resposta.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Não foi possível carregar sua grade de horários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMinhaAgenda();
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <header style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/docentiaLogo.png" alt="Docentia" style={{ width: '34px', height: '34px' }} />
          <span style={{ fontSize: '18px', fontWeight: 800 }}>Docentia</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.nome || 'Docente'}</div>
            <div style={{ fontSize: '11px', color: '#CBD5E1' }}>Portal do Docente</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#FCA5A5',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Encerrar Sessão
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Bem-vindo ao Portal de Horários</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Visualize suas aulas agendadas pela coordenação.
            </p>
          </div>
          <div style={{
            padding: '10px 16px',
            backgroundColor: 'var(--color-accent-light)',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-accent)',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            Hoje: {dataFormatada}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Minhas Turmas e Horários</h2>
            <p>Total de aulas agendadas: {agendamentos.length}</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              Carregando grade de horários...
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Horário</th>
                    <th>Turno</th>
                    <th>Curso</th>
                    <th>Turma</th>
                    <th>Unidade Curricular</th>
                    <th>Sala</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                        Nenhum horário agendado para o período atual.
                      </td>
                    </tr>
                  ) : (
                    agendamentos.map((aula) => (
                      <tr key={aula.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>
                            {formatarData(aula.dataInicio)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            até {formatarData(aula.dataFim)}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>{aula.horario}</td>
                        <td>
                          <span className="badge badge-neutral">{aula.turno}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{aula.curso}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{aula.turma || '—'}</td>
                        <td>{aula.unidadeCurricular}</td>
                        <td>{aula.sala}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: aula.observacoes ? 'normal' : 'italic' }}>
                          {aula.observacoes && aula.observacoes.trim() !== '' ? aula.observacoes : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer style={{
          textAlign: 'center',
          padding: '20px',
          fontSize: '12px',
          color: '#64748B',
          marginTop: '40px',
          borderTop: '1px solid #E2E8F0',
        }}>
          <p>Desenvolvido por <strong>João Pedro Menezes</strong></p>
          <p style={{ marginTop: '5px' }}>© 2026 — Docentia | Plataforma de Gestão Curricular e Docente</p>
        </footer>
      </div>
    </div>
  );
}