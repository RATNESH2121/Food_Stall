import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const response = await api.get('/stalls');
        if (response.data.success) {
          const myStall = response.data.data.find(s => s.owner_id === user.id);
          setStall(myStall);
        }
      } catch (error) {
        console.error('Failed to fetch stalls', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [user.id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.full_name}</h1>
        <p className="text-slate-600 mt-1">Vendor Dashboard</p>
      </div>

      {!stall ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-semibold mb-4">You don't have a stall yet!</h2>
          <p className="text-slate-600 mb-6">Create your stall to start selling food.</p>
          <Link to="/vendor/mystall" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Create Stall
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">My Stall</h3>
            <p className="text-slate-600 mb-4">{stall.stall_name}</p>
            <Link to="/vendor/mystall" className="text-blue-600 hover:underline">Edit Stall Details &rarr;</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">My Menu</h3>
            <p className="text-slate-600 mb-4">Manage your food items</p>
            <Link to="/vendor/mymenu" className="text-blue-600 hover:underline">Manage Menu &rarr;</Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">Live Orders</h3>
            <p className="text-slate-600 mb-4">View incoming orders</p>
            <Link to="/vendor/orders" className="text-blue-600 hover:underline">View Orders &rarr;</Link>
          </div>
        </div>
      )}
    </div>
  );
}
