import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          const stats = response.data.data;
          
          // Generate a mock week trend based on real totals for visualization
          const mockData = [
            { name: 'Mon', orders: Math.floor(stats.total_orders * 0.1), revenue: 500 },
            { name: 'Tue', orders: Math.floor(stats.total_orders * 0.15), revenue: 750 },
            { name: 'Wed', orders: Math.floor(stats.total_orders * 0.12), revenue: 600 },
            { name: 'Thu', orders: Math.floor(stats.total_orders * 0.2), revenue: 1000 },
            { name: 'Fri', orders: Math.floor(stats.total_orders * 0.25), revenue: 1250 },
            { name: 'Sat', orders: Math.floor(stats.total_orders * 0.1), revenue: 500 },
            { name: 'Sun', orders: Math.floor(stats.total_orders * 0.08), revenue: 400 },
          ];
          setData(mockData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Weekly Order Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" name="Total Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
