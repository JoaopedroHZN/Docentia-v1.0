import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import GerenciarCursos from './pages/GerenciarCursos';
import GerenciarSalas from './pages/GerenciarSalas';
import GerenciarTurmas from './pages/GerenciarTurmas';
import GerenciarUCs from './pages/GerenciarUCs';
import MatrizCurricular from './pages/MatrizCurricular';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import Relatorios from './pages/Relatorios';
import GerenciarProfessores from './pages/GerenciarProfessores';
import NovoAgendamento from './pages/NovoAgendamento';
import ListaAgendamentos from './pages/ListaAgendamentos';
import PainelInstrutor from './pages/PainelInstrutor';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [user, setUser] = useState(null);
  const [decodificando, setDecodificando] = useState(true);

  // Decodifica o token JWT para obter dados do usuário
  useEffect(() => {
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        setUser({
          nome: payload.nome || payload.sub || 'Usuário',
          email: payload.sub || payload.email || '',
          perfil: payload.perfil || payload.role || 'INSTRUTOR',
          id: payload.id || payload.userId || null,
        });
      } catch (e) {
        console.error('Erro ao decodificar token:', e);
        handleLogout();
      }
    }
    setDecodificando(false);
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken('');
    setUser(null);
  };

  // Mostra tela de carregamento enquanto decodifica o token
  if (token && decodificando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Autenticando...</p>
        </div>
      </div>
    );
  }

  // Rota pública: Login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user?.perfil === 'ADMIN';

  // INSTRUTOR: Apenas painel de visualização de aulas
  if (!isAdmin) {
    return <PainelInstrutor token={token} user={user} onLogout={handleLogout} />;
  }

  // ADMIN: Dashboard completo com Sidebar e todas as rotas
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<DashboardLayout user={user} onLogout={handleLogout} isAdmin={isAdmin} />}
        >
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/professores" element={<GerenciarProfessores token={token} />} />
          <Route path="/agendamentos" element={<ListaAgendamentos token={token} />} />
          <Route path="/agendamentos/novo" element={<NovoAgendamento token={token} />} />
          <Route path="/salas" element={<GerenciarSalas token={token} />} />
          <Route path="/turmas" element={<GerenciarTurmas token={token} />} />
          <Route path="/cursos" element={<GerenciarCursos token={token} />} />
          <Route path="/ucs" element={<GerenciarUCs token={token} />} />
          <Route path="/matriz-curricular" element={<MatrizCurricular token={token} />} />
          <Route path="/usuarios" element={<GerenciarUsuarios token={token} />} />
          <Route path="/relatorios" element={<Relatorios token={token} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;