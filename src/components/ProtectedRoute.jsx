import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait until authentication has been checked.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect users who are not logged in.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get the role from the active business membership or global role.
  const role = user?.businesses?.[0]?.role ?? user?.role ?? null;

  // Restrict pages according to the user's role.
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they don't have permission, send them to a universally safe page (Sales)
    return <Navigate to="/dashboard/sales" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;