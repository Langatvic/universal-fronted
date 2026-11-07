import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Download, Eye, Receipt, TrendingUp, DollarSign, CreditCard } from 'lucide-react';

const Sales = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  // --- SUPER ADMIN VIEW (Transaction History) ---
  if (isSuperAdmin) {
    const transactions = [
      { id: 'TXN-9081', date: '07 Nov 2026, 10:45 AM', cashier: 'Peter Kibe', branch: 'Main Branch', items: 4, method: 'Cash', total: 4500, status: 'Completed' },
      { id: 'TXN-9080', date: '07 Nov 2026, 10:30 AM', cashier: 'Mary Wanjiku', branch: 'Branch 1', items: 12, method: 'Card', total: 12500, status: 'Completed' },
      { id: 'TXN-9079', date: '07 Nov 2026, 09:15 AM', cashier: 'Peter Kibe', branch: 'Main Branch', items: 2, method: 'Mobile', total: 850, status: 'Refunded' },
      { id: 'TXN-9078', date: '07 Nov 2026, 08:50 AM', cashier: 'Lucy Achieng', branch: 'Branch 2', items: 5, method: 'Cash', total: 3200, status: 'Completed' },
      { id: 'TXN-9077', date: '06 Nov 2026, 05:20 PM', cashier: 'Peter Kibe', branch: 'Main Branch', items: 8, method: 'Card', total: 8900, status: 'Completed' },
    ];

    return (
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All Business Transactions</h1>
            <p className="text-slate-500 text-sm mt-1">View every transaction across all branches</p>
          </div>
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-slate-50 transition shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">KES 1,280,450</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Transactions</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">4,208</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">KES 304</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between bg-slate-50">
            <div className="relative w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Search by TXN ID, Cashier..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition text-sm">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Cashier</th>
                <th className="p-4 font-medium">Branch</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-blue-600">{txn.id}</td>
                  <td className="p-4 text-slate-500 text-sm">{txn.date}</td>
                  <td className="p-4 text-slate-800 font-medium">{txn.cashier}</td>
                  <td className="p-4 text-slate-600">{txn.branch}</td>
                  <td className="p-4 text-slate-600 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                    {txn.method}
                  </td>
                  <td className="p-4 font-bold text-slate-800">KES {txn.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      txn.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- CASHIER / ADMIN VIEW (The Checkout Screen we built earlier) ---
  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      <p>Checkout Screen for Cashiers will go here. (Switch to Super Admin to see transactions).</p>
    </div>
  );
};

export default Sales;