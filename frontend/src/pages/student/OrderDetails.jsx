import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  
  if (!order) {
    return <div className="text-center py-12">Order not found.</div>;
  }

  const timelineStatuses = ["Booked", "Preparing", "Ready", "Completed"];
  // If cancelled, show cancelled UI instead
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Order {order.order_id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Status Timeline</h3>
          {isCancelled ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              This order was cancelled.
            </div>
          ) : (
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
              {timelineStatuses.map((status, index) => {
                const currentIndex = timelineStatuses.indexOf(order.status);
                const isPastOrCurrent = index <= currentIndex;
                
                return (
                  <div key={status} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex justify-center items-center ${isPastOrCurrent ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                      {isPastOrCurrent && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isPastOrCurrent ? 'text-blue-600' : 'text-slate-500'}`}>{status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="font-semibold text-slate-900 border-b pb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-slate-900">{item.quantity}x</span>
                <span className="text-slate-700">{item.item_name}</span>
              </div>
              <span className="text-slate-700">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between font-bold text-lg text-slate-900">
          <span>Total</span>
          <span>₹{order.total_amount}</span>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 border-b pb-4">Pickup Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium">{order.pickup_date}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Time</p>
            <p className="font-medium">{order.pickup_time}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
