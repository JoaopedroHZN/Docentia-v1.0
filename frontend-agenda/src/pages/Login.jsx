import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      const resposta = await api.post('/login', { email, senha });
      const token = resposta.data.token || resposta.data;
      localStorage.setItem('jwt_token', token);
      onLoginSuccess(token);
    } catch (erro) {
      console.error('Erro ao tentar logar:', erro);
      setMensagemErro('Falha no login. Verifique se o e-mail e a senha estão corretos.');
    }
  };

  const handlePrimeiroAcesso = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      const resposta = await api.post('/instrutores/primeiro-acesso', {
        email,
        novaSenha: senha,
      });
      setMensagemSucesso(resposta.data);
      setIsPrimeiroAcesso(false);
      setSenha('');
    } catch (erro) {
      if (erro.response && erro.response.data) {
        setMensagemErro(erro.response.data);
      } else {
        setMensagemErro('Erro ao conectar com o servidor. Tente novamente.');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
    }}>
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          width: '100%',
          maxWidth: '400px',
          padding: '40px 30px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* Logo Docentia — Ícone SVG estilizado "D" geométrico */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <img src="/docentiaLogo.png" alt="Docentia" style={{ width: '44px', height: '44px' }} />
            <h1
              style={{
                color: '#0F172A',
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              Docentia
            </h1>
          </div>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {isPrimeiroAcesso
              ? 'Primeiro Acesso — Cadastre sua Senha'
              : 'Plataforma de Gestão Curricular e Docente'}
          </p>
        </div>

        {mensagemSucesso && (
          <div className="alert alert-success">{mensagemSucesso}</div>
        )}
        {mensagemErro && (
          <div className="alert alert-error">{mensagemErro}</div>
        )}

        <form
          onSubmit={isPrimeiroAcesso ? handlePrimeiroAcesso : handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="input-group">
            <label>E-mail corporativo</label>
            <input
              type="email"
              placeholder="docente@docentia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{isPrimeiroAcesso ? 'Crie uma nova senha' : 'Senha de Acesso'}</label>
            <input
              type="password"
              placeholder={isPrimeiroAcesso ? 'Defina sua credencial' : '••••••••'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              marginTop: '10px',
              backgroundColor: isPrimeiroAcesso ? 'var(--color-accent)' : undefined,
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {isPrimeiroAcesso ? 'Cadastrar Minha Senha' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsPrimeiroAcesso(!isPrimeiroAcesso);
              setMensagemErro('');
              setMensagemSucesso('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0F172A',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isPrimeiroAcesso
              ? 'Já possuo senha, retornar à tela de Login'
              : 'Primeiro acesso? Cadastre sua senha aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}