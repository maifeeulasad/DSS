// Route: /users
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Alert, Button, ConfigProvider, Input, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name, record) =>
        editingEmail === record.email ? (
          <Input
            size="small"
            value={editState.name}
            onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
            style={{ maxWidth: 200 }}
          />
        ) : (
          <span style={{ fontWeight: 500, color: '#1e293b' }}>{name}</span>
        ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email) => <span style={{ color: '#475569' }}>{email}</span>,
    },
    {
      title: 'Institute',
      dataIndex: 'institute',
      render: (institute, record) =>
        editingEmail === record.email ? (
          <Input
            size="small"
            value={editState.institute}
            onChange={(e) => setEditState((s) => ({ ...s, institute: e.target.value }))}
            style={{ maxWidth: 200 }}
          />
        ) : institute ? (
          <span style={{ color: '#64748b' }}>{institute}</span>
        ) : (
          <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>-</span>
        ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role, record) => {
        if (editingEmail === record.email) {
          return (
            <Select
              size="small"
              value={editState.role}
              onChange={(val) => setEditState((s) => ({ ...s, role: val as Role }))}
              style={{ width: 100 }}
              options={[
                { value: 'guest', label: 'guest' },
                { value: 'user', label: 'user' },
                { value: 'admin', label: 'admin' },
              ]}
            />
          );
        }
        const key = (role ?? 'guest') as Role;
        const colors = ROLE_COLORS[key] ?? ROLE_COLORS.guest;
        return (
          <Tag
            style={{
              background: colors.bg,
              color: colors.color,
              border: 'none',
              borderRadius: 999,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {key}
          </Tag>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            title: '',
            key: 'actions',
            render: (_: unknown, record: User) => {
              const isEditing = editingEmail === record.email;
              if (isEditing) {
                return (
                  <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => saveUser(record.email)}
                      loading={saving}
                      style={{ background: '#22c55e', borderColor: '#22c55e' }}
                    >
                      Save
                    </Button>
                    <Button size="small" onClick={cancelEdit} disabled={saving}>
                      Cancel
                    </Button>
                    {saveError && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{saveError}</span>
                    )}
                  </span>
                );
              }
              return (
                <Button
                  size="small"
                  onClick={() => startEdit(record)}
                  style={{ color: '#3b82f6', borderColor: '#93c5fd' }}
                >
                  Edit
                </Button>
              );
            },
          } as ColumnsType<User>[number],
        ]
      : []),
  ];

  return (
    <ConfigProvider locale={enUS}>
      <CustomLayout>
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Spin size="large" />
          </div>
        )}
        {!loading && error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}
        {!loading && !error && (
          <Table
            dataSource={users}
            columns={columns}
            rowKey="email"
            pagination={false}
            size="middle"
            style={{
              background: '#fff',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
            rowClassName={(record) =>
              editingEmail === record.email ? 'users-editing-row' : ''
            }
            locale={{ emptyText: 'No users found.' }}
            footer={
              users.length > 0
                ? () => (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {users.length} user{users.length !== 1 ? 's' : ''} total
                    </span>
                  )
                : undefined
            }
          />
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

