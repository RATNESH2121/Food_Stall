import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, RefreshCw, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';

const STATUS_COLORS = {
  PENDING_VENDOR: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  Booked: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  Preparing: 'bg-purple-100 text-purple-800',
  READY: 'bg-emerald-100 text-emerald-800',
  Ready: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-slate-100 text-slate-800',
  Completed: 'bg-slate-100 text-slate-800',
  REJECTED: 'bg-red-100 text-red-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/vendor');
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filter.toLowerCase());

  const tabs = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'New Requests', count: orders.filter(o => ['PENDING_VENDOR', 'Booked'].includes(o.status)).length },
    { id: 'preparing', label: 'Preparing', count: orders.filter(o => ['ACCEPTED', 'PREPARING', 'Preparing'].includes(o.status)).length },
    { id: 'ready', label: 'Ready', count: orders.filter(o => ['READY', 'Ready'].includes(o.status)).length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => ['COMPLETED', 'Completed'].includes(o.status)).length },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incoming Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Auto-refreshes every 30 seconds</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-xl py-16">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-600 font-medium">No orders found</h3>
          <p className="text-slate-400 text-sm mt-1">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{order.order_id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status === 'PENDING_VENDOR' ? '🟡 Pending Approval' : order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Student ID: <strong>{order.student_id}</strong>
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Placed: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">₹{order.total_amount?.toFixed(2)}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">Items Ordered</p>
                <div className="space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">{item.item_name} × {item.quantity}</span>
                      <span className="text-slate-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Based on Lifecycle State */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                {['PENDING_VENDOR', 'Booked'].includes(order.status) && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'REJECTED')}
                      disabled={updating === order.order_id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'ACCEPTED')}
                      disabled={updating === order.order_id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Order
                    </button>
                  </>
                )}

                {order.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'PREPARING')}
                    disabled={updating === order.order_id}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <ChefHat className="w-4 h-4" /> Mark as Preparing
                  </button>
                )}

                {['PREPARING', 'Preparing'].includes(order.status) && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'READY')}
                    disabled={updating === order.order_id}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Ready
                  </button>
                )}

                {['READY', 'Ready'].includes(order.status) && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'COMPLETED')}
                    disabled={updating === order.order_id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Complete Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
