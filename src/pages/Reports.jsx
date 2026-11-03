import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, TrendingUp, DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react';

const Reports = () => {
  // 1. Mock Data for Charts
  const salesData = [
    { name: 'Week 1', sales: 450000, target: 400000 },
    { name: 'Week 2', sales: 380000, target: 400000 },
    { name: 'Week 3', sales: 520000, target: 450000 },
    { name: 'Week 4', sales: 480000, target: 450000 },
  ];

  const paymentMethods = [
    { name: 'Cash', value: 45, color: '#3b82f6' }, // Blue
    { name: 'Card', value: 35, color: '#10b981' }, // Green
    { name: 'Mobile Money', value: 20, color: '#f59e0b' }, // Orange
  ];

  const topProducts = [
    { name: 'Rice (1kg)', quantity: 160, total: 40000 },
    { name: 'Cooking Oil', quantity: 120, total: 42000 },
    { name: 'Sugar (1kg)', quantity: 90, total: 16200 },
    { name: 'Milk (1L)', quantity: 60, total: 7200 },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Business insights and performance</p>
        </div>
        <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-lg p-1">
          <span className="px-3 py-1.5 text-sm text-slate-600 font-medium">01 Oct 2025 - 31 Oct 2025</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Sales</p>
              <h3 className="text-2xl font-bold text-slate-800">KES 2,480,560</h3>
              <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% vs previous period
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Transactions</p>
              <h3 className="text-2xl font-bold text-slate-800">1,248</h3>
              <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> +8% vs previous period
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-slate-800">KES 1,988</h3>
              <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> +4% vs previous period
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <BarChartIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Sales Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">KES {product.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Payments & Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Payment Methods</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-slate-50 p-2 rounded-lg">
              <Banknote className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-slate-500 font-medium">Cash</p>
              <p className="font-bold text-slate-800">45%</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-xs text-slate-500 font-medium">Card</p>
              <p className="font-bold text-slate-800">35%</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-slate-500 font-medium">Mobile</p>
              <p className="font-bold text-slate-800">20%</p>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Profit Summary</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Gross Revenue</span>
                <span className="font-bold text-slate-800">KES 2,480,560</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Cost of Goods Sold (COGS)</span>
                <span className="font-bold text-slate-800">KES 1,450,000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Operating Expenses</span>
                <span className="font-bold text-slate-800">KES 320,000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">Net Profit</span>
                <span className="text-2xl font-bold text-green-600">KES 710,560</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">28.6% Profit Margin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple placeholder for the BarChart Icon
const BarChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default Reports;