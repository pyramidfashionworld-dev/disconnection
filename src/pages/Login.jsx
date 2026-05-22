import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(form.username, form.password)) {
      navigate('/dashboard');
    }
  };

  const quickLogin = (u, p) => {
    if (login(u, p)) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
            Andul Mouri
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Disconnection Reporting System
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Username</label>
              <input
                className="input"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => {
                  setForm((f) => ({ ...f, username: e.target.value }));
                  setError('');
                }}
              />
            </div>

            <div style={{ marginBottom: 20, position: 'relative' }}>
              <label>Password</label>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  setError('');
                }}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 10, bottom: 9,
                  background: 'none', border: 'none',
                  color: 'var(--text3)', cursor: 'pointer',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{
                color: 'var(--danger)', fontSize: 13, marginBottom: 14,
                padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            fontSize: 12, color: 'var(--text3)',
            textAlign: 'center', marginBottom: 10,
          }}>
            Demo credentials &mdash; click to auto-login
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Admin',      u: 'admin',   p: 'admin@123', color: '#ef4444' },
              { label: 'Supervisor', u: 'sup01',   p: 'sup@123',   color: '#f59e0b' },
              { label: 'Agent',      u: 'agent01', p: 'agent@123', color: '#4f8ef7' },
            ].map(({ label, u, p, color }) => (
              <button
                key={u}
                onClick={() => quickLogin(u, p)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'var(--surface)',
                  border: '1px solid ' + color + '30',
                  color,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
