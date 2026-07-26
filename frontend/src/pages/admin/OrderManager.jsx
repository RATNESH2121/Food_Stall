import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw, ShoppingBag, ChevronDown, Check, X } from 'lucide-react';

const STATUS_OPTIONS = ['Booked', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await api.get('/admin/orders');
      if (response.data.success) setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.order_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loader text="Loading Orders..." />;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} total orders across all stalls</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="btn-secondary"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card hover={false}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Pickup Time</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filtered.map((order, i) => (
                    <motion.tr
                      key={order.id || order.order_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="table-cell">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                          {order.order_id}
                        </span>
                      </td>
                      <td className="table-cell max-w-[200px]">
                        <p className="text-xs text-slate-600 truncate">
                          {order.items?.map(i => `${i.quantity}× ${i.item_name}`).join(', ')}
                        </p>
                      </td>
                      <td className="table-cell">
                        <p className="text-xs font-semibold text-slate-700">{order.pickup_time}</p>
                        <p className="text-xs text-slate-400">{order.pickup_date}</p>
                      </td>
                      <td className="table-cell">
                        <span className="font-bold text-slate-900">₹{order.total_amount}</span>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="table-cell">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                          disabled={order.status === 'Cancelled' || order.status === 'Completed' || order.status === 'COMPLETED' || order.status === 'REJECTED'}
                          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
