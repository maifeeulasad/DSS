// Route: /users
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AuthToken, DSSApiClient } from '../services/dssApi';

type Role = 'user' | 'guest' | 'admin';

interface User {
  name: string;
  email: string;
  institute: string;
  role?: Role;
}

const ROLE_COLORS: Record<Role, { bg: string; color: string }> = {
  admin: { bg: '#ede9fe', color: '#6d28d9' },
  user:  { bg: '#dbeafe', color: '#1d4ed8' },
  guest: { bg: '#f1f5f9', color: '#64748b' },
};

const RoleBadge = ({ role }: { role?: string }) => {
  const key = (role ?? 'guest') as Role;
  const style = ROLE_COLORS[key] ?? ROLE_COLORS.guest;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        textTransform: 'capitalize',
      }}
    >
      {key}
    </span>
  );
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // track which row is being edited and its pending value
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role>('guest');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    DSSApiClient.getUsers()
      .then((data) => setUsers(data as User[]))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setPendingRole((user.role ?? 'guest') as Role);
    setSaveError('');
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setSaveError('');
  };

  const saveRole = async (email: string) => {
    setSaving(true);
    setSaveError('');
    try {
      await DSSApiClient.updateUserRole(email, pendingRole);
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, role: pendingRole } : u)),
      );
      setEditingEmail(null);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
                {['Name', 'Email', 'Institute', 'Role', ''].map((col) => (
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
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const isEditing = editingEmail === user.email;
                  return (
                    <tr
                      key={user.email}
                      style={{
                        borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s',
                        background: isEditing ? '#f0f9ff' : '',
                      }}
                      onMouseEnter={(e) => { if (!isEditing) (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isEditing) (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
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
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {isEditing ? (
                          <select
                            value={pendingRole}
                            onChange={(e) => setPendingRole(e.target.value as Role)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #93c5fd',
                              background: '#fff',
                              fontSize: '0.85rem',
                              color: '#1e293b',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="guest">guest</option>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => saveRole(user.email)}
                              disabled={saving}
                              style={{
                                padding: '0.3rem 0.75rem',
                                background: '#22c55e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                opacity: saving ? 0.7 : 1,
                              }}
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={saving}
                              style={{
                                padding: '0.3rem 0.75rem',
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                              }}
                            >
                              Cancel
                            </button>
                            {saveError && (
                              <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{saveError}</span>
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            style={{
                              padding: '0.3rem 0.75rem',
                              background: 'transparent',
                              color: '#3b82f6',
                              border: '1px solid #93c5fd',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            Edit role
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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
