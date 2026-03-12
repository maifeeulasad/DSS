// Route: /logs  (admin only)
import { createFileRoute, redirect } from '@tanstack/react-router';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Alert, Button, ConfigProvider, Input, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import enUS from 'antd/locale/en_US';
import { useEffect, useState } from 'react';
import { CustomLayout } from '../layout/CustomLayout';
import { AuthToken, DSSApiClient } from '../services/dssApi';

type LogEntry = {
  timestamp?: string;
  auth_status?: string;
  method?: string;
  path?: string;
  user?: string;
  client_ip?: string;
  status_code?: number;
  [key: string]: any;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  AUTHORIZED:   { bg: '#dcfce7', color: '#15803d' },
  UNAUTHORIZED: { bg: '#fef2f2', color: '#b91c1c' },
};

const HTTP_METHOD_COLORS: Record<string, string> = {
  GET:    '#3b82f6',
  POST:   '#8b5cf6',
  PATCH:  '#f59e0b',
  PUT:    '#f59e0b',
  DELETE: '#ef4444',
};

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    DSSApiClient.getActivityLogs(500)
      .then(setLogs)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = filter
    ? logs.filter((l) =>
        [l.user, l.path, l.method, l.client_ip, String(l.status_code)]
          .join(' ')
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : logs;

  const columns: ColumnsType<LogEntry> = [
    {
      title: 'Timestamp',
      key: 'timestamp',
      render: (_, record) => {
        const ts = record.timestamp
          ? new Date(record.timestamp).toLocaleString(undefined, { hour12: false })
          : '-';
        return <span style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{ts}</span>;
      },
    },
    {
      title: 'Status',
      key: 'auth_status',
      render: (_, record) => {
        const authStyle = STATUS_COLORS[record.auth_status ?? ''] ?? { bg: '#f1f5f9', color: '#64748b' };
        return (
          <Tag
            style={{
              background: authStyle.bg,
              color: authStyle.color,
              border: 'none',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {record.auth_status ?? '-'}
          </Tag>
        );
      },
    },
    {
      title: 'Method',
      key: 'method',
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: HTTP_METHOD_COLORS[record.method ?? ''] ?? '#64748b', fontSize: '0.85rem' }}>
          {record.method ?? '-'}
        </span>
      ),
    },
    {
      title: 'Path',
      key: 'path',
      render: (_, record) => (
        <Typography.Text code style={{ fontSize: '0.85rem', color: '#334155' }}>
          {record.path ?? '-'}
        </Typography.Text>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => <span style={{ color: '#475569', fontSize: '0.85rem' }}>{record.user ?? '-'}</span>,
    },
    {
      title: 'IP',
      key: 'client_ip',
      render: (_, record) => (
        <Typography.Text code style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {record.client_ip ?? '-'}
        </Typography.Text>
      ),
    },
    {
      title: 'HTTP',
      key: 'status_code',
      render: (_, record) => {
        const code = record.status_code ?? 0;
        const color = code >= 500 ? '#ef4444' : code >= 400 ? '#f59e0b' : '#22c55e';
        return (
          <span style={{ fontWeight: 600, color, fontSize: '0.85rem' }}>
            {record.status_code ?? '-'}
          </span>
        );
      },
    },
  ];

  return (
    <ConfigProvider locale={enUS}>
      <CustomLayout>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div />
          <Button
            icon={<ReloadOutlined />}
            onClick={load}
            style={{ color: '#475569', borderColor: '#e2e8f0', background: '#f1f5f9' }}
          >
            Refresh
          </Button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Input
            placeholder="Filter by user, path, method, IP, status…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
          {filter && (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {visible.length} of {logs.length} entries
            </span>
          )}
        </div>

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
            dataSource={visible}
            columns={columns}
            rowKey={(_, index) => String(index)}
            pagination={false}
            size="small"
            style={{
              background: '#fff',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
            locale={{ emptyText: 'No log entries found.' }}
            footer={
              visible.length > 0
                ? () => (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {visible.length} entr{visible.length !== 1 ? 'ies' : 'y'}
                    </span>
                  )
                : undefined
            }
            scroll={{ x: 'max-content' }}
          />
        )}
      </CustomLayout>
    </ConfigProvider>
  );
};

export const Route = createFileRoute('/logs')({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      if (!AuthToken.isPresent()) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw redirect({ to: '/login' });
      }
      if (AuthToken.getRole() !== 'admin') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw redirect({ to: '/analysis' });
      }
    }
  },
  component: LogsPage,
});
