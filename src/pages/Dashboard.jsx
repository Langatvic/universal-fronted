import { useAuth } from '../context/AuthContext';
import { 
  Users, ShieldAlert, FileText, Box, Tags, CreditCard, 
  Activity, Settings, Database, TrendingUp, ShoppingBag, 
  DollarSign, Package, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Match the logic from ProtectedRoute
  const role = user?.businesses?.[0]?.role ?? user?.role ?? null;
  const isSuperAdmin = role === 'super_admin';

  // --- SUPER ADMIN DASHBOARD ---
  if (isSuperAdmin) {
    const adminActions = [
      { title: 'User Accounts', desc: 'Create, edit, or deactivate users', icon: Users, path: '/dashboard/employees', color: 'text-blue-600', bg: 'bg-blue-100' },
      { title: 'Roles & Permissions', desc: 'Assign roles and system access', icon: ShieldAlert, path: '/dashboard/settings', color: 'text-purple-600', bg: 'bg-purple-100' },
      { title: 'Financial Reports', desc: 'Access all company-wide reports', icon: FileText, path: '/dashboard/reports', color: 'text-green-600', bg: 'bg-green-100' },
      { title: 'Products & Inventory', desc: 'Manage catalog and stock levels', icon: Box, path: '/dashboard/inventory', color: 'text-orange-600', bg: 'bg-orange-100' },
      { title: 'Pricing & Discounts', desc: 'Set selling prices and rules', icon: Tags, path: '/dashboard/inventory', color: 'text-pink-600', bg: 'bg-pink-100' },
      { title: 'Payment Methods', desc: 'Configure cash, card, and mobile', icon: CreditCard, path: '/dashboard/payment-methods', color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { title: 'Employee Activity', desc: 'View shift logs and actions', icon: Activity, path: '/dashboard/employees', color: 'text-red-600', bg: 'bg-red-100' },
      { title: 'System Settings', desc: 'Configure system preferences', icon: Settings, path: '/dashboard/settings', color: 'text-slate-600', bg: 'bg-slate-100' },
      { title: 'Audit Logs', desc: 'Review system security logs', icon: ShieldAlert, path: '/dashboard/audit-logs', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      { title: 'Backup & Restore', desc: 'Manage database backups', icon: Database, path: '/dashboard/settings', color: 'text-teal-600', bg: 'bg-teal-100' },
    ];

    return (
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              Super Admin Dashboard
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-200">
                Full Access
              </span>
            </h1>
            <p className="text-slate-500 mt-2">Welcome back, {user?.username || 'Admin'}. Here is your system overview.</p>
          </div>
          <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            Last Login: <span className="font-semibold text-slate-800">Today, 08:30 AM</span>
          </div>
        </div>

        {/* System Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-300 text-sm font-medium mb-1">Total System Users</p>
              <h3 className="text-3xl font-bold">14</h3>
              <p className="text-xs text-green-400 mt-3 flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> 2 new this week
              </p>
            </div>
            <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1">Total Business Transactions</p>
              <h3 className="text-3xl font-bold">KES 4.2M</h3>
              <p className="text-xs text-blue-200 mt-3 flex items-center font-medium">
                Across all branches
              </p>
            </div>
            <ShoppingBag className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-500 text-sm font-medium mb-1">System Status</p>
              <h3 className="text-3xl font-bold text-green-600 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Online
              </h3>
              <p className="text-xs text-slate-400 mt-3">Uptime: 99.9% | DB Size: 45MB</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Command Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {adminActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.path}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full"
              >
                <div className={`w-10 h-10 rounded-lg ${action.bg} ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{action.desc}</p>
                <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit Log Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-500" />
              Recent System Activity (Audit Log)
            </h2>
            <Link to="/dashboard/audit-logs" className="text-sm text-blue-600 font-medium hover:underline">View Full Log</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { action: 'Deactivated User Account', user: 'admin (Super Admin)', target: 'cashier_4', time: '10 mins ago', type: 'warning' },
              { action: 'Changed Selling Price', user: 'manager_1 (Manager)', target: 'Rice (1kg)', time: '1 hour ago', type: 'info' },
              { action: 'Processed Refund', user: 'cashier_2 (Cashier)', target: 'TXN-9021 (KES 500)', time: '2 hours ago', type: 'success' },
              { action: 'Updated System Settings', user: 'admin (Super Admin)', target: 'Tax Rate (16%)', time: 'Yesterday', type: 'info' },
            ].map((log, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${log.type === 'warning' ? 'bg-red-500' : log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-500">By <span className="font-medium text-slate-700">{log.user}</span> | Target: {log.target}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD DASHBOARD (For Admin, Manager, Cashier) ---
  const stats = [
    { title: "Today's Sales", value: "KES 124,560", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Transactions", value: "48", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Stock Items", value: "1,248", icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Total Customers", value: "32", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.username}. Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400">
        <TrendingUp className="w-16 h-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium">Sales Chart will go here</p>
        <p className="text-sm">This view is restricted for higher roles.</p>
      </div>
    </div>
  );
};

export default Dashboard;