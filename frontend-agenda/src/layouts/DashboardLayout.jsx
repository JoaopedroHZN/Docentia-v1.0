import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ user, onLogout, isAdmin }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar fixa à esquerda */}
      <Sidebar user={user} onLogout={onLogout} isAdmin={isAdmin} />

      {/* Área de conteúdo à direita da Sidebar */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px',
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        <Outlet />
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            style: {
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderLeft: '4px solid var(--color-success)',
            },
          },
          error: {
            style: {
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderLeft: '4px solid var(--color-error)',
            },
          },
        }}
      />
    </div>
  );
}