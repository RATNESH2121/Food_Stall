import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, UtensilsCrossed, ShoppingBag, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  const [menuCount, setMenuCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stallRes, orderRes] = await Promise.all([
          api.get('/stalls'),
          api.get('/orders/vendor').catch(() => ({ data: { data: [] } }))
        ]);

        if (stallRes.data.success) {
          const myStall = stallRes.data.data.find(s => s.owner_id === user.id);
          setStall(myStall || null);

          if (myStall) {
            const menuRes = await api.get(`/menu?stall_id=${myStall.id}`);
            setMenuCount(menuRes.data.data?.length || 0);
          }
        }

        setOrders(orderRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const pendingOrders = orders.filter(o => ['Booked', 'Preparing'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.total_amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!stall) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.full_name}!</h1>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-10 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Your Stall</h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">You haven't created your stall yet. Create it now to start adding food items and accepting orders!</p>
        <Link
          to="/vendor/mystall"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Create My Stall
        </Link>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Menu Items', value: menuCount, icon: UtensilsCrossed, color: 'text-blue-600', bg: 'bg-blue-100', link: '/vendor/mymenu' },
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/vendor/orders' },
    { label: 'Completed Orders', value: completedOrders, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/vendor/orders' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', link: '/vendor/orders' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.full_name}!</h1>
          <p className="text-slate-500 mt-1">Manage your stall and track orders here.</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stall.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          Stall: {stall.is_open ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{stall.stall_name}</h2>
              <p className="text-sm text-slate-500">{stall.description || 'No description set'}</p>
              <p className="text-xs text-slate-400 mt-1">Hours: {stall.opening_time} – {stall.closing_time}</p>
            </div>
          </div>
          <Link to="/vendor/mystall" className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
            Edit Stall <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/vendor/mymenu" className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Manage Menu</h3>
              <p className="text-blue-100 text-sm">Add, edit, or remove food items</p>
            </div>
            <UtensilsCrossed className="w-10 h-10 opacity-70" />
          </div>
        </Link>
        <Link to="/vendor/orders" className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white hover:from-emerald-700 hover:to-emerald-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">View Orders</h3>
              <p className="text-emerald-100 text-sm">Track and update incoming orders</p>
            </div>
            <ShoppingBag className="w-10 h-10 opacity-70" />
          </div>
        </Link>
      </div>
    </div>
  );
}
