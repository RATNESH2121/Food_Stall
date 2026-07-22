import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function StallManager() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchStalls = async () => {
    try {
      const response = await api.get('/stalls');
      if (response.data.success) {
        setStalls(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load stalls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const openModal = (stall = null) => {
    setEditingStall(stall);
    if (stall) {
      setValue('stall_name', stall.stall_name);
      setValue('description', stall.description);
      setValue('opening_time', stall.opening_time);
      setValue('closing_time', stall.closing_time);
      setValue('is_open', stall.is_open);
    } else {
      reset({ stall_name: '', description: '', opening_time: '', closing_time: '', is_open: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingStall) {
        await api.put(`/stalls/${editingStall.id}`, data);
        toast.success('Stall updated successfully');
      } else {
        await api.post('/stalls', data);
        toast.success('Stall added successfully');
      }
      setIsModalOpen(false);
      fetchStalls();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stall?")) return;
    try {
      await api.delete(`/stalls/${id}`);
      toast.success('Stall deleted');
      fetchStalls();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Manage Food Stalls</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Stall
        </Button>
      </div>

      <Table headers={["Name", "Description", "Timings", "Status", "Actions"]}>
        {stalls.map((stall) => (
          <tr key={stall.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stall.stall_name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{stall.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{stall.opening_time} - {stall.closing_time}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stall.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {stall.is_open ? 'Open' : 'Closed'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button onClick={() => openModal(stall)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(stall.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStall ? "Edit Stall" : "Add New Stall"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input label="Stall Name" id="stall_name" {...register("stall_name", { required: true })} />
          <Input label="Description" id="description" {...register("description")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Opening Time" id="opening_time" {...register("opening_time", { required: true })} />
            <Input label="Closing Time" id="closing_time" {...register("closing_time", { required: true })} />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="is_open" {...register("is_open")} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="is_open" className="text-sm font-medium text-slate-700">Currently Open</label>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingStall ? "Save Changes" : "Create Stall"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
