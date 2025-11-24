import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Recuperar sesión al recargar
    const storedUser = localStorage.getItem('ecommerce_user');
    const storedToken = localStorage.getItem('ecommerce_token');
    if (storedToken === 'undefined') {
      localStorage.removeItem('ecommerce_token');
    }
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(storedUser);
        // Only set if parse returns an object (basic sanity check)
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      } catch (err) {
        // Stored value was invalid JSON (could be 'undefined' or corrupted)
        console.warn('Invalid stored user in localStorage, clearing it.', err);
        localStorage.removeItem('ecommerce_user');
      }
    }
  }, []);

  const login = (data) => {
    setUser(data.user || null);
    if (data.user !== undefined && data.user !== null) {
      localStorage.setItem('ecommerce_user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('ecommerce_user');
    }

    if (data.token !== undefined && data.token !== null) {
      localStorage.setItem('ecommerce_token', data.token);
    } else {
      localStorage.removeItem('ecommerce_token');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('ecommerce_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};