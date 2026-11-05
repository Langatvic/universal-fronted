cd
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait until authentication has been checked.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Redirect users who are not logged in.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get the role from the active business membership.
  const role =
    user?.businesses?.[0]?.role ??
    user?.role ??
    null;

  // Restrict pages according to the user's role.
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
