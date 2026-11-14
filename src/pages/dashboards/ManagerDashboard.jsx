import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { 
  Users, ShoppingBag, TrendingUp, AlertCircle, ShieldCheck, 
  DollarSign, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatCard, SecondaryButton, Spinner, ErrorBanner, EmptyState } from '../../components/ui';
import useFetch from '../../hooks/useFetch';
import { api, asList } from '../../services/api';
import { formatMoney, formatDateTime, formatQty } from '../../utils/format';

const ManagerDashboard = () => {
  const { user, business, businessId, currency } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);

  // 1. Fetch Sales (To calculate revenue and find pending approvals)
  const { 
    data: salesData, 
    loading: salesLoading, 
    error: salesError, 
    reload: reloadSales 
  } = useFetch(
    () => api.get('/api/sales/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId)
  );

  // 2. Fetch Staff (To monitor active employees)
  const { 
    data: staffData, 
    loading: staffLoading, 
    error: staffError, 
    reload: reloadStaff 
  } = useFetch(
    () => api.get('/api/businesses/employees/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId)
  );

  // 3. Fetch Products (To calculate real Low Stock alerts)
  const { 
    data: productsData, 
    loading: productsLoading, 
    error: productsError, 
    reload: reloadProducts 
  } = useFetch(
    () => api.get('/api/inventory/products/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId)
  );

  // 4. Calculate real-time metrics
  const stats = useMemo(() => {
    const sales = salesData || [];
    const staff = staffData || [];
    const products = productsData || [];
    const today = new Date().toDateString();

    // Today's Sales
    const todaysSales = sales.filter(s => 
      new Date(s.created_at).toDateString() === today && s.status === 'completed'
    );
    const todayRevenue = todaysSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

    // Active Staff
    const activeStaff = staff.filter(s => s.is_active !== false).length;

    // Pending Approvals (Assuming 'draft' sales are waiting for supervisor approval)
    const pendingApprovals = sales.filter(s => s.status === 'draft').length;

    // Low Stock (Using total_stock < 10)
    const lowStockItems = products.filter(p => p.total_stock !== undefined && p.total_stock < 10).length;

    return {
      todayRevenue: formatMoney(todayRevenue, currency),
      todayTransactions: todaysSales.length,
      activeStaff,
      pendingApprovals,
      lowStockItems
    };
  }, [salesData, staffData, productsData, currency]);

  const isLoading = salesLoading || staffLoading || productsLoading;
  const error = salesError || staffError || productsError;

  const handleRefresh = () => {
    reloadSales();
    reloadStaff();
    reloadProducts();
  };

  // Handle approving/rejecting a draft sale
  const handleApproval = async (saleId, action) => {
    setActionLoading(saleId);
    try {
      if (action === 'approve') {
        // Assuming your backend has a checkout/confirm endpoint
        await api.post(`/api/sales/${saleId}/confirm/`, {}); 
      } else {
        // Assuming a cancel/void endpoint
        await api.post(`/api/sales/${saleId}/void/`, {});
      }
      reloadSales(); // Refresh the list
    } catch (err) {
      alert(`Failed to ${action} sale: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingSales = (salesData || []).filter(s => s.status === 'draft');
  const recentSales = (salesData || []).filter(s => s.status === 'completed').slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome, ${user?.first_name || user?.username}. Supervising ${business?.name || 'the store'}.`}
      >
        <SecondaryButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </SecondaryButton>
      </PageHeader>

      <ErrorBanner message={error} onRetry={handleRefresh} />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner label="Loading manager overview..." />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Today's Revenue" 
              value={stats.todayRevenue} 
              hint={`${stats.todayTransactions} transactions`} 
              icon={DollarSign} 
              color="text-green-600" 
              bg="bg-green-100" 
            />
            <StatCard 
              title="Active Staff" 
              value={stats.activeStaff} 
              hint="Currently on shift" 
              icon={Users} 
              color="text-blue-600" 
              bg="bg-blue-100" 
            />
            <StatCard 
              title="Pending Approvals" 
              value={stats.pendingApprovals} 
              hint="Draft sales awaiting approval" 
              icon={ShieldCheck} 
              color="text-orange-600" 
              bg="bg-orange-100" 
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={stats.lowStockItems} 
              hint="Needs attention" 
              icon={AlertCircle} 
              color="text-red-600" 
              bg="bg-red-100" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Pending Approvals */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-orange-500" /> Needs Approval
                </h2>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingSales.length}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] flex-1">
                {pendingSales.length === 0 ? (
                  <EmptyState message="No approvals pending." />
                ) : (
                  pendingSales.map((sale) => (
                    <div key={sale.id} className="p-4 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-slate-800">{sale.receipt_number || 'Draft Sale'}</span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          {formatMoney(sale.total_amount, currency)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">By <strong>{sale.cashier_name || 'Cashier'}</strong> at {formatDateTime(sale.created_at)}</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleApproval(sale.id, 'approve')}
                          disabled={actionLoading === sale.id}
                          className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 rounded transition disabled:opacity-50"
                        >
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(sale.id, 'reject')}
                          disabled={actionLoading === sale.id}
                          className="flex-1 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium py-1.5 rounded transition disabled:opacity-50"
                        >
                          <XCircle size={14} className="mr-1" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side: Recent Sales Monitoring */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" /> Live Sales Monitor
                </h2>
                <Link to="/dashboard/sales" className="text-sm text-blue-600 hover:underline">View All</Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="p-4 font-medium">Cashier</th>
                      <th className="p-4 font-medium">Time</th>
                      <th className="p-4 font-medium">Receipt</th>
                      <th className="p-4 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{sale.cashier_name || 'Cashier'}</td>
                        <td className="p-4 text-slate-500">
                          {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-slate-500">{sale.receipt_number}</td>
                        <td className="p-4 text-right font-bold text-slate-800">
                          {formatMoney(sale.total_amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recentSales.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No sales recorded today.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/dashboard/employees" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Staff Monitoring</h3>
                  <p className="text-xs text-slate-500 mt-1">View cashier activity</p>
                </div>
              </Link>

              <Link to="/dashboard/reports" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Sales Reports</h3>
                  <p className="text-xs text-slate-500 mt-1">View business performance</p>
                </div>
              </Link>

              <Link to="/dashboard/inventory" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Inventory Check</h3>
                  <p className="text-xs text-slate-500 mt-1">Monitor stock levels</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;