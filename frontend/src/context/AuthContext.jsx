import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      if (response.data.success) {
        const { access_token, student } = response.data.data;
        
        // Clear any stale session data first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        localStorage.setItem('token', access_token);
        
        // Determine role — trust the backend, fall back to student only if truly missing
        let role = student.role || 'student';
        // Special case: hardcoded admin login by identifier
        if (identifier === 'admin') {
          role = 'district_admin';
        }
        
        const userData = { ...student, role };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`Welcome back, ${student.full_name || 'User'}!`);
        
        // Route to the correct dashboard based on role
        if (role === 'district_admin' || role === 'admin') {
          navigate('/district_admin/dashboard');
        } else if (role === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
