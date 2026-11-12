import { useMemo, useState } from 'react';
import { Plus, PackageCheck, Trash2, Truck, Users } from 'lucide-react';
import { api, asList } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { formatDateTime, formatMoney, formatQty, toNumber } from '../utils/format';
import { Badge, EmptyState, ErrorBanner, Field, Modal, PageHeader, PrimaryButton, SecondaryButton, Spinner, StatCard, inputClass } from '../components/ui';

const emptyItem = { product_id: '', quantity: '1', unit_cost: '' };

const Purchasing = () => {
  const { businessId, branchId, branches, currency } = useAuth();
  const [tab, setTab] = useState('orders');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

  const [orderModal, setOrderModal] = useState(false);
  const [order, setOrder] = useState({ branch_id: '', supplier_id: '', reference_number: '', notes: '', items: [emptyItem] });
  const [supplierModal, setSupplierModal] = useState(false);
  const [supplier, setSupplier] = useState({ name: '', phone_number: '', email: '', address: '' });

  const { data, loading, error, reload } = useFetch(
    async () => {
      const [purchases, suppliers, products] = await Promise.all([
        api.get('/api/purchasing-management/purchases/', { business_id: businessId, branch_id: branchId }),
        api.get('/api/purchasing-management/suppliers/', { business_id: businessId }),
        api.get('/api/inventory/products/', { business_id: businessId }),
      ]);
      return { purchases: asList(purchases), suppliers: asList(suppliers), products: asList(products).filter((p) => p.is_active) };
    },
    [businessId, branchId],
    Boolean(businessId),
  );

  const lookups = useMemo(() => ({
    suppliers: Object.fromEntries((data?.suppliers || []).map((s) => [s.id, s.name])),
    branches: Object.fromEntries(branches.map((b) => [b.id, b.name])),
    products: Object.fromEntries((data?.products || []).map((p) => [p.id, p])),
  }), [data, branches]);

  const money = (v) => formatMoney(v, currency);
  const drafts = (data?.purchases || []).filter((p) => p.status === 'draft');

  // ---- New purchase order ----------------------------------------------------
  const openOrder = () => {
    setActionError('');
    setOrder({
      branch_id: branchId || branches[0]?.id || '',
      supplier_id: data?.suppliers?.[0]?.id || '',
      reference_number: '', notes: '', items: [{ ...emptyItem }],
    });
    setOrderModal(true);
  };

  const setItem = (index, patch) =>
    setOrder((o) => ({ ...o, items: o.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));

  const orderTotal = order.items.reduce((sum, it) => sum + toNumber(it.quantity) * toNumber(it.unit_cost), 0);

  const submitOrder = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      await api.post('/api/purchasing-management/purchases/create/', {
        business_id: businessId,
        branch_id: order.branch_id,
        supplier_id: order.supplier_id,
        reference_number: order.reference_number,
        notes: order.notes,
        items: order.items.map((it) => ({ product_id: it.product_id, quantity: String(it.quantity), unit_cost: String(it.unit_cost) })),
      });
      setOrderModal(false);
      setNotice('Purchase order created as a draft. Receive it when the goods arrive.');
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const receive = async (purchase) => {
    if (!window.confirm('Mark this purchase as received? Stock will be increased.')) return;
    setActionError('');
    try {
      await api.post(`/api/purchasing-management/purchases/${purchase.id}/receive/`, { business_id: businessId });
      setNotice('Purchase received and stock updated.');
      setViewing(null);
      reload();
    } catch (err) {
      setNotice('');
      setActionError(err.message);
    }
  };

  // ---- Supplier ----------------------------------------------------------------
  const submitSupplier = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      await api.post('/api/purchasing-management/suppliers/', { business_id: businessId, ...supplier });
      setSupplierModal(false);
      setSupplier({ name: '', phone_number: '', email: '', address: '' });
      setNotice('Supplier added.');
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Purchasing" subtitle="Order stock from suppliers and receive it into your branches">
        <SecondaryButton onClick={() => { setActionError(''); setSupplierModal(true); }}>
          <Users className="mr-2 h-4 w-4" /> Add Supplier
        </SecondaryButton>
        <PrimaryButton onClick={openOrder} disabled={!data?.suppliers?.length || !data?.products?.length}>
          <Plus className="mr-2 h-5 w-5" /> New Purchase Order
        </PrimaryButton>
      </PageHeader>

      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      <ErrorBanner message={!orderModal && !supplierModal ? actionError : ''} />
      <ErrorBanner message={error} onRetry={reload} />

      {data && !data.suppliers.length && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          Add a supplier first, then you can create purchase orders.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Purchase Orders" value={data?.purchases.length ?? '—'} icon={Truck} color="text-indigo-600" bg="bg-indigo-100" />
        <StatCard title="Waiting to Receive" value={data ? drafts.length : '—'} icon={PackageCheck} color="text-orange-600" bg="bg-orange-100" />
        <StatCard title="Suppliers" value={data?.suppliers.length ?? '—'} icon={Users} color="text-blue-600" bg="bg-blue-100" />
      </div>

      <div className="flex w-fit space-x-1 rounded-lg bg-slate-200 p-1">
        {[['orders', 'Purchase Orders'], ['suppliers', 'Suppliers']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-md px-4 py-2 text-sm font-medium transition ${tab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{label}</button>
        ))}
      </div>

      {loading && !data ? <Spinner label="Loading purchasing..." /> : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {tab === 'orders' ? (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="p-4 font-medium">Reference</th><th className="p-4 font-medium">Supplier</th><th className="p-4 font-medium">Branch</th>
                    <th className="p-4 font-medium">Created</th><th className="p-4 font-medium">Total</th><th className="p-4 font-medium">Status</th>
                    <th className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.purchases || []).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">{p.reference_number || p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4 text-slate-600">{lookups.suppliers[p.supplier] || '—'}</td>
                      <td className="p-4 text-slate-600">{lookups.branches[p.branch] || '—'}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(p.created_at)}</td>
                      <td className="p-4 font-semibold text-slate-800">{money(p.total_amount)}</td>
                      <td className="p-4"><Badge tone={p.status === 'received' ? 'green' : 'orange'}>{p.status}</Badge></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => setViewing(p)}>View</SecondaryButton>
                          {p.status === 'draft' && <PrimaryButton className="px-3 py-1.5 text-xs" onClick={() => receive(p)}>Receive</PrimaryButton>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.purchases.length && <EmptyState message="No purchase orders yet." />}
            </>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.suppliers || []).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="p-4 text-slate-600">{s.phone_number || '—'}</td>
                      <td className="p-4 text-slate-600">{s.email || '—'}</td>
                      <td className="p-4 text-slate-600">{s.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.suppliers.length && <EmptyState message="No suppliers yet." />}
            </>
          )}
        </div>
      )}

      {/* ---- View purchase ---- */}
      {viewing && (
        <Modal title="Purchase Order" subtitle={`${lookups.suppliers[viewing.supplier] || ''} · ${lookups.branches[viewing.branch] || ''}`} onClose={() => setViewing(null)} maxWidth="max-w-xl">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 font-medium">Product</th><th className="py-2 text-right font-medium">Qty</th><th className="py-2 text-right font-medium">Unit cost</th><th className="py-2 text-right font-medium">Total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {viewing.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 text-slate-800">{lookups.products[it.product]?.name || 'Product'}</td>
                  <td className="py-2 text-right">{formatQty(it.quantity)}</td>
                  <td className="py-2 text-right">{money(it.unit_cost)}</td>
                  <td className="py-2 text-right font-medium">{money(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div><Badge tone={viewing.status === 'received' ? 'green' : 'orange'}>{viewing.status}</Badge>{viewing.received_at && <span className="ml-3 text-xs text-slate-500">Received {formatDateTime(viewing.received_at)}</span>}</div>
            <p className="font-bold text-slate-800">Total {money(viewing.total_amount)}</p>
          </div>
          {viewing.notes && <p className="mt-3 text-sm text-slate-500">Notes: {viewing.notes}</p>}
          {viewing.status === 'draft' && <div className="mt-4 flex justify-end"><PrimaryButton onClick={() => receive(viewing)}>Receive Stock</PrimaryButton></div>}
        </Modal>
      )}

      {/* ---- New purchase order ---- */}
      {orderModal && (
        <Modal title="New Purchase Order" onClose={() => setOrderModal(false)} maxWidth="max-w-2xl">
          <form onSubmit={submitOrder} className="space-y-4">
            <ErrorBanner message={actionError} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Supplier">
                <select className={inputClass} required value={order.supplier_id} onChange={(e) => setOrder({ ...order, supplier_id: e.target.value })}>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Deliver to branch">
                <select className={inputClass} required value={order.branch_id} onChange={(e) => setOrder({ ...order, branch_id: e.target.value })}>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Reference / invoice number (optional)"><input className={inputClass} value={order.reference_number} onChange={(e) => setOrder({ ...order, reference_number: e.target.value })} /></Field>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Items</p>
              <div className="space-y-2">
                {order.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_110px_32px] items-center gap-2">
                    <select
                      className={inputClass} required value={it.product_id}
                      onChange={(e) => setItem(i, { product_id: e.target.value, unit_cost: lookups.products[e.target.value]?.cost_price ?? '' })}
                    >
                      <option value="" disabled>Select product</option>
                      {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" min="0.001" step="0.001" required placeholder="Qty" className={inputClass} value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} />
                    <input type="number" min="0" step="0.01" required placeholder="Unit cost" className={inputClass} value={it.unit_cost} onChange={(e) => setItem(i, { unit_cost: e.target.value })} />
                    <button type="button" disabled={order.items.length === 1} onClick={() => setOrder({ ...order, items: order.items.filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setOrder({ ...order, items: [...order.items, { ...emptyItem }] })} className="mt-2 text-sm font-medium text-blue-600 hover:underline">+ Add another item</button>
            </div>

            <Field label="Notes (optional)"><textarea rows={2} className={inputClass} value={order.notes} onChange={(e) => setOrder({ ...order, notes: e.target.value })} /></Field>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="font-bold text-slate-800">Total {money(orderTotal)}</p>
              <div className="flex space-x-3">
                <SecondaryButton type="button" onClick={() => setOrderModal(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Order'}</PrimaryButton>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- Add supplier ---- */}
      {supplierModal && (
        <Modal title="Add Supplier" onClose={() => setSupplierModal(false)} maxWidth="max-w-md">
          <form onSubmit={submitSupplier} className="space-y-4">
            <ErrorBanner message={actionError} />
            <Field label="Name"><input className={inputClass} required autoFocus value={supplier.name} onChange={(e) => setSupplier({ ...supplier, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone"><input className={inputClass} value={supplier.phone_number} onChange={(e) => setSupplier({ ...supplier, phone_number: e.target.value })} /></Field>
              <Field label="Email"><input type="email" className={inputClass} value={supplier.email} onChange={(e) => setSupplier({ ...supplier, email: e.target.value })} /></Field>
            </div>
            <Field label="Address"><input className={inputClass} value={supplier.address} onChange={(e) => setSupplier({ ...supplier, address: e.target.value })} /></Field>
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <SecondaryButton type="button" onClick={() => setSupplierModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Supplier'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Purchasing;
