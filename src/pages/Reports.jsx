import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, DollarSign, Receipt, TrendingUp, Package, AlertTriangle, Truck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { formatDateTime, formatMoney, formatQty, toNumber } from '../utils/format';
import { Badge, EmptyState, ErrorBanner, Field, PageHeader, SecondaryButton, Spinner, StatCard, inputClass } from '../components/ui';

const isoDate = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
};

const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const TABS = [
  { id: 'sales', label: 'Sales' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'purchasing', label: 'Purchasing' },
];

const Reports = () => {
  const { businessId, branchId, currency } = useAuth();
  const [tab, setTab] = useState('sales');
  const [startDate, setStartDate] = useState(() => daysAgo(30));
  const [endDate, setEndDate] = useState(() => isoDate(new Date()));

  const params = { business_id: businessId, branch_id: branchId };
  const dateParams = { ...params, start_date: startDate, end_date: endDate };

  const { data, loading, error, reload } = useFetch(
    () => api.get(`/api/reports/${tab}/`, tab === 'sales' ? dateParams : params),
    [tab, businessId, branchId, startDate, endDate],
    Boolean(businessId),
  );

  const money = (v) => formatMoney(v, currency);

  // Group sales by day for the chart
  const dailySales = useMemo(() => {
    if (tab !== 'sales' || !data?.sales) return [];
    const byDay = {};
    data.sales.forEach((s) => {
      const day = (s.created_at || '').slice(0, 10);
      byDay[day] = (byDay[day] || 0) + toNumber(s.total);
    });
    return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, revenue]) => ({ day, revenue }));
  }, [tab, data]);

  const exportCsv = () => {
    if (!data) return;
    if (tab === 'sales') downloadCsv(`sales-${startDate}-to-${endDate}.csv`, data.sales);
    if (tab === 'inventory') downloadCsv('inventory-report.csv', data.stock);
    if (tab === 'purchasing') downloadCsv('purchasing-report.csv', data.purchases);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Reports" subtitle="Live reports from your business data">
        <SecondaryButton onClick={exportCsv} disabled={!data}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </SecondaryButton>
      </PageHeader>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex space-x-1 rounded-lg bg-slate-200 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'sales' && (
          <div className="flex items-end space-x-3">
            <Field label="From"><input type="date" className={inputClass} value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
            <Field label="To"><input type="date" className={inputClass} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
          </div>
        )}
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      {loading && !data && <Spinner label="Loading report..." />}

      {/* ---------------- SALES ---------------- */}
      {data && tab === 'sales' && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Total Revenue" value={money(data.total_revenue)} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Transactions" value={data.transaction_count} icon={Receipt} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Average Sale" value={money(data.average_sale)} icon={TrendingUp} color="text-purple-600" bg="bg-purple-100" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-800">Daily Revenue</h2>
            {dailySales.length === 0 ? (
              <EmptyState message="No sales in this period." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-4 font-medium">Receipt</th><th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Branch</th><th className="p-4 font-medium">Cashier</th>
                  <th className="p-4 text-right font-medium">Discount</th><th className="p-4 text-right font-medium">Tax</th>
                  <th className="p-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{s.receipt_number}</td>
                    <td className="p-4 text-slate-500">{formatDateTime(s.created_at)}</td>
                    <td className="p-4 text-slate-500">{s.branch}</td>
                    <td className="p-4 text-slate-500">{s.cashier}</td>
                    <td className="p-4 text-right text-slate-500">{money(s.discount)}</td>
                    <td className="p-4 text-right text-slate-500">{money(s.tax)}</td>
                    <td className="p-4 text-right font-semibold text-slate-800">{money(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.sales.length === 0 && <EmptyState message="No sales in this period." />}
          </div>
        </>
      )}

      {/* ---------------- INVENTORY ---------------- */}
      {data && tab === 'inventory' && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Products" value={data.total_products} icon={Package} color="text-orange-600" bg="bg-orange-100" />
            <StatCard title="Low Stock" value={data.low_stock_count} icon={AlertTriangle} color="text-red-600" bg="bg-red-100" />
            <StatCard title="Stock Value (at cost)" value={money(data.stock.reduce((sum, s) => sum + toNumber(s.stock_cost_value), 0))} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-4 font-medium">Product</th><th className="p-4 font-medium">SKU</th><th className="p-4 font-medium">Branch</th>
                  <th className="p-4 text-right font-medium">Qty</th><th className="p-4 text-right font-medium">Reorder</th>
                  <th className="p-4 text-right font-medium">Unit cost</th><th className="p-4 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.stock.map((s, i) => (
                  <tr key={`${s.product_id}-${s.branch}-${i}`} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{s.product_name}</td>
                    <td className="p-4 text-slate-500">{s.sku}</td>
                    <td className="p-4 text-slate-500">{s.branch}</td>
                    <td className="p-4 text-right text-slate-700">{formatQty(s.quantity)}</td>
                    <td className="p-4 text-right text-slate-500">{formatQty(s.reorder_level)}</td>
                    <td className="p-4 text-right text-slate-500">{money(s.unit_cost)}</td>
                    <td className="p-4 text-right font-semibold text-slate-800">{money(s.stock_cost_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.stock.length === 0 && <EmptyState message="No stock records yet." />}
          </div>
        </>
      )}

      {/* ---------------- PURCHASING ---------------- */}
      {data && tab === 'purchasing' && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Total Purchases" value={data.total_purchases} icon={Truck} color="text-indigo-600" bg="bg-indigo-100" />
            <StatCard title="Received" value={data.received_purchases} icon={CheckCircle2} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Pending" value={data.pending_purchases} icon={AlertTriangle} color="text-orange-600" bg="bg-orange-100" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  {data.purchases[0] && Object.keys(data.purchases[0]).map((k) => (
                    <th key={k} className="p-4 font-medium capitalize">{k.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.purchases.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-slate-50">
                    {Object.entries(p).map(([k, v]) => (
                      <td key={k} className="p-4 text-slate-600">
                        {k === 'status' ? <Badge tone={v === 'received' ? 'green' : 'orange'}>{v}</Badge>
                          : /amount|total/.test(k) ? money(v)
                          : /_at$|date/.test(k) ? formatDateTime(v)
                          : String(v ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.purchases.length === 0 && <EmptyState message="No purchases yet." />}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
