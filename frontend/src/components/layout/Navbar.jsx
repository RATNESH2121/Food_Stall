import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Bell, Search, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [showProfile, setShowProfile] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const roleLabel = user?.role === 'admin' || user?.role === 'district_admin' 
    ? 'Admin Portal'
    : user?.role === 'vendor' 
    ? 'Vendor Portal' 
    : 'Student Portal';

  const dashPath = (user?.role === 'admin' || user?.role === 'district_admin') 
    ? '/district_admin/dashboard' 
    : user?.role === 'vendor' 
    ? '/vendor/dashboard' 
    : '/student/dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center px-6 gap-4 sticky top-0 z-20 flex-shrink-0">
      {/* Date */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
        {today}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, stalls..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Cart for students */}
        {user?.role === 'student' && (
          <Link to="/student/cart" className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/60 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{roleLabel}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { logout(); setShowProfile(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
