import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  PageHeader,
  StatCard,
  SecondaryButton,
  Spinner,
  ErrorBanner,
  EmptyState,
} from '../../components/ui';

import useFetch from '../../hooks/useFetch';
import { api } from '../../services/api';
import { formatMoney, formatDateTime, formatQty } from '../../utils/format';

const ManagerDashboard = () => {
  const { user, business, businessId, branchId, currency } = useAuth();

  const { data, loading, error, reload } = useFetch(
    () =>
      api.get('/api/reports/dashboard/', {
        business_id: businessId,
        branch_id: branchId,
      }),
    [businessId, branchId],
    Boolean(businessId)
  );

  const money = (value) =>
    formatMoney(value || 0, data?.currency || currency);

  const handleRefresh = () => {
    reload();
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome, ${user?.first_name || user?.username}. Supervising ${business?.name || 'your assigned branch'}.`}
      >
        <SecondaryButton onClick={handleRefresh} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </SecondaryButton>
      </PageHeader>

      <ErrorBanner message={error} onRetry={handleRefresh} />

      {loading && !data && (
        <Spinner label="Loading manager dashboard..." />
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Revenue"
              value={money(data.sales_today?.total_sales)}
              hint={`${data.sales_today?.sales_count || 0} transactions`}
              icon={DollarSign}
              color="text-green-600"
              bg="bg-green-100"
            />

            <StatCard
              title="Active Staff"
              value={data.manager_overview?.active_staff_count || 0}
              hint="Active staff assigned to this branch"
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-100"
            />

            <StatCard
              title="Draft Sales"
              value={data.manager_overview?.pending_approvals_count || 0}
              hint="Uncompleted sales in this branch"
              icon={FileText}
              color="text-orange-600"
              bg="bg-orange-100"
            />

            <StatCard
              title="Low Stock Alerts"
              value={data.inventory?.low_stock_count || 0}
              hint="Items at or below reorder level"
              icon={AlertCircle}
              color="text-red-600"
              bg="bg-red-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                <h2 className="font-bold text-slate-800">
                  <AlertCircle className="mr-2 inline h-5 w-5 text-red-500" />
                  Low Stock Alerts
                </h2>
                <Link
                  to="/dashboard/inventory"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Inventory
                </Link>
              </div>

              {data.inventory?.low_stock_items?.length ? (
                <div className="divide-y divide-slate-100">
                  {data.inventory.low_stock_items.map((item, index) => (
                    <div
                      key={`${item.product_id}-${index}`}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.sku} · {item.branch}
                        </p>
                      </div>

                      <span className="font-semibold text-red-600">
                        {formatQty(item.quantity)} / {formatQty(item.reorder_level)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No low-stock items in your assigned branch." />
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                <h2 className="font-bold text-slate-800">
                  <ShoppingBag className="mr-2 inline h-5 w-5 text-blue-500" />
                  Recent Sales
                </h2>
                <Link
                  to="/dashboard/sales"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              {data.recent_sales?.length ? (
                <div className="divide-y divide-slate-100">
                  {data.recent_sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {sale.receipt_number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {sale.cashier || 'Cashier'} · {formatDateTime(sale.created_at)}
                        </p>
                      </div>

                      <span className="font-semibold text-slate-800">
                        {money(sale.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No completed sales found in this branch." />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/dashboard/reports"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <FileText className="mb-3 h-7 w-7 text-purple-600" />
              <h3 className="font-bold text-slate-800">Sales Reports</h3>
              <p className="mt-1 text-sm text-slate-500">
                Review business performance for your assigned branch.
              </p>
            </Link>

            <Link
              to="/dashboard/inventory"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <AlertCircle className="mb-3 h-7 w-7 text-orange-600" />
              <h3 className="font-bold text-slate-800">Inventory Check</h3>
              <p className="mt-1 text-sm text-slate-500">
                Monitor stock levels in your assigned branch.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
