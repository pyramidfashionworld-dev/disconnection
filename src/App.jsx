import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsStore';

import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports.jsx';
import ReportDetail from './pages/ReportDetail';
import SubmitReport from './pages/SubmitReport';
import Export from './pages/Export';
import UploadDisconnection from './pages/UploadDisconnection.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to={user ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Layout>
              <Dashboard />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/reports"
        element={
          <RequireAuth>
            <Layout>
              <Reports />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/reports/:id"
        element={
          <RequireAuth>
            <Layout>
              <ReportDetail />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/submit"
        element={
          <RequireAuth>
            <Layout>
              <SubmitReport />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/export"
        element={
          <RequireAuth>
            <Layout>
              <Export />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/upload"
        element={
          <RequireAdmin>
            <Layout>
              <UploadDisconnection />
            </Layout>
          </RequireAdmin>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReportsProvider>
          <AppRoutes />
        </ReportsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}