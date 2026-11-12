import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Purchasing from './pages/Purchasing';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { homePathFor } from './utils/permissions';

// "/" sends signed-in users to their home page and everyone else to the login.
const RootRedirect = () => {
  const { user, loading, role } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homePathFor(role) : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Everything under /dashboard needs a signed-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />

            <Route element={<ProtectedRoute feature="sales" />}>
              <Route path="sales" element={<Sales />} />
            </Route>

            <Route element={<ProtectedRoute feature="inventory" />}>
              <Route path="inventory" element={<Inventory />} />
            </Route>

            <Route element={<ProtectedRoute feature="purchasing" />}>
              <Route path="purchasing" element={<Purchasing />} />
            </Route>

            <Route element={<ProtectedRoute feature="reports" />}>
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route element={<ProtectedRoute feature="employees" />}>
              <Route path="employees" element={<Employees />} />
            </Route>

            <Route element={<ProtectedRoute feature="settings" />}>
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
