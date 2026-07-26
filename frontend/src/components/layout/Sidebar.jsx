import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Store, MenuSquare, ShoppingBag, UserCircle, 
  LogOut, BarChart3, UtensilsCrossed, ChefHat, ChevronLeft, ChevronRight,
  Bell, Settings, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Food Stalls', path: '/student/stalls', icon: Store },
    { name: 'My Orders', path: '/student/orders', icon: ShoppingBag },
    { name: 'Profile', path: '/student/profile', icon: UserCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/district_admin/dashboard', icon: LayoutDashboard },
    { name: 'Stalls', path: '/district_admin/stalls', icon: Store },
    { name: 'Menu', path: '/district_admin/menu', icon: MenuSquare },
    { name: 'Orders', path: '/district_admin/orders', icon: ShoppingBag },
    { name: 'Reports', path: '/district_admin/reports', icon: BarChart3 },
  ];

  const vendorLinks = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'My Stall', path: '/vendor/mystall', icon: Store },
    { name: 'My Menu', path: '/vendor/mymenu', icon: UtensilsCrossed },
    { name: 'Orders', path: '/vendor/orders', icon: ShoppingBag },
  ];

  const links = (role === 'admin' || role === 'district_admin') ? adminLinks 
    : role === 'vendor' ? vendorLinks 
    : studentLinks;

  const roleLabel = (role === 'admin' || role === 'district_admin') ? 'Administrator' 
    : role === 'vendor' ? 'Vendor' 
    : 'Student';

  const roleColor = (role === 'admin' || role === 'district_admin') ? 'bg-purple-100 text-purple-700' 
    : role === 'vendor' ? 'bg-orange-100 text-orange-700' 
    : 'bg-blue-100 text-blue-700';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-white border-r border-slate-100 shadow-sm overflow-hidden flex-shrink-0 z-30"
    >
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm leading-none">SmartFood</p>
                <p className="text-xs text-slate-400 mt-0.5">LPU Campus</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200 mx-auto">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm z-10 ${collapsed ? 'left-1/2 -translate-x-1/2 right-auto top-[52px]' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </motion.button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              title={collapsed ? link.name : undefined}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-2 py-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name || 'Admin'}</p>
                <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-md ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="flex-shrink-0 h-5 w-5" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
