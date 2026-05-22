import React, { useMemo } from 'react';
import { useReports } from '../context/ReportsStore.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  Submitted:      '#4f8ef7',
  'Under Review': '#f59e0b',
  Verified:       '#22c55e',
  Closed:         '#545870',
};

export default function Dashboard() {
  const { reports } = useReports();
  const { user } = useAuth();

  const visible = useMemo(() => {
    return user.role === 'agent'
      ? reports.filter((r) => r.submittedBy === user.name)
      : reports;
  }, [reports, user]);

  const stats = useMemo(() => {
    const s = { total: visible.length, submitted: 0, review: 0, verified: 0, closed: 0 };
    visible.forEach((r) => {
      if (r.status === 'Submitted')    s.submitted++;
      else if (r.status === 'Under Review') s.review++;
      else if (r.status === 'Verified')     s.verified++;
      else if (r.status === 'Closed')       s.closed++;
    });
    return s;
  }, [visible]);

  const statusData = useMemo(() => [
    { name: 'Submitted',    value: stats.submitted },
    { name: 'Under Review', value: stats.review },
    { name: 'Verified',     value: stats.verified },
    { name: 'Closed',       value: stats.closed },
  ].filter((d) => d.value > 0), [stats]);

  const typeData = useMemo(() => {
    const map = {};
    visible.forEach((r) => { map[r.type] = (map[r.type] || 0) + 1; });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [visible]);

  const cards = [
    { label: 'Total Reports',  value: stats.total,                   icon: FileText,    color: '#4f8ef7' },
    { label: 'Pending Review', value: stats.submitted + stats.review, icon: Clock,       color: '#f59e0b' },
    { label: 'Verified',       value: stats.verified,                 icon: CheckCircle, color: '#22c55e' },
    { label: 'Closed',         value: stats.closed,                   icon: AlertCircle, color: '#545870' },
  ];

  const emptyMsg = (
    <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
      No data yet
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Dashboard</div>
        <div className="page-sub">
          {user.role === 'agent'
            ? ('Your submitted reports, ' + user.name)
            : 'System-wide overview'}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: color + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginTop: 2 }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {/* Status pie */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Status Breakdown</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)',
                }} />
                <Legend
                  iconType="circle" iconSize={10}
                  formatter={(v) => (
                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : emptyMsg}
        </div>

        {/* Reports by type */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Reports by Type</div>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)',
                }} cursor={{ fill: 'rgba(79,142,247,0.05)' }} />
                <Bar dataKey="count" fill="#4f8ef7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : emptyMsg}
        </div>
      </div>
    </div>
  );
}
