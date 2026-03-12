// Route: /logs  (admin only)
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
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

const Pill = ({ text, bg, color }: { text: string; bg: string; color: string }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '0.15rem 0.55rem',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      background: bg,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}
  >
    {text}
  </span>
);

const LogsPage = () => {
  const navigate = useNavigate();
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Activity Logs
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={load}
            style={{
              padding: '0.5rem 1.1rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/users' })}
            style={{
              padding: '0.5rem 1.1rem',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            ← Users
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Filter by user, path, method, IP, status…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.875rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            width: '320px',
            outline: 'none',
            color: '#1e293b',
          }}
        />
        {filter && (
          <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            {visible.length} of {logs.length} entries
          </span>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>Loading logs…</div>
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
        <div
          style={{
            background: '#fff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Timestamp', 'Status', 'Method', 'Path', 'User', 'IP', 'HTTP'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      borderBottom: '1px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No log entries found.
                  </td>
                </tr>
              ) : (
                visible.map((log, i) => {
                  const authStyle = STATUS_COLORS[log.auth_status ?? ''] ?? { bg: '#f1f5f9', color: '#64748b' };
                  const methodColor = HTTP_METHOD_COLORS[log.method ?? ''] ?? '#64748b';
                  const ts = log.timestamp
                    ? new Date(log.timestamp).toLocaleString(undefined, { hour12: false })
                    : '-';
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < visible.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                    >
                      <td style={{ padding: '0.6rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{ts}</td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <Pill text={log.auth_status ?? '-'} bg={authStyle.bg} color={authStyle.color} />
                      </td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: methodColor }}>{log.method ?? '-'}</span>
                      </td>
                      <td style={{ padding: '0.6rem 1rem', color: '#334155', fontFamily: 'monospace' }}>
                        {log.path ?? '-'}
                      </td>
                      <td style={{ padding: '0.6rem 1rem', color: '#475569' }}>{log.user ?? '-'}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {log.client_ip ?? '-'}
                      </td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              (log.status_code ?? 0) >= 500
                                ? '#ef4444'
                                : (log.status_code ?? 0) >= 400
                                  ? '#f59e0b'
                                  : '#22c55e',
                          }}
                        >
                          {log.status_code ?? '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {visible.length > 0 && (
            <div
              style={{
                padding: '0.6rem 1rem',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#94a3b8',
              }}
            >
              {visible.length} entr{visible.length !== 1 ? 'ies' : 'y'}
            </div>
          )}
        </div>
      )}
    </div>
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
