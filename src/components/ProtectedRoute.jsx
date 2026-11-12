import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccess, homePathFor } from '../utils/permissions';
import { Spinner } from './ui';

/**
 * Guards a group of routes.
 *  - not signed in            -> /login
 *  - `feature` given and the role may not use it -> that role's home page
 */
const ProtectedRoute = ({ feature }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner label="Checking authentication..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (feature && !canAccess(role, feature)) {
    return <Navigate to={homePathFor(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
