import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        if (response.data.success) {
          const orders = response.data.data;
          setStats({
            total: orders.length,
            pending: orders.filter(o => ['Booked', 'Preparing', 'Ready'].includes(o.status)).length,
            completed: orders.filter(o => o.status === 'Completed').length,
            cancelled: orders.filter(o => o.status === 'Cancelled').length,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { title: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pending Orders', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
      
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
