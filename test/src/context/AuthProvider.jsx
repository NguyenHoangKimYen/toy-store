import { createContext, useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/utils/authHelpers';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getAuthToken();
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        // Invalid user data - clear everything
        console.error('Invalid user data in localStorage:', err);
        removeAuthToken();
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      // No token or no user - ensure clean state
      setUser(null);
    }
    
    setLoading(false);

    // Listen for login events from other components
    const handleUserLogin = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Invalid user data:', err);
          setUser(null);
        }
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
    localStorage.removeItem('guestSessionId');
    setUser(null);
    
    // Dispatch logout event for other components
    window.dispatchEvent(new Event('userLoggedOut'));
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
