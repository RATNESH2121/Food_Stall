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

  const login = async (registration_number, password) => {
    try {
      const response = await api.post('/auth/login', { registration_number, password });
      if (response.data.success) {
        const { access_token, student } = response.data.data;
        localStorage.setItem('token', access_token);
        
        let role = student.role || 'student';
        if (registration_number === 'admin') {
          role = 'district_admin';
        }
        
        const userData = { ...student, role };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(response.data.message);
        navigate(`/${role}/dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
