import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, FileText, PlusCircle, Download,
  LogOut, Menu, X, Zap, Upload,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard, roles: ['admin', 'agent'] },
  { to: '/reports',   label: 'Reports',        icon: FileText,        roles: ['admin', 'agent'] },
  { to: '/submit',    label: 'Submit Report',  icon: PlusCircle,      roles: ['admin', 'agent'] },
  { to: '/upload',    label: 'Upload List',    icon: Upload,          roles: ['admin'] },
  { to: '/export',    label: 'Export',         icon: Download,        roles: ['admin', 'agent'] },
];

const roleColors  = { admin: '#ef4444', agent: '#4f8ef7' };
const roleLabels  = { admin: 'Admin',   agent: 'Agent' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const allowed = navItems.filter((n) => n.roles.includes(user?.role));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Andul Mouri</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>REPORTING SYSTEM</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {allowed.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              fontWeight: 600, fontSize: 14,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'rgba(79,142,247,0.1)' : 'transparent',
              transition: 'all 0.15s', textDecoration: 'none',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: (roleColors[user?.role] || '#4f8ef7') + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: roleColors[user?.role] || '#4f8ef7',
          }}>
            {user?.name?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: roleColors[user?.role] || '#4f8ef7', fontWeight: 600 }}>
              {roleLabels[user?.role]}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', fontSize: 13, justifyContent: 'center', gap: 6 }}
          onClick={handleLogout}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Desktop sidebar */}
      <div className="hide-mobile" style={{
        width: 220, minHeight: '100vh',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <SidebarContent />
      </div>

      {/* Mobile topbar */}
      <div className="show-mobile" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Andul Mouri</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 240, background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, marginLeft: 220, padding: '28px 28px 40px', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
