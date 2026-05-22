import React, { createContext, useContext, useState } from 'react';

const STATUSES = ['Submitted', 'Under Review', 'Verified', 'Closed'];

const TYPES = [
  'Power Line',
  'Cable Fault',
  'Meter Issue',
  'Transformer',
  'Pole Damage',
  'Illegal Connection',
  'Other',
];

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

function makeId() {
  return (
    'RPT-' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

const SEED = [
  {
    id: 'RPT-ABC001',
    type: 'Power Line',
    zone: 'Zone A',
    location: 'Ward 3, Main Road',
    status: 'Verified',
    submittedBy: 'Agent Rahman',
    submittedAt: '2025-01-10T09:30:00',
    description: 'Line down after storm. Affecting 40 households.',
    audit: [
      { action: 'Submitted',    by: 'Agent Rahman', at: '2025-01-10T09:30:00', note: '' },
      { action: 'Under Review', by: 'Admin User',   at: '2025-01-10T11:00:00', note: 'Team dispatched.' },
      { action: 'Verified',     by: 'Admin User',   at: '2025-01-10T15:00:00', note: 'Repaired and verified.' },
    ],
  },
  {
    id: 'RPT-ABC002',
    type: 'Meter Issue',
    zone: 'Zone B',
    location: 'Block C, House 12',
    status: 'Submitted',
    submittedBy: 'Agent Karim',
    submittedAt: '2025-01-12T14:00:00',
    description: 'Meter showing wrong reading. Consumer complaint.',
    audit: [
      { action: 'Submitted', by: 'Agent Karim', at: '2025-01-12T14:00:00', note: '' },
    ],
  },
  {
    id: 'RPT-ABC003',
    type: 'Transformer',
    zone: 'Zone A',
    location: 'Substation 2',
    status: 'Under Review',
    submittedBy: 'Agent Sultana',
    submittedAt: '2025-01-14T08:15:00',
    description: 'Transformer humming loudly. Potential overload risk.',
    audit: [
      { action: 'Submitted',    by: 'Agent Sultana', at: '2025-01-14T08:15:00', note: '' },
      { action: 'Under Review', by: 'Admin User',    at: '2025-01-14T09:00:00', note: 'Engineer assigned.' },
    ],
  },
];

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(SEED);

  const addReport = (data, user) => {
    const report = {
      id: makeId(),
      ...data,
      status: 'Submitted',
      submittedBy: user.name,
      submittedAt: new Date().toISOString(),
      audit: [
        { action: 'Submitted', by: user.name, at: new Date().toISOString(), note: '' },
      ],
    };
    setReports((prev) => [report, ...prev]);
    return report.id;
  };

  const updateStatus = (id, newStatus, note, user) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status: newStatus,
          audit: [
            ...r.audit,
            { action: newStatus, by: user.name, at: new Date().toISOString(), note: note || '' },
          ],
        };
      })
    );
  };

  const deleteReport = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const getReport = (id) => {
    return reports.find((r) => r.id === id);
  };

  return (
    <ReportsContext.Provider
      value={{ reports, addReport, updateStatus, deleteReport, getReport, STATUSES, TYPES, ZONES }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => useContext(ReportsContext);
