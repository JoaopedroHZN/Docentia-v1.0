import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SelectCursos({ token, value, onChange }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        const resp = await api.get('/cursos?size=200', headers);
        const lista = resp.data.content || resp.data || [];
        setCursos(lista.filter(c => c.ativo !== false));
      } catch (e) {
        console.error('Erro ao carregar cursos:', e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [token]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      disabled={loading}
    >
      <option value="">{loading ? 'Carregando cursos...' : 'Selecione um curso'}</option>
      {cursos.map(c => (
        <option key={c.id} value={c.nome}>{c.nome} ({c.codigo})</option>
      ))}
    </select>
  );
}