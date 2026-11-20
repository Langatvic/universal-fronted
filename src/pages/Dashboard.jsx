import { useAuth } from '../context/AuthContext';

import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import CashierDashboard from './dashboards/CashierDashboard';
import StockManagerDashboard from './dashboards/StockManagerDashboard';
import AccountantDashboard from './dashboards/AccountantDashboard';

const Dashboard = () => {
  const { user, role } = useAuth();

  const normalizedRole = String(
    role || user?.businesses?.[0]?.role || user?.role || ''
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  switch (normalizedRole) {
    case 'super_admin':
      return <SuperAdminDashboard />;

    case 'owner':
    case 'admin':
      return <AdminDashboard />;

    case 'manager':
      return <ManagerDashboard />;

    case 'accountant':
      return <AccountantDashboard />;

    case 'storekeeper':
    case 'stock_manager':
    case 'stockmanager':
    case 'inventory_manager':
      return <StockManagerDashboard />;

    case 'cashier':
      return <CashierDashboard />;

    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold text-red-600">
            Dashboard not configured
          </h2>
          <p className="mt-2 text-slate-600">
            Your account role is: {normalizedRole || 'Unknown'}
          </p>
          <p className="text-sm text-slate-500">
            Contact your administrator to verify your account role.
          </p>
        </div>
      );
  }
};

export default Dashboard;
