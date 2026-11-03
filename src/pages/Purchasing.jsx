import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';

const Purchasing = () => {
  // 1. State for active tab (Purchase Orders, Suppliers, Goods Received)
  const [activeTab, setActiveTab] = useState('Purchase Orders');

  // 2. Mock Data for Purchase Orders
  const purchaseOrders = [
    { id: 'PO-0012', supplier: 'Fresh Foods Ltd', date: '28 Oct 2025', total: 85000, status: 'Received' },
    { id: 'PO-0011', supplier: 'Mega Suppliers', date: '25 Oct 2025', total: 120000, status: 'Pending' },
    { id: 'PO-0010', supplier: 'Agro Ventures', date: '20 Oct 2025', total: 75000, status: 'Received' },
    { id: 'PO-0009', supplier: 'Clean Supplies', date: '15 Oct 2025', total: 42000, status: 'Partially Received' },
    { id: 'PO-0008', supplier: 'Farm Fresh', date: '10 Oct 2025', total: 60000, status: 'Received' },
  ];

  // 3. Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Partially Received':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchasing & Suppliers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage purchase orders and supplier relationships</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Create PO
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 space-x-8 bg-slate-50">
          {['Purchase Orders', 'Suppliers', 'Goods Received'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search PO number or supplier..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition">
            <Filter className="w-4 h-4 mr-2" />
            All Statuses
          </button>
        </div>

        {/* Data Table (Only rendering Purchase Orders for now based on the image) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">PO No.</th>
                <th className="p-4 font-medium">Supplier</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{po.id}</td>
                  <td className="p-4 text-slate-700">{po.supplier}</td>
                  <td className="p-4 text-slate-500 text-sm">{po.date}</td>
                  <td className="p-4 font-medium text-slate-800">KES {po.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Purchasing;