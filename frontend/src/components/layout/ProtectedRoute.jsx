import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="flex">
      <Sidebar role={user.role} />
      <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-4rem)]">
        <Outlet />
      </div>
    </div>
  );
}
