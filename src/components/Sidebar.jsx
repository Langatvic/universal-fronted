import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Box, Store, Users, 
  FileText, Settings, LogOut, Package 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Define all menu items with their allowed roles
  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { name: 'Sales', icon: ShoppingCart, path: '/dashboard/sales', roles: ['admin', 'manager', 'employee'] },
    { name: 'Inventory', icon: Box, path: '/dashboard/inventory', roles: ['admin', 'manager'] },
    { name: 'Purchasing', icon: Store, path: '/dashboard/purchasing', roles: ['admin', 'manager'] },
    { name: 'Customers', icon: Users, path: '/dashboard/customers', roles: ['admin', 'manager'] },
    { name: 'Reports', icon: FileText, path: '/dashboard/reports', roles: ['admin', 'manager'] },
    { name: 'Employees', icon: Users, path: '/dashboard/employees', roles: ['admin'] },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', roles: ['admin'] },
  ];

  // 2. Filter the menu based on the logged-in user's role
  const menuItems = allMenuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // 3. Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#0f172a] text-slate-300 h-screen flex flex-col fixed left-0 top-0 shadow-xl z-20">
      {/* Logo Area */}
      <div className="p-6 flex flex-col items-center border-b border-slate-700/50">
        <div className="bg-blue-600 p-2.5 rounded-xl mb-3 shadow-lg shadow-blue-500/30">
          <Package className="text-white w-8 h-8" />
        </div>
        <h1 className="text-white text-xl font-bold tracking-wide">Universal POS</h1>
        <p className="text-xs text-slate-400 mt-1">Smarter Business. Better Control.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'} // Ensures Dashboard isn't always active
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700/50 flex flex-col space-y-4">
        {user && (
          <div className="flex items-center px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;