// Route: /users
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AuthToken, DSSApiClient } from '../services/dssApi';

interface User {
  name: string;
  email: string;
  institute: string;
}

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    DSSApiClient.getUsers()
      .then(setUsers)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Users
        </h1>
        <button
          type="button"
          onClick={() => navigate({ to: '/analysis' })}
          style={{
            padding: '0.5rem 1.25rem',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Analysis
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>
          Loading users…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '0.5rem',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Name', 'Email', 'Institute'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '0.875rem 1.25rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr
                    key={user.email}
                    style={{
                      borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#1e293b' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#475569' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>
                      {user.institute || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {users.length > 0 && (
            <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/users')({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !AuthToken.isPresent()) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw redirect({ to: '/login' });
    }
  },
  component: UsersPage,
});
