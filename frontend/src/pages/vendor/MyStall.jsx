import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function MyStall() {
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ stall_name: '', description: '', opening_time: '09:00', closing_time: '22:00', is_open: true });

  useEffect(() => {
    fetchStall();
  }, []);

  const fetchStall = async () => {
    try {
      const response = await api.get('/stalls');
      if (response.data.success) {
        const myStall = response.data.data.find(s => s.owner_id === user.id);
        if (myStall) {
          setStall(myStall);
          setFormData({ stall_name: myStall.stall_name, description: myStall.description || '', opening_time: myStall.opening_time, closing_time: myStall.closing_time, is_open: myStall.is_open });
        }
      }
    } catch (error) {
      console.error('Failed to fetch stall', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (stall) {
        await api.put(/stalls/, formData);
        toast.success('Stall updated!');
      } else {
        await api.post('/stalls', formData);
        toast.success('Stall created!');
        fetchStall();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{stall ? 'Edit My Stall' : 'Create My Stall'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <Input label="Stall Name" id="stall_name" value={formData.stall_name} onChange={e => setFormData({...formData, stall_name: e.target.value})} required />
        <Input label="Description" id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <Input type="time" label="Opening Time" id="opening_time" value={formData.opening_time} onChange={e => setFormData({...formData, opening_time: e.target.value})} required />
          <Input type="time" label="Closing Time" id="closing_time" value={formData.closing_time} onChange={e => setFormData({...formData, closing_time: e.target.value})} required />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="is_open" checked={formData.is_open} onChange={e => setFormData({...formData, is_open: e.target.checked})} />
          <label htmlFor="is_open">Stall is Open for Business</label>
        </div>
        <Button type="submit">{stall ? 'Update Stall' : 'Create Stall'}</Button>
      </form>
    </div>
  );
}
