import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, UtensilsCrossed, AlertCircle } from 'lucide-react';

export default function MyMenu() {
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stallRes = await api.get('/stalls');
      if (stallRes.data.success) {
        const myStall = stallRes.data.data.find(s => s.owner_id === user.id);
        setStall(myStall || null);
        if (myStall) {
          const menuRes = await api.get(`/menu?stall_id=${myStall.id}`);
          setMenuItems(menuRes.data.data || []);
        }
      }
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue('item_name', item.item_name);
      setValue('category', item.category);
      setValue('price', item.price);
      setValue('is_available', item.is_available);
    } else {
      reset({ item_name: '', category: '', price: '', is_available: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    data.price = parseFloat(data.price);
    data.is_available = data.is_available === true || data.is_available === 'true';
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data);
        toast.success('Menu item updated!');
      } else {
        await api.post('/menu', { ...data, stall_id: stall.id });
        toast.success('Menu item added!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!stall) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-orange-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">No Stall Found</h2>
      <p className="text-slate-500 mb-4">Please create your stall first before adding menu items.</p>
      <a href="/vendor/mystall" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
        Create My Stall
      </a>
    </div>
  );

  const groupedByCategory = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Menu</h1>
          <p className="text-slate-500 text-sm mt-1">{stall.stall_name} — {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-xl py-16">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-600 font-medium mb-2">No items yet</h3>
          <p className="text-slate-400 text-sm mb-4">Add your first food item to get started</p>
          <Button onClick={() => openModal()}>Add First Item</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{category}</h2>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.item_name}</p>
                        <p className="text-sm text-slate-500">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add New Item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input label="Item Name" id="item_name" placeholder="e.g. Paneer Sandwich" {...register('item_name', { required: true })} />
          <Input label="Category" id="category" placeholder="e.g. Snacks, Drinks, Meals" {...register('category', { required: true })} />
          <Input label="Price (₹)" id="price" type="number" step="0.5" min="1" placeholder="e.g. 50" {...register('price', { required: true, min: 1 })} />
          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="is_available" {...register('is_available')} defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700">Item is currently available</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
