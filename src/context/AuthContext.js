import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          
          // Fetch fresh user data to ensure profile picture is up to date
          try {
            const res = await authAPI.getMe();
            if (res.data) {
              const updatedUser = { ...parsedUser, ...res.data };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (err) {
            console.error('Error fetching fresh user data:', err);
          }
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      const userData = res.data;
      
      // Fetch full profile
      const profileRes = await authAPI.getMe();
      const fullUserData = { ...userData, ...profileRes.data };
      
      setUser(fullUserData);
      setToken(fullUserData.token);
      localStorage.setItem('token', fullUserData.token);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      return fullUserData;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const data = res.data;
      setUser(data);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
