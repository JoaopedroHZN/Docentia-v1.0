import { useLocation } from 'react-router-dom';

const titles = {
  '/salas': { title: 'Gerenciar Salas', desc: 'Cadastro e gestão de salas e laboratórios.' },
  '/turmas': { title: 'Gerenciar Turmas', desc: 'Cadastro e gestão de turmas.' },
  '/cursos': { title: 'Gerenciar Cursos', desc: 'Cadastro e gestão de cursos.' },
  '/ucs': { title: 'Gerenciar UCs', desc: 'Cadastro e gestão de Unidades Curriculares.' },
  '/matriz-curricular': { title: 'Matriz Curricular', desc: 'Visualização e edição da matriz curricular.' },
  '/usuarios': { title: 'Gerenciar Usuários', desc: 'Cadastro e gestão de usuários do sistema.' },
  '/relatorios': { title: 'Relatórios', desc: 'Geração e visualização de relatórios.' },
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const info = titles[pathname] || { title: 'Página', desc: 'Em desenvolvimento.' };

  return (
    <div className="card">
      <div className="card-header">
        <h2>{info.title}</h2>
        <p>{info.desc}</p>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: 'var(--color-text-muted)',
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: '16px', opacity: 0.5 }}
        >
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>
          Módulo em desenvolvimento
        </p>
        <p style={{ fontSize: '13px' }}>
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
}