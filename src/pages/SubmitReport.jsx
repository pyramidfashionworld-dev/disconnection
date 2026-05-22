import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../context/ReportsStore';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

export default function SubmitReport() {
  const { addReport, TYPES, ZONES } = useReports();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: '',
    zone: user.zone || '',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Select a type.';
    if (!form.zone) e.zone = 'Select a zone.';
    if (!form.location.trim()) e.location = 'Enter the location.';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const id = addReport(form, user);
      setSubmitted(id);
      setLoading(false);
    }, 600);
  };

  if (submitted) return (
    <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle size={32} color="#22c55e" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Report Submitted!</div>
      <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24 }}>
        Your report <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{submitted}</span> has been submitted successfully.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/reports/${submitted}`)}>View Report</button>
        <button className="btn btn-ghost" onClick={() => { setSubmitted(null); setForm({ type: '', zone: user.zone || '', location: '', description: '' }); }}>Submit Another</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Submit Report</div>
        <div className="page-sub">Report a new disconnection incident</div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label>Incident Type *</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">Select type…</option>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {errors.type && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.type}</div>}
            </div>
            <div>
              <label>Zone *</label>
              <select className="input" value={form.zone} onChange={e => set('zone', e.target.value)} disabled={user.role === 'agent'}>
                <option value="">Select zone…</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
              {errors.zone && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.zone}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Location / Address *</label>
            <input className="input" placeholder="e.g. Ward 3, Near Mosque, Main Road" value={form.location} onChange={e => set('location', e.target.value)} />
            {errors.location && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.location}</div>}
          </div>

          <div style={{ marginBottom: 22 }}>
            <label>Description * <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({form.description.length} chars, min 20)</span></label>
            <textarea className="input" rows={5} placeholder="Describe the incident in detail — what happened, how many affected, any immediate risks…"
              value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            {errors.description && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.description}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/reports')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
