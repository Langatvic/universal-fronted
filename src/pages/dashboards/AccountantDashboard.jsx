import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  RefreshCw,
  FileText,
  CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { api } from '../../services/api';
import { formatMoney, formatDateTime, toNumber } from '../../utils/format';
import {
  PageHeader,
  StatCard,
  SecondaryButton,
  Spinner,
  ErrorBanner,
  EmptyState,
} from '../../components/ui';

const isoDate = (date) => date.toISOString().slice(0, 10);

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
};

const AccountantDashboard = () => {
  const { user, business, businessId, branchId, currency } = useAuth();

  const [startDate, setStartDate] = useState(() => daysAgo(30));
  const [endDate, setEndDate] = useState(() => isoDate(new Date()));

  const { data, loading, error, reload } = useFetch(
    () =>
      api.get('/api/reports/sales/', {
        business_id: businessId,
        branch_id: branchId,
        start_date: startDate,
        end_date: endDate,
      }),
    [businessId, branchId, startDate, endDate],
    Boolean(businessId)
  );

  const money = (value) => formatMoney(value, currency);

  const dailyRevenue = useMemo(() => {
    if (!data?.sales) return [];

    const grouped = {};

    data.sales.forEach((sale) => {
      const day = (sale.created_at || '').slice(0, 10);
      if (!day) return;

      grouped[day] = (grouped[day] || 0) + toNumber(sale.total);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, revenue]) => ({ day, revenue }));
  }, [data]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Accountant Dashboard"
        subtitle={`Welcome, ${user?.first_name || user?.username}. Financial overview for ${business?.name || 'your business'}.`}
      >
        <SecondaryButton onClick={reload} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </SecondaryButton>
      </PageHeader>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            From
          </label>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            To
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={isoDate(new Date())}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center text-sm text-slate-500">
          <CalendarDays className="mr-2 h-4 w-4" />
          Financial reporting period
        </div>
      </div>

      {loading && !data ? (
        <Spinner label="Loading financial information..." />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={money(data.total_revenue)}
              hint="Completed sales in selected period"
              icon={DollarSign}
              color="text-green-600"
              bg="bg-green-100"
            />

            <StatCard
              title="Transactions"
              value={Number(data.transaction_count || 0).toLocaleString()}
              hint="Completed sales"
              icon={Receipt}
              color="text-blue-600"
              bg="bg-blue-100"
            />

            <StatCard
              title="Average Sale"
              value={money(data.average_sale)}
              hint="Average transaction value"
              icon={TrendingUp}
              color="text-purple-600"
              bg="bg-purple-100"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Daily Revenue
                </h2>
                <p className="text-sm text-slate-500">
                  Revenue from the returned sales records
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>

            {dailyRevenue.length === 0 ? (
              <EmptyState message="No completed sales found for this period." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => money(value)} />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#16a34a"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold text-slate-800">
                  Recent Transactions
                </h2>
                <p className="text-sm text-slate-500">
                  Sales within the selected reporting period
                </p>
              </div>

              <Link
                to="/dashboard/reports"
                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                <FileText className="mr-2 h-4 w-4" />
                Full Reports
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Receipt</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Branch</th>
                    <th className="p-4">Cashier</th>
                    <th className="p-4 text-right">Subtotal</th>
                    <th className="p-4 text-right">Tax</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {(data.sales || []).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">
                        {sale.receipt_number}
                      </td>
                      <td className="whitespace-nowrap p-4 text-slate-500">
                        {formatDateTime(sale.created_at)}
                      </td>
                      <td className="p-4 text-slate-600">{sale.branch}</td>
                      <td className="p-4 text-slate-600">{sale.cashier || '—'}</td>
                      <td className="p-4 text-right">
                        {money(sale.subtotal)}
                      </td>
                      <td className="p-4 text-right">
                        {money(sale.tax)}
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {money(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!data.sales || data.sales.length === 0) && (
              <EmptyState message="No transactions found for this period." />
            )}
          </div>

          <p className="text-xs text-slate-500">
            Transaction details are limited to the records returned by the
            reporting API. Summary figures are calculated by the backend.
          </p>
        </>
      ) : null}
    </div>
  );
};

export default AccountantDashboard;
