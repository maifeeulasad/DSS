// Route: /users
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { useEffect, useState } from 'react';
import { CustomLayout } from '../layout/CustomLayout';
import { AuthToken, DSSApiClient } from '../services/dssApi';

type Role = 'user' | 'guest' | 'admin';

interface User {
  name: string;
  email: string;
  institute: string;
  role?: Role;
}

interface EditState {
  name: string;
  institute: string;
  role: Role;
}

const ROLE_COLORS: Record<Role, { bg: string; color: string }> = {
  admin: { bg: '#ede9fe', color: '#6d28d9' },
  user:  { bg: '#dbeafe', color: '#1d4ed8' },
  guest: { bg: '#f1f5f9', color: '#64748b' },
};

const inputStyle: React.CSSProperties = {
  padding: '0.3rem 0.6rem',
  borderRadius: '0.375rem',
  border: '1px solid #93c5fd',
  background: '#fff',
  fontSize: '0.85rem',
  color: '#1e293b',
  width: '100%',
  boxSizing: 'border-box',
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: '', institute: '', role: 'guest' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isAdmin = AuthToken.getRole() === 'admin';

  useEffect(() => {
    DSSApiClient.getUsers()
      .then((data) => setUsers(data as User[]))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setEditState({ name: user.name, institute: user.institute, role: (user.role ?? 'guest') as Role });
    setSaveError('');
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setSaveError('');
  };

  const saveUser = async (email: string) => {
    setSaving(true);
    setSaveError('');
    try {
      await DSSApiClient.updateUser(email, {
        name: editState.name,
        institute: editState.institute,
        role: editState.role,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.email === email
            ? { ...u, name: editState.name, institute: editState.institute, role: editState.role }
            : u,
        ),
      );
      setEditingEmail(null);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConfigProvider locale={enUS}>
      <CustomLayout>
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
                {['Name', 'Email', 'Institute', 'Role', ...(isAdmin ? [''] : [])].map((col) => (
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
                    colSpan={isAdmin ? 5 : 4}
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
                      {/* Name */}
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#1e293b' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editState.name}
                            onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                            style={inputStyle}
                          />
                        ) : user.name}
                      </td>
                      {/* Email (never editable) */}
                      <td style={{ padding: '0.875rem 1.25rem', color: '#475569' }}>
                        {user.email}
                      </td>
                      {/* Institute */}
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editState.institute}
                            onChange={(e) => setEditState((s) => ({ ...s, institute: e.target.value }))}
                            style={inputStyle}
                          />
                        ) : (
                          user.institute || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      {/* Role */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {isEditing ? (
                          <select
                            value={editState.role}
                            onChange={(e) => setEditState((s) => ({ ...s, role: e.target.value as Role }))}
                            style={{ ...inputStyle, width: 'auto' }}
                          >
                            <option value="guest">guest</option>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>
                      {/* Actions (admin only) */}
                      {isAdmin && (
                        <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                          {isEditing ? (
                            <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => saveUser(user.email)}
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
                              Edit
                            </button>
                          )}
                        </td>
                      )}
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
      </CustomLayout>
    </ConfigProvider>
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
