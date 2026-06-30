import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('vibegrid_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to load profile:', err.message);
        localStorage.removeItem('vibegrid_token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('vibegrid_token', userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('vibegrid_token');
    setUser(null);
  };

  const updateUserInfo = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, handleLogout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
