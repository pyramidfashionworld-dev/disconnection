import React, { createContext, useContext, useState } from 'react';

const USERS = [
  { id: 1, username: 'admin', password: 'admin@123', name: 'Admin User', role: 'admin' },
  { id: 2, username: 'agent01', password: 'agent@123', name: 'Agent Rahman', role: 'agent', zone: 'Zone A' },
  { id: 3, username: 'agent02', password: 'agent@123', name: 'Agent Karim', role: 'agent', zone: 'Zone B' },
  { id: 4, username: 'agent03', password: 'agent@123', name: 'Agent Sultana', role: 'agent', zone: 'Zone A' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = (username, password) => {
    const found = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (found) {
      setUser(found);
      setError('');
      return true;
    }

    setError('Invalid username or password.');
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export { USERS };