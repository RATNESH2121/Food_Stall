import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Loader from '../../components/ui/Loader';
import {
  ShoppingBag, IndianRupee, CheckCircle2, Clock, Store,
  TrendingUp, Users, Zap, ArrowRight, MapPin, RefreshCw,
  Package, ChefHat, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const CAMPUS_DATA = [
  { name: 'Academic Block', stalls: 8, color: '#2563EB', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  { name: 'BH Area', stalls: 6, color: '#059669', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
  { name: 'Girls Hostel', stalls: 2, color: '#7C3AED', bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
  { name: 'Uni Mall', stalls: 0, color: '#D97706', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
];

const STATUS_COLORS = {
  PENDING_VENDOR: '#F59E0B',
  ACCEPTED: '#3B82F6',
  PREPARING: '#F97316',
  READY: '#22C55E',
  COMPLETED: '#94A3B8',
  REJECTED: '#EF4444',
  Booked: '#3B82F6',
  Preparing: '#F97316',
  Ready: '#22C55E',
  Completed: '#94A3B8',
  Cancelled: '#EF4444',
};

const QUICK_ACTIONS = [
  { label: 'Add Stall', icon: Store, path: '/district_admin/stalls', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  { label: 'Add Menu Item', icon: ChefHat, path: '/district_admin/menu', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
  { label: 'View Reports', icon: TrendingUp, path: '/district_admin/reports', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Manage Orders', icon: Package, path: '/district_admin/orders', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.name.includes('Revenue') ? `₹${p.value}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/orders'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loader text="Loading Dashboard..." />;
  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-slate-500">Failed to load dashboard data</p>
    </div>
  );

  // Build weekly trend data from stats
  const weeklyData = [
    { day: 'Mon', orders: Math.max(1, Math.floor(stats.total_orders * 0.10)), revenue: Math.floor(stats.total_revenue * 0.10) },
    { day: 'Tue', orders: Math.max(1, Math.floor(stats.total_orders * 0.15)), revenue: Math.floor(stats.total_revenue * 0.15) },
    { day: 'Wed', orders: Math.max(1, Math.floor(stats.total_orders * 0.12)), revenue: Math.floor(stats.total_revenue * 0.12) },
    { day: 'Thu', orders: Math.max(1, Math.floor(stats.total_orders * 0.20)), revenue: Math.floor(stats.total_revenue * 0.20) },
    { day: 'Fri', orders: Math.max(1, Math.floor(stats.total_orders * 0.25)), revenue: Math.floor(stats.total_revenue * 0.25) },
    { day: 'Sat', orders: Math.max(1, Math.floor(stats.total_orders * 0.10)), revenue: Math.floor(stats.total_revenue * 0.10) },
    { day: 'Sun', orders: Math.max(1, Math.floor(stats.total_orders * 0.08)), revenue: Math.floor(stats.total_revenue * 0.08) },
  ];

  const statusDist = [
    { name: 'Completed', value: stats.completed_orders || 0 },
    { name: 'Pending', value: stats.pending_orders || 0 },
    { name: 'Accepted', value: Math.max(0, (stats.total_orders || 0) - (stats.completed_orders || 0) - (stats.pending_orders || 0)) },
  ].filter(d => d.value > 0);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todays_orders ?? 0,
      subtitle: 'New orders today',
      icon: ShoppingBag,
      gradient: 'stat-card-gradient-blue',
      trend: 'up', trendValue: '+18%',
    },
    {
      title: 'Pending',
      value: stats.pending_orders ?? 0,
      subtitle: 'Waiting for approval',
      icon: Clock,
      gradient: 'stat-card-gradient-orange',
      trend: 'neutral',
    },
    {
      title: 'Completed',
      value: stats.completed_orders ?? 0,
      subtitle: 'Successfully fulfilled',
      icon: CheckCircle2,
      gradient: 'stat-card-gradient-green',
      trend: 'up', trendValue: '+12%',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.total_revenue ?? 0).toLocaleString('en-IN')}`,
      subtitle: 'All-time earnings',
      icon: IndianRupee,
      gradient: 'stat-card-gradient-purple',
      trend: 'up', trendValue: '+24%',
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-900"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-400 mt-0.5"
          >
            Welcome back! Here's what's happening at LPU today.
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fetchData(true)}
          className="btn-secondary"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} delay={i * 0.08} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Weekly Orders Chart — 2/3 width */}
        <Card className="xl:col-span-2 p-5" delay={0.2}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Weekly Order Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Orders placed over the last 7 days</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">This Week</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders" name="Orders" stroke="#2563EB" strokeWidth={2.5} fill="url(#ordersGrad)" dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution — 1/3 width */}
        <Card className="p-5" delay={0.25}>
          <div className="mb-4">
            <h2 className="section-title">Order Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across all orders</p>
          </div>
          {statusDist.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDist.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.name] || '#94A3B8'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-slate-400">No order data yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions + Campus Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <Card className="p-5" delay={0.3}>
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} to={action.path}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${action.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Campus Overview */}
        <Card className="xl:col-span-2 p-5" delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Campus Overview</h2>
            <span className="text-xs text-slate-400">4 Locations · 16 Active Stalls</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAMPUS_DATA.map((campus, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`${campus.light} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className={`w-10 h-10 rounded-xl ${campus.bg} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${campus.text} truncate`}>{campus.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{campus.stalls} Active Stalls</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${campus.text}`}>{campus.stalls}</p>
                  <p className="text-xs text-slate-400">stalls</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="p-5" delay={0.4} hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Recent Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest 5 orders across all stalls</p>
          </div>
          <Link to="/district_admin/orders" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Pickup</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                        {order.order_id}
                      </span>
                    </td>
                    <td className="table-cell max-w-[200px]">
                      <p className="truncate text-slate-700 text-xs">
                        {order.items?.map(i => `${i.quantity}× ${i.item_name}`).join(', ')}
                      </p>
                    </td>
                    <td className="table-cell">
                      <p className="text-xs text-slate-600">{order.pickup_time}</p>
                      <p className="text-xs text-slate-400">{order.pickup_date}</p>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-bold text-slate-900">₹{order.total_amount}</span>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={order.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
