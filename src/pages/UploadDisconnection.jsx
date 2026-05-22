import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useReports } from '../context/ReportsStore';
import { useAuth } from '../context/AuthContext';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  X, ChevronDown, ChevronUp, Download, Plus
} from 'lucide-react';

const DISCONNECTION_REASONS = [
  'Already Disconnected',
  'Meter Not Found',
  'Not Found',
  'Govt',
  'Physically Disconnected',
  'Office Help',
  'Payment',
  'Bill Dispute',
  'Door Lock',
];

// Map common column name variations to standard keys
const COL_MAP = {
  'consumer name': 'consumerName', 'name': 'consumerName', 'customer name': 'consumerName',
  'address': 'address', 'location': 'address', 'address / location': 'address',
  'zone': 'zone',
  'meter number': 'meterNumber', 'meter no': 'meterNumber', 'meter no.': 'meterNumber', 'meter': 'meterNumber',
  'disconnection date': 'disconnectionDate', 'date': 'disconnectionDate', 'disc date': 'disconnectionDate',
  'amount due': 'amountDue', 'amount': 'amountDue', 'bill': 'amountDue', 'amount due / bill': 'amountDue', 'due amount': 'amountDue',
  'reason': 'reason', 'reason for disconnection': 'reason', 'disconnection reason': 'reason', 'status': 'reason',
};

const REASON_COLORS = {
  'Already Disconnected': '#545870',
  'Meter Not Found': '#f59e0b',
  'Not Found': '#f59e0b',
  'Govt': '#06b6d4',
  'Physically Disconnected': '#22c55e',
  'Office Help': '#7c5cfc',
  'Payment': '#4f8ef7',
  'Bill Dispute': '#ef4444',
  'Door Lock': '#f97316',
};

function normalizeHeader(h) {
  return (h || '').toString().toLowerCase().trim();
}

function matchReason(val) {
  if (!val) return '';
  const v = val.toString().toLowerCase().trim();
  for (const r of DISCONNECTION_REASONS) {
    if (v.includes(r.toLowerCase())) return r;
  }
  // partial match
  if (v.includes('already') || v.includes('done')) return 'Already Disconnected';
  if (v.includes('meter') && v.includes('not')) return 'Meter Not Found';
  if (v.includes('not found') || v.includes('absent')) return 'Not Found';
  if (v.includes('govt') || v.includes('gov')) return 'Govt';
  if (v.includes('physical') || v.includes('physically')) return 'Physically Disconnected';
  if (v.includes('office')) return 'Office Help';
  if (v.includes('pay') || v.includes('payment')) return 'Payment';
  if (v.includes('dispute') || v.includes('bill')) return 'Bill Dispute';
  if (v.includes('lock') || v.includes('door')) return 'Door Lock';
  return val.toString().trim();
}

export default function UploadDisconnection() {
  const { addReport, ZONES } = useReports();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterReason, setFilterReason] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (file) => {
    setError('');
    setRows([]);
    setImported(null);
    setSelectedRows(new Set());
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (raw.length < 2) { setError('File appears to be empty.'); return; }

        // Find header row (first non-empty row)
        let headerIdx = 0;
        for (let i = 0; i < Math.min(5, raw.length); i++) {
          if (raw[i].some(c => c !== '')) { headerIdx = i; break; }
        }
        const headers = raw[headerIdx].map(normalizeHeader);
        const colIdx = {};
        headers.forEach((h, i) => { if (COL_MAP[h]) colIdx[COL_MAP[h]] = i; });

        const parsed = [];
        for (let i = headerIdx + 1; i < raw.length; i++) {
          const r = raw[i];
          if (r.every(c => c === '' || c === null || c === undefined)) continue;
          const get = (key) => colIdx[key] !== undefined ? r[colIdx[key]] : '';
          const dateVal = get('disconnectionDate');
          let dateStr = '';
          if (dateVal instanceof Date) dateStr = dateVal.toLocaleDateString();
          else if (dateVal) dateStr = dateVal.toString();

          parsed.push({
            _rowNum: i,
            consumerName: get('consumerName') || '',
            address: get('address') || '',
            zone: get('zone') || '',
            meterNumber: get('meterNumber') || '',
            disconnectionDate: dateStr,
            amountDue: get('amountDue') || '',
            reason: matchReason(get('reason')),
            _selected: true,
          });
        }
        if (parsed.length === 0) { setError('No data rows found in the file.'); return; }
        setRows(parsed);
        setSelectedRows(new Set(parsed.map((_, i) => i)));
      } catch (err) {
        setError('Could not read the file. Make sure it is a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    parseFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => parseFile(e.target.files[0]);

  const visible = useMemo(() => {
    return rows.map((r, i) => ({ ...r, _idx: i })).filter(r => {
      if (filterReason && r.reason !== filterReason) return false;
      if (filterZone && r.zone !== filterZone) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!r.consumerName.toLowerCase().includes(s) && !r.meterNumber.toLowerCase().includes(s) && !r.address.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rows, filterReason, filterZone, search]);

  const summary = useMemo(() => {
    const map = {};
    rows.forEach(r => { map[r.reason] = (map[r.reason] || 0) + 1; });
    return map;
  }, [rows]);

  const toggleSelect = (idx) => {
    setSelectedRows(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === visible.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(visible.map(r => r._idx)));
  };

  const handleImport = () => {
    const toImport = rows.filter((_, i) => selectedRows.has(i));
    if (toImport.length === 0) { setError('Select at least one row to import.'); return; }
    setImporting(true);
    setTimeout(() => {
      let count = 0;
      toImport.forEach(r => {
        addReport({
          type: 'Power Line',
          zone: r.zone || 'Zone A',
          location: r.address || r.consumerName,
          description: `Consumer: ${r.consumerName} | Meter: ${r.meterNumber} | Date: ${r.disconnectionDate} | Amount Due: ${r.amountDue || 'N/A'} | Reason: ${r.reason}`,
          consumerName: r.consumerName,
          meterNumber: r.meterNumber,
          disconnectionDate: r.disconnectionDate,
          amountDue: r.amountDue,
          reason: r.reason,
        }, user);
        count++;
      });
      setImported(count);
      setImporting(false);
    }, 800);
  };

  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Consumer Name', 'Address / Location', 'Zone', 'Meter Number', 'Disconnection Date', 'Amount Due / Bill', 'Reason for Disconnection'],
      ['Md. Rahman', 'Ward 3, Main Road', 'Zone A', 'MTR-001', '2025-01-15', '1500', 'Payment'],
      ['Karim Ali', 'Block C, House 12', 'Zone B', 'MTR-002', '2025-01-16', '2300', 'Door Lock'],
      ['Sultana Begum', 'New Colony Row 7', 'Zone A', 'MTR-003', '2025-01-17', '800', 'Meter Not Found'],
    ]);
    ws['!cols'] = [20,25,12,14,18,16,25].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disconnections');
    XLSX.writeFile(wb, 'disconnection-template.xlsx');
  };

  if (imported !== null) return (
    <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle size={32} color="#22c55e" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{imported} Reports Imported!</div>
      <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>
        All selected disconnection records have been added as reports and are now visible in the Reports section.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/reports')}>View Reports</button>
        <button className="btn btn-ghost" onClick={() => { setRows([]); setFileName(''); setImported(null); setSelectedRows(new Set()); }}>Upload Another File</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Upload Disconnection List</div>
          <div className="page-sub">Upload an Excel file to verify and import disconnection records</div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={downloadSampleTemplate}>
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* Upload zone */}
      {rows.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12, padding: '56px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(79,142,247,0.05)' : 'var(--surface)',
            transition: 'all 0.2s', marginBottom: 16,
          }}>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileInput} />
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(79,142,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileSpreadsheet size={26} color="var(--accent)" />
          </div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Drop your Excel file here</div>
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>or click to browse — .xlsx, .xls supported</div>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, color: 'var(--danger)', fontSize: 13 }}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', color: 'var(--danger)' }}><X size={14} /></button>
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <>
          {/* File info + summary */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <div className="card" style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileSpreadsheet size={22} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{rows.length} records loaded · {selectedRows.size} selected</div>
              </div>
              <button onClick={() => { setRows([]); setFileName(''); setSelectedRows(new Set()); }} style={{ marginLeft: 'auto', background: 'none', color: 'var(--text3)' }}><X size={16} /></button>
            </div>
          </div>

          {/* Reason summary chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {Object.entries(summary).map(([reason, count]) => (
              <div key={reason} onClick={() => setFilterReason(filterReason === reason ? '' : reason)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                  borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: filterReason === reason ? (REASON_COLORS[reason] || '#4f8ef7') + '25' : 'var(--surface)',
                  border: `1px solid ${filterReason === reason ? (REASON_COLORS[reason] || '#4f8ef7') : 'var(--border)'}`,
                  color: REASON_COLORS[reason] || 'var(--text2)',
                  transition: 'all 0.15s',
                }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: REASON_COLORS[reason] || '#4f8ef7', display: 'inline-block' }} />
                {reason || 'Unknown'} · {count}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="input" placeholder="Search name, meter, address…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 200px' }} />
              <select className="input" style={{ flex: '0 1 160px' }} value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                <option value="">All Zones</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
              <select className="input" style={{ flex: '0 1 180px' }} value={filterReason} onChange={e => setFilterReason(e.target.value)}>
                <option value="">All Reasons</option>
                {DISCONNECTION_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
              {(search || filterZone || filterReason) && (
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setSearch(''); setFilterZone(''); setFilterReason(''); }}>Clear</button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" checked={selectedRows.size === visible.length && visible.length > 0}
                        onChange={toggleAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th>#</th>
                    <th>Consumer Name</th>
                    <th>Meter No.</th>
                    <th>Zone</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Amount Due</th>
                    <th>Reason</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text3)', padding: '32px 0' }}>No records match filters.</td></tr>
                  ) : visible.map((r, visIdx) => (
                    <React.Fragment key={r._idx}>
                      <tr style={{ opacity: selectedRows.has(r._idx) ? 1 : 0.45 }}>
                        <td>
                          <input type="checkbox" checked={selectedRows.has(r._idx)} onChange={() => toggleSelect(r._idx)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r._rowNum}</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.consumerName || '—'}</td>
                        <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{r.meterNumber || '—'}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--text3)' }}>{r.zone || '—'}</span></td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address || '—'}</td>
                        <td style={{ fontSize: 12 }}>{r.disconnectionDate || '—'}</td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: r.amountDue ? 'var(--danger)' : 'var(--text3)' }}>
                          {r.amountDue ? `৳${r.amountDue}` : '—'}
                        </td>
                        <td>
                          {r.reason ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                              background: (REASON_COLORS[r.reason] || '#4f8ef7') + '18',
                              color: REASON_COLORS[r.reason] || '#4f8ef7',
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: REASON_COLORS[r.reason] || '#4f8ef7' }} />
                              {r.reason}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <button onClick={() => setExpandedRow(expandedRow === r._idx ? null : r._idx)}
                            style={{ background: 'none', color: 'var(--text3)', display: 'flex', alignItems: 'center' }}>
                            {expandedRow === r._idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === r._idx && (
                        <tr>
                          <td colSpan={10} style={{ background: 'var(--surface2)', padding: '14px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                              {[
                                ['Consumer Name', r.consumerName],
                                ['Meter Number', r.meterNumber],
                                ['Zone', r.zone],
                                ['Address', r.address],
                                ['Disconnection Date', r.disconnectionDate],
                                ['Amount Due', r.amountDue ? `৳${r.amountDue}` : '—'],
                                ['Reason', r.reason],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
                                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{val || '—'}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleImport} disabled={importing || selectedRows.size === 0}
              style={{ opacity: importing || selectedRows.size === 0 ? 0.6 : 1, fontSize: 15, padding: '10px 24px' }}>
              <Plus size={16} /> {importing ? 'Importing…' : `Import ${selectedRows.size} Record${selectedRows.size !== 1 ? 's' : ''} as Reports`}
            </button>
            <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
              <Upload size={14} /> Change File
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileInput} />
            <div style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>
              {visible.length !== rows.length && `Showing ${visible.length} of ${rows.length} records`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
