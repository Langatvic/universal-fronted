import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Wallet, Truck, TrendingUp, RefreshCw, Users, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { formatDateTime, formatMoney, formatQty, toNumber } from '../../utils/format';
import { EmptyState, ErrorBanner, PageHeader, SecondaryButton, Spinner, StatCard } from '../../components/ui';

const AdminDashboard = () => {
  const { user, businessId, branchId, business, currency } = useAuth();

  const { data, loading, error, reload } = useFetch(
    () => api.get('/api/reports/dashboard/', { business_id: businessId, branch_id: branchId }),
    [businessId, branchId],
    Boolean(businessId),
  );

  const money = (v) => formatMoney(v, data?.currency || currency);

  // Quick Actions allowed for Admin (Inventory & Purchasing removed)
  const adminActions = [
    { title: 'View Sales', desc: 'Monitor daily transactions', icon: ShoppingBag, path: '/dashboard/sales', color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Customers', desc: 'Manage customer details', icon: Users, path: '/dashboard/customers', color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Reports', desc: 'Generate business reports', icon: FileText, path: '/dashboard/reports', color: 'text-teal-600', bg: 'bg-teal-100' },
    { title: 'Manage Cashiers', desc: 'Manage cashier accounts (If authorized)', icon: Users, path: '/dashboard/employees', color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.first_name || user?.username}. ${business?.name || ''} — ${data?.branch_name || 'All branches'}`}
      >
        <SecondaryButton onClick={reload} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </SecondaryButton>
      </PageHeader>

      <ErrorBanner message={error} onRetry={reload} />
      {loading && !data && <Spinner label="Loading dashboard..." />}

      {data && (
        <>
          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {adminActions.map((action, index) => (
                <Link 
                  key={index} 
                  to={action.path}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Today's Sales" value={money(data.sales_today.total_sales)} hint={`${data.sales_today.sales_count} transactions`} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Total Sales" value={money(data.sales.total_sales)} hint={`${data.sales.sales_count} transactions · avg ${money(data.sales.average_sale)}`} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Money Received" value={money(data.money_received)} hint={`${data.completed_payment_count} payments`} icon={Wallet} color="text-purple-600" bg="bg-purple-100" />
            
            {/* Admin can see low stock alerts to know when to notify the store manager, but cannot manage inventory directly */}
            <StatCard title="Low Stock Alerts" value={data.inventory.low_stock_count} hint="Items at reorder level" icon={AlertTriangle} color="text-red-600" bg="bg-red-100" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top selling products */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center font-bold text-slate-800">
                <TrendingUp className="mr-2 h-5 w-5 text-slate-500" /> Top Selling Products
              </h2>
              {data.top_selling_products.length === 0 ? (
                <EmptyState message="No sales recorded yet." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_selling_products.map((p) => ({ name: p.product_name, revenue: toNumber(p.revenue) }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => money(v)} />
                      <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Low stock list (Admin sees this to monitor, but clicking takes them to reports, not inventory) */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                <h2 className="flex items-center font-bold text-slate-800">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Low Stock Alerts
                </h2>
              </div>
              {data.inventory.low_stock_items.length === 0 ? (
                <EmptyState message="All products are well stocked." />
              ) : (
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {data.inventory.low_stock_items.map((item, i) => (
                    <div key={`${item.product_id}-${item.branch}-${i}`} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                        <p className="text-xs text-slate-500">{item.sku} · {item.branch}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {formatQty(item.quantity)} <span className="font-normal text-slate-400">/ {formatQty(item.reorder_level)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent sales */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h2 className="font-bold text-slate-800">Recent Sales</h2>
              <Link to="/dashboard/sales" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
            </div>
            {data.recent_sales.length === 0 ? (
              <EmptyState message="No sales yet." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="p-4 font-medium">Receipt</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Branch</th>
                    <th className="p-4 font-medium">Cashier</th>
                    <th className="p-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent_sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">{s.receipt_number}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(s.created_at)}</td>
                      <td className="p-4 text-slate-500">{s.branch}</td>
                      <td className="p-4 text-slate-500">{s.cashier}</td>
                      <td className="p-4 text-right font-semibold text-slate-800">{money(s.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;