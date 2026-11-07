import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Tags, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  // State for Price Update Modal
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // 1. Fetch Products from Django
  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/inventory/products/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then(data => {
      setProducts(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error loading products:", err);
      setLoading(false);
    });
  }, [token]);

  // 2. Filter products
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Helper to determine status based on total_stock
  const getProductStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
      case 'Low Stock': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // 4. Price Modal Handlers
  const openPriceModal = (product) => {
    setSelectedProduct(product);
    setNewPrice(product.selling_price);
    setIsPriceModalOpen(true);
  };

  const handlePriceUpdate = (e) => {
    e.preventDefault();
    //This will be a fetch() PUT request to Django
    
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? { ...p, selling_price: newPrice } : p
    );
    setProducts(updatedProducts);
    setIsPriceModalOpen(false);
    alert(`Price for ${selectedProduct.name} updated to KES ${newPrice}!`);
  };

  if (loading) return <div className="p-10 text-center">Loading inventory...</div>;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage products, stock and prices</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between bg-slate-50">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const status = getProductStatus(product.total_stock);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl bg-slate-100 w-10 h-10 rounded-lg flex items-center justify-center">
                          📦
                        </div>
                        <span className="font-semibold text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{product.sku}</td>
                    <td className="p-4 font-medium text-slate-700">{product.total_stock}</td>
                    <td className="p-4 font-medium text-slate-700">KES {product.selling_price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {/* NEW: Set Price Button */}
                        <button 
                          onClick={() => openPriceModal(product)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Set Selling Price"
                        >
                          <Tags size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Product">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Product">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No products found in the database.
            </div>
          )}
        </div>
      </div>

      {/* --- PRICE UPDATE MODAL --- */}
      {isPriceModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Set Selling Price</h2>
                <p className="text-sm text-slate-500">{selectedProduct.name} ({selectedProduct.sku})</p>
              </div>
              <button onClick={() => setIsPriceModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePriceUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Selling Price (KES)</label>
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsPriceModalOpen(false)} 
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 font-medium transition shadow-sm"
                >
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;