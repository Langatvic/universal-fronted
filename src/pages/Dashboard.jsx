import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Wallet, Truck, TrendingUp, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { formatDateTime, formatMoney, formatQty, toNumber } from '../utils/format';
import { canAccess } from '../utils/permissions';
import { EmptyState, ErrorBanner, PageHeader, SecondaryButton, Spinner, StatCard } from '../components/ui';

const Dashboard = () => {
  const { user, businessId, branchId, business, currency, role } = useAuth();

  const { data, loading, error, reload } = useFetch(
    () => api.get('/api/reports/dashboard/', { business_id: businessId, branch_id: branchId }),
    [businessId, branchId],
    Boolean(businessId),
  );

  const money = (v) => formatMoney(v, data?.currency || currency);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Dashboard Overview"
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Today's Sales" value={money(data.sales_today.total_sales)} hint={`${data.sales_today.sales_count} transactions`} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Total Sales" value={money(data.sales.total_sales)} hint={`${data.sales.sales_count} transactions · avg ${money(data.sales.average_sale)}`} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Money Received" value={money(data.money_received)} hint={`${data.completed_payment_count} payments`} icon={Wallet} color="text-purple-600" bg="bg-purple-100" />
            <StatCard title="Products" value={data.inventory.total_products} hint="Active catalogue items" icon={Package} color="text-orange-600" bg="bg-orange-100" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <StatCard title="Low Stock Items" value={data.inventory.low_stock_count} hint="At or below reorder level" icon={AlertTriangle} color="text-red-600" bg="bg-red-100" />
            <StatCard title="Pending Purchases" value={data.purchasing.pending_purchases} hint="Drafts waiting to be received" icon={Truck} color="text-indigo-600" bg="bg-indigo-100" />
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

            {/* Low stock */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                <h2 className="flex items-center font-bold text-slate-800">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Low Stock
                </h2>
                {canAccess(role, 'inventory') && (
                  <Link to="/dashboard/inventory" className="text-sm font-medium text-blue-600 hover:underline">Manage stock</Link>
                )}
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
              {canAccess(role, 'sales') && (
                <Link to="/dashboard/sales" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
              )}
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

export default Dashboard;
