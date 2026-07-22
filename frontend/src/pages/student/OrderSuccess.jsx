import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
          <p className="text-slate-600 mt-2">Your order has been confirmed and sent to the stall.</p>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-semibold text-slate-900">{order.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pickup Time:</span>
            <span className="font-semibold text-slate-900">{order.pickup_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-semibold text-slate-900">₹{order.total_amount}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button className="w-full" onClick={() => navigate(`/student/orders/${order.order_id}`)}>
            View Order Details
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
