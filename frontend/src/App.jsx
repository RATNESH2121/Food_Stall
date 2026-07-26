import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './context/AuthContext';

// Landing
import LandingPage from './pages/Landing';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Stalls from './pages/student/Stalls';
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import OrderSuccess from './pages/student/OrderSuccess';
import MyOrders from './pages/student/MyOrders';
import OrderDetails from './pages/student/OrderDetails';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StallManager from './pages/admin/StallManager';
import MenuManager from './pages/admin/MenuManager';
import OrderManager from './pages/admin/OrderManager';
import Reports from './pages/admin/Reports';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import MyStall from './pages/vendor/MyStall';
import MyMenu from './pages/vendor/MyMenu';
import VendorOrders from './pages/vendor/VendorOrders';

function AppLayout({ children, role }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

      {/* Student Protected Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role="student"><StudentDashboard /></AppLayout>} />
        <Route path="stalls" element={<AppLayout role="student"><Stalls /></AppLayout>} />
        <Route path="stalls/:id/menu" element={<AppLayout role="student"><Menu /></AppLayout>} />
        <Route path="cart" element={<AppLayout role="student"><Cart /></AppLayout>} />
        <Route path="order-success" element={<AppLayout role="student"><OrderSuccess /></AppLayout>} />
        <Route path="orders" element={<AppLayout role="student"><MyOrders /></AppLayout>} />
        <Route path="orders/:id" element={<AppLayout role="student"><OrderDetails /></AppLayout>} />
        <Route path="profile" element={<AppLayout role="student"><Profile /></AppLayout>} />
      </Route>

      {/* Vendor Protected Routes */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']} />}>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role="vendor"><VendorDashboard /></AppLayout>} />
        <Route path="mystall" element={<AppLayout role="vendor"><MyStall /></AppLayout>} />
        <Route path="mymenu" element={<AppLayout role="vendor"><MyMenu /></AppLayout>} />
        <Route path="orders" element={<AppLayout role="vendor"><VendorOrders /></AppLayout>} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/district_admin" element={<ProtectedRoute allowedRoles={['district_admin', 'admin']} />}>
        <Route index element={<Navigate to="/district_admin/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role="admin"><AdminDashboard /></AppLayout>} />
        <Route path="stalls" element={<AppLayout role="admin"><StallManager /></AppLayout>} />
        <Route path="menu" element={<AppLayout role="admin"><MenuManager /></AppLayout>} />
        <Route path="orders" element={<AppLayout role="admin"><OrderManager /></AppLayout>} />
        <Route path="reports" element={<AppLayout role="admin"><Reports /></AppLayout>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl font-bold text-slate-200">404</p>
            <p className="text-slate-500 mt-2">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;
