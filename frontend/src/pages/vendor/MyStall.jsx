import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Store, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MyStall() {
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    stall_name: '',
    description: '',
    opening_time: '09:00',
    closing_time: '22:00',
    is_open: true,
  });

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
          setFormData({
            stall_name: myStall.stall_name,
            description: myStall.description || '',
            opening_time: myStall.opening_time,
            closing_time: myStall.closing_time,
            is_open: myStall.is_open,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load stall info');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (stall) {
        await api.put(`/stalls/${stall.id}`, formData);
        toast.success('Stall updated successfully!');
        fetchStall();
      } else {
        await api.post('/stalls', formData);
        toast.success('Stall created successfully!');
        fetchStall();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{stall ? 'Edit My Stall' : 'Create My Stall'}</h1>
        <p className="text-slate-500 mt-1">{stall ? 'Update your stall details below.' : 'Set up your stall to start taking orders.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stall Name *</label>
          <input
            name="stall_name"
            value={formData.stall_name}
            onChange={handleChange}
            required
            placeholder="e.g. Ratnesh's Snack Corner"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="What makes your stall special? Tell students about your food..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Opening Time *
            </label>
            <input
              type="time"
              name="opening_time"
              value={formData.opening_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Closing Time *
            </label>
            <input
              type="time"
              name="closing_time"
              value={formData.closing_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
          <div>
            <p className="font-medium text-slate-800">Stall Status</p>
            <p className="text-sm text-slate-500">Toggle whether your stall is currently open for orders</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_open: !prev.is_open }))}
            className="focus:outline-none"
          >
            {formData.is_open
              ? <ToggleRight className="w-12 h-12 text-emerald-500" />
              : <ToggleLeft className="w-12 h-12 text-slate-400" />
            }
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${formData.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {formData.is_open ? 'Open for orders' : 'Currently closed'}
          </span>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : stall ? 'Save Changes' : 'Create Stall'}
          </Button>
        </div>
      </form>

      {stall && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>Tip:</strong> Your stall is visible to all students on the Food Stalls page. Make sure your stall name and description are clear and inviting!
        </div>
      )}
    </div>
  );
}
