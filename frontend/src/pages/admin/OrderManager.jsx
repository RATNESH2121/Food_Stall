import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>

      <Table headers={["Order ID", "Pickup Details", "Items", "Total", "Status", "Action"]}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{order.order_id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
              <div>{order.pickup_date}</div>
              <div className="font-semibold">{order.pickup_time}</div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
              {order.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">₹{order.total_amount}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <StatusBadge status={order.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                className="border-slate-300 rounded-md text-sm p-1 border bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={order.status === 'Cancelled' || order.status === 'Completed'}
              >
                <option value="Booked">Booked</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
