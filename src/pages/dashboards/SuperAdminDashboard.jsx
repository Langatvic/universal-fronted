import { Link } from 'react-router-dom';
import { ShieldAlert, Database, Users, Settings, CreditCard, Activity } from 'lucide-react';
import AdminDashboard from './AdminDashboard'; // <-- We import and render the Admin Dashboard inside here!

const SuperAdminDashboard = () => {
  const adminActions = [
    { title: 'System Settings', desc: 'Configure business rules', icon: Settings, path: '/dashboard/settings' },
    { title: 'User Accounts', desc: 'Manage staff and roles', icon: Users, path: '/dashboard/employees' },
    { title: 'Audit Logs', desc: 'View system security logs', icon: ShieldAlert, path: '/dashboard/audit-logs' },
    { title: 'Payment Methods', desc: 'Configure checkout options', icon: CreditCard, path: '/dashboard/payment-methods' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Super Admin Command Center */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Super Admin Command Center</h1>
        <p className="text-slate-400 mb-6">System-wide controls and configurations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {adminActions.map((action, i) => (
            <Link key={i} to={action.path} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl transition border border-slate-700">
              <action.icon className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-bold text-sm">{action.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Render the normal operational dashboard underneath */}
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Business Operations Overview</h2>
        <AdminDashboard /> 
      </div>
      
    </div>
  );
};

export default SuperAdminDashboard;