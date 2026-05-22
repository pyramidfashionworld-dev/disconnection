import React, { useState, useMemo } from 'react';
import { useReports } from '../context/ReportsStore';
import { useAuth } from '../context/AuthContext';
import { Download, FileJson, FileText } from 'lucide-react';

export default function Export() {
  const { reports, STATUSES, TYPES, ZONES } = useReports();
  const { user } = useAuth();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloaded, setDownloaded] = useState('');

  // Agents download only their own reports; admin downloads all
  const base = useMemo(() =>
    user.role === 'agent' ? reports.filter(r => r.submittedBy === user.name) : reports,
  [reports, user]);

  const filtered = useMemo(() => {
    let r = [...base];
    if (filterStatus) r = r.filter(x => x.status === filterStatus);
    if (filterType)   r = r.filter(x => x.type === filterType);
    if (filterZone)   r = r.filter(x => x.zone === filterZone);
    if (dateFrom)     r = r.filter(x => new Date(x.submittedAt) >= new Date(dateFrom));
    if (dateTo)       r = r.filter(x => new Date(x.submittedAt) <= new Date(dateTo + 'T23:59:59'));
    return r;
  }, [base, filterStatus, filterType, filterZone, dateFrom, dateTo]);

  const triggerDownload = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setDownloaded(filename);
    setTimeout(() => setDownloaded(''), 3000);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Zone', 'Location', 'Status', 'SubmittedBy', 'SubmittedAt', 'Description'];
    const rows = filtered.map(r => [
      r.id, r.type, r.zone, `"${r.location}"`, r.status, r.submittedBy,
      new Date(r.submittedAt).toLocaleString(), `"${r.description.replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(csv, `andul-mouri-reports-${Date.now()}.csv`, 'text/csv');
  };

  const exportJSON = () => {
    const data = filtered.map(({ audit, ...r }) => ({ ...r, auditCount: audit.length }));
    triggerDownload(JSON.stringify(data, null, 2), `andul-mouri-reports-${Date.now()}.json`, 'application/json');
  };

  const exportJSONFull = () => {
    triggerDownload(JSON.stringify(filtered, null, 2), `andul-mouri-reports-full-${Date.now()}.json`, 'application/json');
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Export Data</div>
        <div className="page-sub">
          {user.role === 'agent' ? 'Download your own submitted reports' : 'Download filtered reports as CSV or JSON'}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Filter Before Export</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div>
            <label>Status</label>
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Type</label>
            <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {user.role === 'admin' && (
            <div>
              <label>Zone</label>
              <select className="input" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                <option value="">All Zones</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          )}
          <div>
            <label>From Date</label>
            <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label>To Date</label>
            <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        {(filterStatus || filterType || filterZone || dateFrom || dateTo) && (
          <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 13 }} onClick={() => { setFilterStatus(''); setFilterType(''); setFilterZone(''); setDateFrom(''); setDateTo(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Preview count */}
      <div className="card" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{filtered.length}</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>report{filtered.length !== 1 ? 's' : ''} will be exported</div>
        </div>
        {downloaded && (
          <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>✓ Downloaded!</div>
        )}
      </div>

      {/* Export buttons */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Download Format</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: 10, padding: '12px 16px' }} onClick={exportCSV} disabled={filtered.length === 0}>
            <FileText size={18} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Export as CSV</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>Best for Excel / spreadsheets</div>
            </div>
          </button>
          <button className="btn" style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', justifyContent: 'flex-start', gap: 10, padding: '12px 16px' }} onClick={exportJSON} disabled={filtered.length === 0}>
            <FileJson size={18} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Export as JSON (summary)</div>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Without audit trail</div>
            </div>
          </button>
          {user.role === 'admin' && (
            <button className="btn" style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', justifyContent: 'flex-start', gap: 10, padding: '12px 16px' }} onClick={exportJSONFull} disabled={filtered.length === 0}>
              <Download size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Export as JSON (full)</div>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>Includes complete audit trail</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
