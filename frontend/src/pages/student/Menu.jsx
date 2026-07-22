import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [menuRes, stallRes] = await Promise.all([
          api.get(`/menu?stall_id=${id}`),
          api.get(`/stalls`)
        ]);
        if (menuRes.data.success) {
          setMenuItems(menuRes.data.data);
        }
        if (stallRes.data.success) {
          const currentStall = stallRes.data.data.find(s => s.id === id);
          setStall(currentStall);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  const handleAddToCart = (item) => {
    if (!item.is_available) {
      toast.error('This item is currently unavailable');
      return;
    }
    addToCart({
      id: item.id,
      menu_item_id: item.id,
      item_name: item.item_name,
      price: item.price
    }, id);
    toast.success('Added to cart');
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{stall?.stall_name || 'Menu'}</h1>
          <p className="text-slate-600">Select items to add to your cart</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/student/stalls')}>Back to Stalls</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-row overflow-hidden h-32">
            <div className="w-32 bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs text-slate-400">
              Image
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900">{item.item_name}</h3>
                  <span className="font-bold text-blue-600">₹{item.price}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.category}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-medium ${item.is_available ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
                <Button 
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.is_available}
                  className="px-3 py-1 text-sm"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {menuItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No menu items found for this stall.
          </div>
        )}
      </div>
    </div>
  );
}
