import { useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';

const Sales = () => {
  // 1. Sample Products Data
  const products = [
    { id: 1, name: 'Rice (1kg)', price: 250, stock: 45, category: 'Food', image: '🍚' },
    { id: 2, name: 'Cooking Oil (1L)', price: 350, stock: 12, category: 'Food', image: '🫗' },
    { id: 3, name: 'Sugar (1kg)', price: 180, stock: 28, category: 'Food', image: '🧂' },
    { id: 4, name: 'Milk (1L)', price: 120, stock: 18, category: 'Drinks', image: '🥛' },
    { id: 5, name: 'Bread', price: 100, stock: 4, category: 'Food', image: '🍞' },
    { id: 6, name: 'Coca Cola', price: 80, stock: 50, category: 'Drinks', image: '🥤' },
    { id: 7, name: 'Soap', price: 150, stock: 30, category: 'Household', image: '🧼' },
    { id: 8, name: 'Tissue Paper', price: 70, stock: 100, category: 'Household', image: '🧻' },
  ];

  // 2. State Management
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 4. Cart Logic
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // 5. Totals Calculation
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.10; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      
      {/* LEFT SIDE: Products Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Search & Filters Header */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">New Sale</h2>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, code or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['All', 'Food', 'Drinks', 'Household', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex flex-col items-center text-center"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {product.image}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-1">KES {product.price}</p>
                <p className={`text-xs mt-1 ${product.stock < 5 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {product.stock} in stock
                </p>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                No products found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Cart Area */}
      <div className="w-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Cart ({cart.length})</h2>
          <button 
            onClick={() => setCart([])}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCartEmptyIcon />
              <p className="mt-4 text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Select products to start a sale</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{item.image}</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500">KES {item.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 hover:bg-slate-100 rounded-l-lg text-slate-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 hover:bg-slate-100 rounded-r-lg text-slate-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Discount</span>
              <span>KES 0</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (10%)</span>
              <span>KES {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            Process Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// A simple placeholder icon for the empty cart
const ShoppingCartEmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  </svg>
);

export default Sales;