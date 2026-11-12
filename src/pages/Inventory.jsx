import { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Tags, SlidersHorizontal, FolderPlus } from 'lucide-react';
import { api, asList } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { formatMoney, formatQty, toNumber } from '../utils/format';
import { Badge, EmptyState, ErrorBanner, Field, Modal, PageHeader, PrimaryButton, SecondaryButton, Spinner, inputClass } from '../components/ui';

const emptyForm = { name: '', sku: '', barcode: '', category: '', cost_price: '', selling_price: '', description: '' };

const Inventory = () => {
  const { businessId, branchId, branches, currency } = useAuth();
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const [productModal, setProductModal] = useState(null); // { product | null }
  const [form, setForm] = useState(emptyForm);
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [stockModal, setStockModal] = useState(null); // { product, stock }
  const [stockForm, setStockForm] = useState({ direction: 'add', quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useFetch(
    async () => {
      const [products, categories, stock] = await Promise.all([
        api.get('/api/inventory/products/', { business_id: businessId }),
        api.get('/api/inventory/categories/', { business_id: businessId }),
        api.get('/api/inventory/stock/'),
      ]);
      return { products: asList(products), categories: asList(categories), stock: asList(stock) };
    },
    [businessId],
    Boolean(businessId),
  );

  const branchIds = useMemo(() => new Set(branches.map((b) => b.id)), [branches]);

  // Stock rows grouped per product, limited to the selected branch (or all of the business's branches)
  const stockByProduct = useMemo(() => {
    const map = {};
    (data?.stock || []).forEach((s) => {
      if (!branchIds.has(s.branch)) return;
      if (branchId && s.branch !== branchId) return;
      (map[s.product] ||= []).push(s);
    });
    return map;
  }, [data, branchId, branchIds]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.products || [])
      .filter((p) => p.is_active)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q))
      .map((p) => {
        const stocks = stockByProduct[p.id] || [];
        const quantity = stocks.reduce((sum, s) => sum + toNumber(s.quantity), 0);
        const reorder = stocks.reduce((sum, s) => sum + toNumber(s.reorder_level), 0);
        const status = !stocks.length ? 'No stock record' : quantity <= 0 ? 'Out of Stock' : quantity <= reorder ? 'Low Stock' : 'In Stock';
        return { ...p, stocks, quantity, status };
      });
  }, [data, search, stockByProduct]);

  const statusTone = { 'In Stock': 'green', 'Low Stock': 'orange', 'Out of Stock': 'red', 'No stock record': 'slate' };

  // ---- Product add / edit -------------------------------------------------
  const openProduct = (product = null) => {
    setActionError('');
    setForm(
      product
        ? {
            name: product.name, sku: product.sku, barcode: product.barcode || '', category: product.category,
            cost_price: product.cost_price, selling_price: product.selling_price, description: product.description || '',
          }
        : { ...emptyForm, category: data?.categories?.[0]?.id || '' },
    );
    setProductModal({ product });
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const payload = { ...form, business: businessId };
      if (productModal.product) await api.patch(`/api/inventory/products/${productModal.product.id}/`, payload);
      else await api.post('/api/inventory/products/', payload);
      setProductModal(null);
      setNotice(productModal.product ? 'Product updated.' : 'Product created.');
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archiveProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the catalogue? Past sales keep their history.`)) return;
    try {
      await api.del(`/api/inventory/products/${product.id}/`);
      setNotice(`"${product.name}" removed.`);
      reload();
    } catch (err) {
      setNotice('');
      setActionError(err.message);
    }
  };

  // ---- Category ------------------------------------------------------------
  const submitCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const created = await api.post('/api/inventory/categories/', { business: businessId, name: categoryName });
      setCategoryModal(false);
      setCategoryName('');
      setForm((f) => ({ ...f, category: created.id }));
      setNotice('Category created.');
      await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Stock adjustment ----------------------------------------------------
  const openStock = (product) => {
    setActionError('');
    const stock = product.stocks.find((s) => s.branch === branchId) || product.stocks[0] || null;
    setStockForm({ direction: 'add', quantity: '', notes: '', stockId: stock?.id || '' });
    setStockModal({ product });
  };

  const submitStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const qty = Math.abs(toNumber(stockForm.quantity));
      await api.post(`/api/inventory/stock/${stockForm.stockId}/movements/`, {
        movement_type: 'adjustment',
        quantity_change: stockForm.direction === 'add' ? qty : -qty,
        notes: stockForm.notes,
      });
      setStockModal(null);
      setNotice('Stock updated.');
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const money = (v) => formatMoney(v, currency);

  return (
    <div className="relative space-y-6">
      <PageHeader title="Inventory Management" subtitle="Manage products, stock and prices">
        <SecondaryButton onClick={() => { setActionError(''); setCategoryName(''); setCategoryModal(true); }}>
          <FolderPlus className="mr-2 h-5 w-5" /> New Category
        </SecondaryButton>
        <PrimaryButton onClick={() => openProduct()}>
          <Plus className="mr-2 h-5 w-5" /> Add Product
        </PrimaryButton>
      </PageHeader>

      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      <ErrorBanner message={!productModal && !stockModal && !categoryModal ? actionError : ''} />
      <ErrorBanner message={error} onRetry={reload} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex justify-between border-b border-slate-200 bg-slate-50 p-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text" placeholder="Search by name, SKU or barcode..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="self-center text-sm text-slate-500">{rows.length} product{rows.length === 1 ? '' : 's'}</p>
        </div>

        {loading && !data ? <Spinner label="Loading inventory..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">SKU</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Cost</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="p-4 text-sm text-slate-500">{p.sku}</td>
                    <td className="p-4 text-sm text-slate-500">{p.category_name}</td>
                    <td className="p-4 font-medium text-slate-700">{formatQty(p.quantity)}</td>
                    <td className="p-4 text-sm text-slate-500">{money(p.cost_price)}</td>
                    <td className="p-4 font-medium text-slate-700">{money(p.selling_price)}</td>
                    <td className="p-4"><Badge tone={statusTone[p.status]}>{p.status}</Badge></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => openStock(p)} disabled={!p.stocks.length} className="rounded-lg p-2 text-slate-400 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-30" title="Adjust stock">
                          <SlidersHorizontal size={18} />
                        </button>
                        <button onClick={() => openProduct(p)} className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit product">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => archiveProduct(p)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Remove product">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <EmptyState message="No products yet. Add your first product to get started." />}
          </div>
        )}
      </div>

      {/* ---- Product modal ---- */}
      {productModal && (
        <Modal title={productModal.product ? 'Edit Product' : 'Add Product'} onClose={() => setProductModal(null)}>
          <form onSubmit={submitProduct} className="space-y-4">
            <ErrorBanner message={actionError} />
            <Field label="Name"><input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU"><input className={inputClass} required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
              <Field label="Barcode (optional)"><input className={inputClass} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Field>
            </div>
            <Field label="Category">
              <div className="flex space-x-2">
                <select className={inputClass} required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Select a category</option>
                  {(data?.categories || []).filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <SecondaryButton type="button" className="px-3" onClick={() => { setCategoryName(''); setCategoryModal(true); }} title="New category"><Tags size={16} /></SecondaryButton>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Cost price (${currency})`}><input type="number" min="0" step="0.01" className={inputClass} required value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} /></Field>
              <Field label={`Selling price (${currency})`}><input type="number" min="0" step="0.01" className={inputClass} required value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></Field>
            </div>
            <Field label="Description (optional)"><textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <SecondaryButton type="button" onClick={() => setProductModal(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- Category modal ---- */}
      {categoryModal && (
        <Modal title="New Category" onClose={() => setCategoryModal(false)} maxWidth="max-w-sm">
          <form onSubmit={submitCategory} className="space-y-4">
            <ErrorBanner message={actionError} />
            <Field label="Category name"><input className={inputClass} required autoFocus value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /></Field>
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <SecondaryButton type="button" onClick={() => setCategoryModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- Stock adjustment modal ---- */}
      {stockModal && (
        <Modal title="Adjust Stock" subtitle={`${stockModal.product.name} (${stockModal.product.sku})`} onClose={() => setStockModal(null)} maxWidth="max-w-sm">
          <form onSubmit={submitStock} className="space-y-4">
            <ErrorBanner message={actionError} />
            <Field label="Branch">
              <select className={inputClass} value={stockForm.stockId} onChange={(e) => setStockForm({ ...stockForm, stockId: e.target.value })}>
                {stockModal.product.stocks.map((s) => <option key={s.id} value={s.id}>{s.branch_name} (on hand: {formatQty(s.quantity)})</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Action">
                <select className={inputClass} value={stockForm.direction} onChange={(e) => setStockForm({ ...stockForm, direction: e.target.value })}>
                  <option value="add">Add stock</option>
                  <option value="remove">Remove stock</option>
                </select>
              </Field>
              <Field label="Quantity"><input type="number" min="0.001" step="0.001" required className={inputClass} value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} /></Field>
            </div>
            <Field label="Reason (optional)"><input className={inputClass} value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} placeholder="e.g. stock count correction" /></Field>
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <SecondaryButton type="button" onClick={() => setStockModal(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update Stock'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;
