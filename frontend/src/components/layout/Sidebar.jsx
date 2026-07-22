import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, MenuSquare, ShoppingBag, UserCircle, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  
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

  const links = (role === 'admin' || role === 'district_admin') ? adminLinks : studentLinks;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
        <button
          onClick={logout}
          className="flex-shrink-0 group block w-full flex items-center text-sm font-medium text-slate-600 hover:text-red-600"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
