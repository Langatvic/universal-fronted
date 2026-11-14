import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Receipt, DollarSign, Clock, Info, Loader2 } from 'lucide-react';
import { PageHeader, StatCard, ErrorBanner, Spinner } from '../../components/ui';
import useFetch from '../../hooks/useFetch';
import { api, asList } from '../../services/api';
import { formatMoney } from '../../utils/format';
import { useMemo } from 'react';

const CashierDashboard = () => {
  const { user, business, branchId, currency } = useAuth();

  // 1. Fetch real sales data from Django
  const { data: salesData, loading, error, reload } = useFetch(
    () => api.get('/api/sales/', { business_id: business.id }).then(asList),
    [business?.id],
    Boolean(business?.id)
  );

  // 2. Calculate real-time personal stats
  const stats = useMemo(() => {
    if (!salesData) return { salesToday: 0, transactions: 0, itemsSold: 0, shiftStart: '--:--' };

    const today = new Date().toDateString();
    let totalSales = 0;
    let totalTransactions = 0;
    let itemsSold = 0;
    let earliestTime = null;

    salesData.forEach(sale => {
      // Filter: Only show THIS cashier's sales, from TODAY, that are completed
      const isToday = new Date(sale.created_at).toDateString() === today;
      const isMine = sale.cashier_name === (user?.first_name || user?.username) || sale.cashier_id === user?.id; // Depends on your backend serializer
      const isCompleted = sale.status === 'completed';

      if (isToday && isMine && isCompleted) {
        totalSales += parseFloat(sale.total_amount || 0);
        totalTransactions += 1;
        // If your backend sends items in the sale object, add them up here:
        // itemsSold += sale.items?.length || 0; 
        
        // Track the earliest sale time to simulate "Shift Started"
        const saleTime = new Date(sale.created_at);
        if (!earliestTime || saleTime < earliestTime) {
          earliestTime = saleTime;
        }
      }
    });

    return {
      salesToday: formatMoney(totalSales, currency),
      transactions: totalTransactions,
      itemsSold: itemsSold,
      shiftStart: earliestTime ? earliestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    };
  }, [salesData, user, currency]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={`Welcome, ${user?.first_name || user?.username}`}
        subtitle={`${business?.name || 'Store'} — Here is your real-time shift summary`}
      >
        {/* <Link 
          to="/dashboard/sales"
          className="flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Open POS Terminal
        </Link> */}
      </PageHeader>

      <ErrorBanner message={error} onRetry={reload} />

      {/* Real-time Personal Shift Stats */}
      {loading ? (
        <div className="flex justify-center p-10"><Spinner label="Fetching your shift data..." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard 
            title="My Sales Today" 
            value={stats.salesToday} 
            hint="Personal shift total" 
            icon={DollarSign} 
            color="text-green-600" 
            bg="bg-green-100" 
          />
          <StatCard 
            title="My Transactions" 
            value={stats.transactions} 
            hint="Receipts generated today" 
            icon={Receipt} 
            color="text-blue-600" 
            bg="bg-blue-100" 
          />
          <StatCard 
            title="Shift Started" 
            value={stats.shiftStart} 
            hint="First sale of the day" 
            icon={Clock} 
            color="text-purple-600" 
            bg="bg-purple-100" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions for Cashier */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Cashier Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/dashboard/sales" 
              className="flex items-center p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition group"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Start New Sale</h3>
                <p className="text-xs text-slate-500 mt-1">Scan items and process payment</p>
              </div>
            </Link>

            <Link 
              to="/dashboard/sales" 
              className="flex items-center p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition group"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">My Transaction History</h3>
                <p className="text-xs text-slate-500 mt-1">View and print past receipts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Shift Tips
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center mb-3">
            <Info className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="font-bold text-blue-800">Shift Tips</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
            <li>Always verify the cash received before completing a transaction.</li>
            <li>Print or email a receipt for every customer.</li>
            <li>Keep your till organized and secure.</li>
            <li>If you need to issue a refund or apply a discount, ask your supervisor to enter their PIN.</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default CashierDashboard;