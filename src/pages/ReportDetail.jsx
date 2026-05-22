import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportsStore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2 } from 'lucide-react';

// Admin can move through all statuses; agents can only mark their OWN submitted report as Closed (done)
const STATUS_FLOW = {
  admin: {
    Submitted: ['Under Review', 'Verified', 'Closed'],
    'Under Review': ['Verified', 'Closed'],
    Verified: ['Closed'],
    Closed: []
  },
  agent: {
    Submitted: ['Closed'],
    'Under Review': [],
    Verified: [],
    Closed: []
  }
};

const badgeClass = s => {
  if (s === 'Submitted') return 'badge-submitted';
  if (s === 'Under Review') return 'badge-review';
  if (s === 'Verified') return 'badge-verified';
  return 'badge-closed';
};

const actionColors = {
  Submitted: '#4f8ef7',
  'Under Review': '#f59e0b',
  Verified: '#22c55e',
  Closed: '#545870'
};

export default function ReportDetail() {
  const { id } = useParams();
  const { getReport, updateStatus, deleteReport } = useReports();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const report = getReport(id);

  // ✅ FIXED: safe null state
  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontWeight: 600, color: 'var(--text2)' }}>
          Report not found
        </div>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/reports')}
        >
          ← Back to Reports
        </button>
      </div>
    );
  }

  // Agents can only update their own reports
  const canUpdate =
    user.role === 'admin' || report.submittedBy === user.name;

  const allowed = canUpdate
    ? (STATUS_FLOW[user.role]?.[report.status] || [])
    : [];

  const doUpdate = (newStatus) => {
    setActionLoading(newStatus);

    setTimeout(() => {
      updateStatus(report.id, newStatus, note, user);
      setNote('');
      setActionLoading('');
    }, 400);
  };

  const doDelete = () => {
    deleteReport(report.id);
    navigate('/reports');
  };

  const btnClass = (s) => {
    if (s === 'Verified') return 'btn btn-success';
    if (s === 'Closed') return 'btn btn-ghost';
    return 'btn btn-primary';
  };

  return (
    <div style={{ maxWidth: 760 }}>
      
      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: 380, width: '90%' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Delete Report?
            </div>

            <div style={{ fontSize: 14, marginBottom: 20 }}>
              Report <b>{report.id}</b> will be permanently removed.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn"
                style={{ background: 'var(--danger)', color: '#fff', flex: 1 }}
                onClick={doDelete}
              >
                Delete
              </button>

              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/reports')}
        >
          <ArrowLeft size={14} /> Back to Reports
        </button>

        {user.role === 'admin' && (
          <button
            className="btn"
            style={{ background: 'var(--danger)', color: '#fff' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={14} /> Delete Report
          </button>
        )}
      </div>

      {/* Report Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>
          {report.type}
        </div>

        <div style={{ fontSize: 13, marginTop: 6 }}>
          {report.zone} · {report.location}
        </div>

        <div style={{ marginTop: 14 }}>
          {report.description}
        </div>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          Submitted By: {report.submittedBy}
        </div>

        <div style={{ fontSize: 13 }}>
          Date: {report.submittedAt
            ? new Date(report.submittedAt).toLocaleString()
            : 'N/A'}
        </div>
      </div>

      {/* Status buttons */}
      {allowed.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Update Status
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allowed.map(s => (
              <button
                key={s}
                className={btnClass(s)}
                onClick={() => doUpdate(s)}
                disabled={!!actionLoading}
              >
                {actionLoading === s ? 'Saving...' : `→ ${s}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail (SAFE FIX) */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          Audit Trail
        </div>

        {(report.audit || []).map((a, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{a.action}</b> by {a.by}
            <div style={{ fontSize: 12 }}>
              {a.at ? new Date(a.at).toLocaleString() : ''}
            </div>
            {a.note && <div>{a.note}</div>}
          </div>
        ))}
      </div>

    </div>
  );
}