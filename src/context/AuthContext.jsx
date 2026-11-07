


import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuthentication = async () => {
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest('/api/auth/me/');

        if (active) {
          setUser(data);
        }
      } catch (error) {
        localStorage.removeItem('token');

        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAuthentication();

    return () => {
      active = false;
    };
  }, [token]);

  const login = async (username, password) => {
    const data = await apiRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (!data.token || !data.user) {
      throw new Error('Unexpected login response from the server.');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);

    // Fetch the complete user profile, including business memberships.
    const profile = await apiRequest('/api/auth/me/');
    setUser(profile);

    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
