import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/utils/authHelpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getAuthToken();
    if (token) {
      // TODO: Fetch user data from token or API
      // For now, we'll just set a placeholder
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);

    // Listen for login events from other components
    const handleUserLogin = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    return () => window.removeEventListener('userLoggedIn', handleUserLogin);
  }, []);

  const login = (userData, token) => {
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
