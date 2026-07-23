import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={(user?.role === 'admin' || user?.role === 'district_admin') ? '/district_admin/dashboard' : user?.role === 'vendor' ? '/vendor/dashboard' : '/student/dashboard'} className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">SmartFood</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {user.role === 'student' && (
                  <Link to="/student/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center space-x-2 text-slate-600 border-l pl-4 border-slate-200">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.full_name || 'Admin'}</span>
                </div>
                
                <button
                  onClick={logout}
                  className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
