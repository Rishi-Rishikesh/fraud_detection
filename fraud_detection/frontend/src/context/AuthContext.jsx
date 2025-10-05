import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token is expired
          handleLogout();
        } else {
          // Token is valid
          const savedUser = localStorage.getItem(USER_KEY);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (error) {
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password, rememberMe) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { access_token, user } = response.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store authentication data
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Set up axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Update state
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.detail || 
                         (error.response?.data?.detail) || 
                         error.message || 
                         'Login failed. Please check your credentials.';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering with data:', userData);
      const response = await axios.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = () => {
    handleLogout();
  };

  const updateCredits = (newCredits) => {
    setUser(prev => ({ ...prev, credits: newCredits }));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loading,
    updateCredits,
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};