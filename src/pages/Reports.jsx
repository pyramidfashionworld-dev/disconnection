import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportsStore.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FileText, Search, Filter, Trash2, Eye } from 'lucide-react';

const STATUS_COLORS = {
  Submitted:      { bg: '#4f8ef720', text: '#4f8ef7' },
  'Under Review': { bg: '#f59e0b20', text: '#f59e0b' },
  Verified:       { bg: '#22c55e20', text: '#22c55e' },
  Closed:         { bg: '#54587020', text: '#545870' },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#eee', text: '#666' };
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      borderRadius: 6,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

export default function Reports() {
  const { reports, deleteReport, STATUSES, TYPES, ZONES } = useReports();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [filterZone, setFilterZone]   = useState('');

  // Agents see only their own reports
  const visible = useMemo(() => {
    return user.role === 'agent'
      ? reports.filter((r) => r.submittedBy === user.name)
      : reports;
  }, [reports, user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return visible.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterType   && r.type   !== filterType)   return false;
      if (filterZone   && r.zone   !== filterZone)   return false;
      if (q && !(
        r.id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [visible, search, filterStatus, filterType, filterZone]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this report? This cannot be undone.')) {
      deleteReport(id);
    }
  };

  const selectStyle = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '7px 12px',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Reports</div>
        <div className="page-sub">
          {user.role === 'agent'
            ? 'Your submitted disconnection reports'
            : 'All disconnection reports across all zones'}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search
              size={15}
              style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text3)',
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, location, agent…"
              style={{
                width: '100%',
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter dropdowns */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={15} color="var(--text3)" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} style={selectStyle}>
              <option value="">All Zones</option>
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            {(filterStatus || filterType || filterZone || search) && (
              <button
                onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); setFilterZone(''); }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text3)',
                  padding: '7px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
        Showing {filtered.length} of {visible.length} reports
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            color: 'var(--text3)', fontSize: 14,
          }}>
            <FileText size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div>No reports match your filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Report ID', 'Type', 'Zone', 'Location', 'Submitted By', 'Date', 'Status', ''].map((h) => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--text3)',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/reports/${r.id}`)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#4f8ef7', whiteSpace: 'nowrap' }}>
                      {r.id}
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{r.type}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{r.zone}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.location}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{r.submittedBy}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {new Date(r.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/reports/${r.id}`); }}
                          title="View"
                          style={{
                            background: '#4f8ef715',
                            border: 'none',
                            borderRadius: 6,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            color: '#4f8ef7',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        {user.role !== 'agent' && (
                          <button
                            onClick={(e) => handleDelete(e, r.id)}
                            title="Delete"
                            style={{
                              background: '#ef444415',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
