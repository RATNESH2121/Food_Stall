import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchOrders(); // refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to cancel order");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-lg text-slate-900">Order {order.order_id}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-slate-500">
                  Pickup: {order.pickup_date} at {order.pickup_time}
                </p>
                <div className="mt-2 text-sm text-slate-600">
                  {order.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end gap-3">
                <span className="font-bold text-xl text-blue-600">₹{order.total_amount}</span>
                <div className="flex space-x-2">
                  {['Booked', 'Preparing'].includes(order.status) && (
                    <Button variant="outline" onClick={() => handleCancel(order.order_id)}>Cancel</Button>
                  )}
                  <Link to={`/student/orders/${order.order_id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            You haven't placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
