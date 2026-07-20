import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState({ totalAgendamentos: 0, totalSalas: 0, totalProfessores: 0, totalTurmas: 0 });
  const [proximos, setProximos] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [agResp, profResp, salasResp, turmasResp] = await Promise.all([
          api.get('/agendamentos?size=100', headers),
          api.get('/instrutores?size=100', headers),
          api.get('/salas?size=100', headers),
          api.get('/turmas?size=100', headers),
        ]);

        const agendamentos = agResp.data.content || agResp.data || [];
        const professores = profResp.data.content || profResp.data || [];
        const salas = salasResp.data.content || salasResp.data || [];
        const turmas = turmasResp.data.content || turmasResp.data || [];

        setStats({
          totalAgendamentos: agendamentos.length,
          totalSalas: salas.length,
          totalProfessores: professores.filter(p => p.perfil === 'INSTRUTOR').length,
          totalTurmas: turmas.length,
        });

        const hoje = new Date().toISOString().split('T')[0];
        const proximosHoje = agendamentos
          .filter(a => a.dataInicio <= hoje && a.dataFim >= hoje)
          .slice(0, 10);
        setProximos(proximosHoje);
      } catch {
        toast.error('Erro ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const formatarData = (d) => d ? d.split('-').reverse().join('/') : '';

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2>Dashboard</h2><p>Visão geral da plataforma Docentia</p></div>
        {loading ? <p className="text-muted">Carregando...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { label: 'Agendamentos Totais', value: stats.totalAgendamentos, color: '#0F172A' },
              { label: 'Salas Cadastradas', value: stats.totalSalas, color: '#10B981' },
              { label: 'Docentes Ativos', value: stats.totalProfessores, color: '#3B82F6' },
              { label: 'Turmas em Andamento', value: stats.totalTurmas, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Próximos Agendamentos do Dia</h3>
        {proximos.length === 0 ? <p className="text-muted">Nenhum agendamento para hoje.</p> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Período</th><th>Turma</th><th>Professor</th><th>Sala</th><th>Turno</th></tr></thead>
              <tbody>{proximos.map(a => (<tr key={a.id}><td>{formatarData(a.dataInicio)} até {formatarData(a.dataFim)}</td><td style={{ fontWeight: 500 }}>{a.curso}</td><td>{a.instrutor?.nome}</td><td>{a.sala}</td><td><span className="badge badge-neutral">{a.turno}</span></td></tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}