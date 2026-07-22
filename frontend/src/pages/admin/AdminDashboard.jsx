import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { ShoppingBag, DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <div className="text-center py-12">Failed to load statistics.</div>;

  const statCards = [
    { title: "Today's Orders", value: stats.todays_orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: "Pending Orders", value: stats.pending_orders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: "Completed Orders", value: stats.completed_orders, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: "Total Revenue", value: `₹${stats.total_revenue}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
