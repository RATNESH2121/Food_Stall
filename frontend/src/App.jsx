import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';

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

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="stalls" element={<Stalls />} />
            <Route path="stalls/:id/menu" element={<Menu />} />
            <Route path="cart" element={<Cart />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Vendor Protected Routes */}
          <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route index element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="mystall" element={<MyStall />} />
            <Route path="mymenu" element={<MyMenu />} />
            <Route path="orders" element={<VendorOrders />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/district_admin" element={<ProtectedRoute allowedRoles={['district_admin', 'admin']} />}>
            <Route index element={<Navigate to="/district_admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="stalls" element={<StallManager />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
