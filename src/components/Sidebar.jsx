
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Box,
  Store,
  Users,
  FileText,
  Settings,
  LogOut,
  Package,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get the role from the user's first active business membership.
  const activeBusiness = user?.businesses?.find(
  (business) => business.is_active !== false
  ) ?? user?.businesses?.[0] ?? null;

  const role = activeBusiness?.role ?? user?.role ?? null;
  console.log('Logged-in user:', user);
  console.log('Active business:', activeBusiness);
  console.log('Resolved role:', role);

  const allMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['owner', 'admin', 'manager', 'cashier', 'stock_manager', 'accountant'],
    },
    {
      name: 'Sales',
      icon: ShoppingCart,
      path: '/dashboard/sales',
      roles: ['owner', 'admin', 'manager', 'cashier'],
    },
    {
      name: 'Inventory',
      icon: Box,
      path: '/dashboard/inventory',
      roles: ['owner', 'admin', 'manager', 'stock_manager'],
    },
    {
      name: 'Purchasing',
      icon: Store,
      path: '/dashboard/purchasing',
      roles: ['owner', 'admin', 'manager'],
    },
    {
      name: 'Reports',
      icon: FileText,
      path: '/dashboard/reports',
      roles: ['owner', 'admin', 'manager', 'accountant'],
    },
    {
      name: 'Employees',
      icon: Users,
      path: '/dashboard/employees',
      roles: ['owner', 'admin'],
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      roles: ['owner', 'admin'],
    },
    { name: 'Payment Methods',
       icon: CreditCard,
        path: '/dashboard/payment-methods',
         roles: ['super_admin'] },
    { name: 'Audit Logs',
       icon: ShieldAlert, 
       path: '/dashboard/audit-logs', 
       roles: ['super_admin'] },
  ];

  const menuItems = allMenuItems.filter(
  (item) => !role || item.roles.includes(role)
);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-[#0f172a] text-slate-300 shadow-xl">
      <div className="flex flex-col items-center border-b border-slate-700/50 p-6">
        <div className="mb-3 rounded-xl bg-blue-600 p-2.5 shadow-lg shadow-blue-500/30">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wide text-white">
          Universal POS
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Smarter Business. Better Control.
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `group flex items-center rounded-lg px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col space-y-4 border-t border-slate-700/50 p-4">
        {user && (
          <div className="flex items-center px-2">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {(user.first_name || user.username || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <p className="max-w-[120px] truncate text-sm font-semibold text-white">
                {user.first_name || user.username || 'User'}
              </p>
              <p className="text-xs capitalize text-slate-400">
                {role || 'No business role'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
