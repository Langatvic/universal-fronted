import { Link } from 'react-router-dom';
import { Box, Package, Truck, AlertTriangle, ArrowRight, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatCard, SecondaryButton, Spinner, ErrorBanner } from '../../components/ui';
import useFetch from '../../hooks/useFetch';
import { api, asList } from '../../services/api';
import { useMemo } from 'react';

const StockManagerDashboard = () => {
  const { user, business, businessId } = useAuth();

  // 1. Fetch Products (to calculate total and low stock)
  const { 
    data: products, 
    loading: productsLoading, 
    error: productsError, 
    reload: reloadProducts 
  } = useFetch(
    () => api.get('/api/inventory/products/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId)
  );

  // 2. Fetch Purchase Orders (to calculate pending deliveries)
  const { 
    data: purchases, 
    loading: purchasesLoading, 
    error: purchasesError, 
    reload: reloadPurchases 
  } = useFetch(
    () => api.get('/api/purchasing/orders/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId)
  );

  // 3. Calculate real-time stats using useMemo
  const stats = useMemo(() => {
    const productList = products || [];
    const purchaseList = purchases || [];

    // Total active products
    const totalProducts = productList.length;

    // Low stock: Assuming a product is low stock if total_stock < 10
    // (Adjust the threshold based on your backend logic)
    const lowStock = productList.filter(p => p.total_stock > 0 && p.total_stock < 10).length;

    // Pending deliveries: Purchase Orders with status 'pending' or 'draft'
    const pendingDeliveries = purchaseList.filter(
      po => po.status === 'pending' || po.status === 'draft'
    ).length;

    return { totalProducts, lowStock, pendingDeliveries };
  }, [products, purchases]);

  // Handle combined loading/error states
  const isLoading = productsLoading || purchasesLoading;
  const error = productsError || purchasesError;

  const handleRefresh = () => {
    reloadProducts();
    reloadPurchases();
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Stock & Purchasing"
        subtitle={`Welcome, ${user?.first_name || user?.username}. Monitor warehouse operations.`}
      >
        <SecondaryButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </SecondaryButton>
      </PageHeader>

      <ErrorBanner message={error} onRetry={handleRefresh} />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner label="Loading stock data..." />
        </div>
      ) : (
        <>
          {/* Stock Specific Stats (Now Real Data) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts.toLocaleString()} 
              hint="Active SKUs" 
              icon={Package} 
              color="text-blue-600" 
              bg="bg-blue-100" 
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={stats.lowStock} 
              hint="Needs reordering" 
              icon={AlertTriangle} 
              color="text-red-600" 
              bg="bg-red-100" 
            />
            <StatCard 
              title="Pending Deliveries" 
              value={stats.pendingDeliveries} 
              hint="Incoming POs" 
              icon={Truck} 
              color="text-orange-600" 
              bg="bg-orange-100" 
            />
          </div>

          {/* Store Manager Actions */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <Link to="/dashboard/inventory" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Manage Inventory</h3>
                <p className="text-sm text-slate-500 flex-1">View product lists, adjust stock levels, and process stock takes.</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-blue-600">
                  Go to Inventory <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              <Link to="/dashboard/purchasing" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Purchase Orders</h3>
                <p className="text-sm text-slate-500 flex-1">Create POs for suppliers and receive incoming goods to update stock.</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-blue-600">
                  Manage Purchases <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Stock Reports</h3>
                <p className="text-sm text-slate-500 flex-1">Export lists of low stock items and stock movement logs.</p>
                <div className="mt-4 text-sm font-semibold text-slate-400">
                  Coming Soon
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockManagerDashboard;