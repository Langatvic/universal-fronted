import { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle, XCircle, FileText } from 'lucide-react';

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data for Audit Logs
  const logs = [
    { id: 1, action: 'Deactivated User', user: 'James (Super Admin)', target: 'cashier_4', date: '07 Nov 2026, 10:45 AM', type: 'warning', ip: '192.168.1.45' },
    { id: 2, action: 'Updated Selling Price', user: 'Mary (Admin)', target: 'Rice (1kg)', date: '07 Nov 2026, 10:30 AM', type: 'info', ip: '192.168.1.22' },
    { id: 3, action: 'Processed Refund', user: 'Peter (Cashier)', target: 'TXN-9021 (KES 500)', date: '07 Nov 2026, 09:15 AM', type: 'success', ip: '192.168.1.88' },
    { id: 4, action: 'Updated System Settings', user: 'James (Super Admin)', target: 'Tax Rate (16%)', date: '06 Nov 2026, 04:20 PM', type: 'info', ip: '192.168.1.45' },
    { id: 5, action: 'Failed Login Attempt', user: 'Unknown', target: 'admin_panel', date: '06 Nov 2026, 02:10 PM', type: 'danger', ip: '45.33.12.99' },
  ];

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'danger': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all employee activities and system changes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between bg-slate-50">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by action or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition text-sm">
            <Filter className="w-4 h-4 mr-2" /> Filter by Date
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Activity</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Target</th>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 font-medium text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center space-x-3 font-semibold text-slate-800">
                    {getIcon(log.type)}
                    <span>{log.action}</span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{log.user}</td>
                  <td className="p-4 text-slate-500 text-sm">{log.target}</td>
                  <td className="p-4 text-slate-500 text-sm font-mono">{log.ip}</td>
                  <td className="p-4 text-slate-500 text-sm text-right">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;