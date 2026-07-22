import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { cart, stallId, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCart();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSlots([
      { time: "12:30 PM", available: true },
      { time: "1:00 PM", available: true },
      { time: "1:30 PM", available: true },
      { time: "2:00 PM", available: true }
    ]);
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      toast.error('Please select a pickup time');
      return;
    }

    setPlacingOrder(true);
    const orderData = {
      stall_id: stallId,
      items: cart.map(item => ({
        menu_item_id: item.menu_item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price
      })),
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_time: selectedSlot
    };

    try {
      const response = await api.post('/orders', orderData);
      if (response.data.success) {
        toast.success(response.data.message);
        clearCart();
        navigate('/student/order-success', { state: { order: response.data.data } });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <ShoppingCart className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-medium text-slate-600">Your cart is empty</h2>
        <Button onClick={() => navigate('/student/stalls')}>Browse Food Stalls</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">{item.item_name}</h4>
                <p className="text-sm text-slate-500">₹{item.price}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-100 rounded-md">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-slate-200 rounded-l-md"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-slate-200 rounded-r-md"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="w-16 text-right font-semibold">
                  ₹{item.price * item.quantity}
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
        
        <div>
          <Card className="p-6 space-y-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Pickup Time</label>
                <select 
                  className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">-- Select Time --</option>
                  {slots.map((slot) => (
                    <option key={slot.time} value={slot.time}>{slot.time}</option>
                  ))}
                </select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal()}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
