import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    try {
      const [menuRes, stallRes] = await Promise.all([
        api.get('/menu'),
        api.get('/stalls')
      ]);
      setMenuItems(menuRes.data.data || []);
      setStalls(stallRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStallName = (stallId) => {
    const stall = stalls.find(s => s.id === stallId);
    return stall ? stall.stall_name : 'Unknown';
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue('stall_id', item.stall_id);
      setValue('item_name', item.item_name);
      setValue('category', item.category);
      setValue('price', item.price);
      setValue('is_available', item.is_available);
    } else {
      reset({ stall_id: stalls[0]?.id || '', item_name: '', category: '', price: '', is_available: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    data.price = parseFloat(data.price);
    
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data);
        toast.success('Menu item updated');
      } else {
        await api.post('/menu', data);
        toast.success('Menu item added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Menu item deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Manage Menu Items</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <Table headers={["Item Name", "Stall", "Category", "Price", "Availability", "Actions"]}>
        {menuItems.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.item_name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getStallName(item.stall_id)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">₹{item.price}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {item.is_available ? 'Yes' : 'No'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Menu Item" : "Add Menu Item"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {!editingItem && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stall</label>
              <select {...register("stall_id", { required: true })} className="w-full border-slate-300 rounded-md shadow-sm p-2 border">
                {stalls.map(s => <option key={s.id} value={s.id}>{s.stall_name}</option>)}
              </select>
            </div>
          )}
          <Input label="Item Name" id="item_name" {...register("item_name", { required: true })} />
          <Input label="Category" id="category" {...register("category", { required: true })} />
          <Input label="Price (₹)" id="price" type="number" step="0.01" {...register("price", { required: true, min: 1 })} />
          
          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="is_available" {...register("is_available")} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700">Is Available</label>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? "Save Changes" : "Add Item"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
