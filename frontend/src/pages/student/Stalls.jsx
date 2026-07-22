import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';

export default function Stalls() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const response = await api.get('/stalls');
        if (response.data.success) {
          setStalls(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStalls();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Food Stalls</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stalls.map((stall) => (
          <Card key={stall.id} className="flex flex-col">
            <div className="h-48 bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400 font-medium">Image Placeholder</span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900">{stall.stall_name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stall.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {stall.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-slate-600 mb-4 flex-1">{stall.description}</p>
              <div className="text-sm text-slate-500 mb-4">
                Timings: {stall.opening_time} - {stall.closing_time}
              </div>
              <Link to={`/student/stalls/${stall.id}/menu`}>
                <Button className="w-full">View Menu</Button>
              </Link>
            </div>
          </Card>
        ))}
        {stalls.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No food stalls available right now.
          </div>
        )}
      </div>
    </div>
  );
}
