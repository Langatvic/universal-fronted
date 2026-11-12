import { useMemo, useRef, useState } from 'react';
import { Plus, Minus, Trash2, Search, Receipt, DollarSign, TrendingUp, ShoppingCart, Printer, CheckCircle2 } from 'lucide-react';
import { api, asList } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { formatDateTime, formatMoney, formatQty, newUuid, toNumber } from '../utils/format';
import { Badge, EmptyState, ErrorBanner, Field, Modal, PageHeader, PrimaryButton, SecondaryButton, Spinner, StatCard, inputClass } from '../components/ui';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const Sales = () => {
  const { businessId, branchId, branches, currency, taxRate } = useAuth();
  const money = (v) => formatMoney(v, currency);

  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState('');

  // ---- New sale (POS) state ----
  const [posOpen, setPosOpen] = useState(false);
  const [posBranch, setPosBranch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState({}); // productId -> quantity
  const [discount, setDiscount] = useState('');
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [tendered, setTendered] = useState('');
  const [posError, setPosError] = useState('');
  const [busy, setBusy] = useState(false);
  // Keys / results are kept until the server confirms, so a retry can never create a duplicate sale or payment.
  const checkoutKey = useRef(null);
  const paymentKey = useRef(null);
  const createdSale = useRef(null);
  const [locked, setLocked] = useState(false); // true once the sale exists on the server

  const sales = useFetch(
    () => api.get('/api/sales/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId),
  );

  const catalogue = useFetch(
    async () => {
      const [products, stock] = await Promise.all([
        api.get('/api/inventory/products/', { business_id: businessId }),
        api.get('/api/inventory/stock/'),
      ]);
      return { products: asList(products).filter((p) => p.is_active), stock: asList(stock) };
    },
    [businessId, posOpen],
    Boolean(businessId) && posOpen,
  );

  // ---- History table ----
  const visibleSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (sales.data || [])
      .filter((s) => !branchId || s.branch === branchId)
      .filter((s) => !q || (s.receipt_number || '').toLowerCase().includes(q) || (s.cashier_name || '').toLowerCase().includes(q));
  }, [sales.data, branchId, search]);

  const completed = visibleSales.filter((s) => s.status === 'completed');
  const revenue = completed.reduce((sum, s) => sum + toNumber(s.total_amount), 0);

  const openReceipt = async (sale) => {
    setReceiptError('');
    setReceipt({ loading: true, sale });
    try {
      setReceipt({ ...(await api.get(`/api/sales/${sale.id}/receipt/`)), sale });
    } catch (err) {
      setReceipt(null);
      setReceiptError(err.message);
    }
  };

  const printReceipt = (r) => {
    const win = window.open('', '_blank', 'width=380,height=640');
    if (!win) return;
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    win.document.write(`<html><head><title>${esc(r.receipt_number)}</title><style>
      body{font-family:monospace;font-size:13px;padding:16px}h2,p{margin:2px 0;text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:10px}td{padding:2px 0}td:last-child{text-align:right}
      hr{border:0;border-top:1px dashed #000;margin:8px 0}</style></head><body>
      <h2>${esc(r.business_name)}</h2><p>${esc(r.branch_name)}</p><p>${esc(r.receipt_number)}</p>
      <p>${esc(formatDateTime(r.created_at))} · ${esc(r.cashier)}</p><hr/>
      <table>${r.items.map((i) => `<tr><td>${esc(i.product_name)} x${esc(formatQty(i.quantity))}</td><td>${esc(money(i.line_total))}</td></tr>`).join('')}</table><hr/>
      <table><tr><td>Subtotal</td><td>${esc(money(r.subtotal))}</td></tr>
      <tr><td>Discount</td><td>${esc(money(r.discount_amount))}</td></tr>
      <tr><td>Tax</td><td>${esc(money(r.tax_amount))}</td></tr>
      <tr><td><b>Total</b></td><td><b>${esc(money(r.total_amount))}</b></td></tr></table>
      <p style="margin-top:12px">Thank you!</p></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  // ---- POS helpers ----
  const resetPos = () => {
    setCart({});
    setDiscount('');
    setMethod('cash');
    setReference('');
    setTendered('');
    setPosError('');
    setProductSearch('');
    checkoutKey.current = null;
    paymentKey.current = null;
    createdSale.current = null;
    setLocked(false);
  };

  const openPos = () => {
    resetPos();
    setPosBranch(branchId || branches[0]?.id || '');
    setPosOpen(true);
  };

  const closePos = () => {
    if (locked && !window.confirm('This sale is recorded but its payment is not. Close anyway?')) return;
    setPosOpen(false);
  };

  const stockByProduct = useMemo(() => {
    const map = {};
    (catalogue.data?.stock || []).forEach((s) => {
      if (s.branch === posBranch) map[s.product] = toNumber(s.quantity);
    });
    return map;
  }, [catalogue.data, posBranch]);

  const productList = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return (catalogue.data?.products || []).filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode || '').toLowerCase() === q,
    );
  }, [catalogue.data, productSearch]);

  const productById = useMemo(() => Object.fromEntries((catalogue.data?.products || []).map((p) => [p.id, p])), [catalogue.data]);

  const cartLines = Object.entries(cart).map(([id, qty]) => ({ product: productById[id], qty })).filter((l) => l.product);
  const subtotal = round2(cartLines.reduce((sum, l) => sum + l.qty * toNumber(l.product.selling_price), 0));
  const discountValue = Math.min(Math.max(toNumber(discount), 0), subtotal);
  const taxAmount = round2(((subtotal - discountValue) * taxRate) / 100);
  const total = round2(subtotal - discountValue + taxAmount);
  const change = method === 'cash' && tendered !== '' ? round2(toNumber(tendered) - total) : null;

  const setQty = (productId, qty) => {
    if (locked) return;
    const available = stockByProduct[productId] ?? 0;
    const next = Math.min(Math.max(qty, 0), available);
    setCart((c) => {
      const copy = { ...c };
      if (next <= 0) delete copy[productId];
      else copy[productId] = next;
      return copy;
    });
  };

  const charge = async () => {
    setPosError('');
    setBusy(true);
    try {
      if (!createdSale.current) {
        checkoutKey.current ||= newUuid();
        createdSale.current = await api.post('/api/sales/checkout/', {
          checkout_key: checkoutKey.current,
          business_id: businessId,
          branch_id: posBranch,
          discount_amount: discountValue.toFixed(2),
          tax_amount: taxAmount.toFixed(2),
          items: cartLines.map((l) => ({ product_id: l.product.id, quantity: String(l.qty) })),
        });
        setLocked(true);
      }

      paymentKey.current ||= newUuid();
      await api.post('/api/payments/record/', {
        sale_id: createdSale.current.sale_id,
        amount: toNumber(createdSale.current.total_amount).toFixed(2),
        payment_method: method,
        transaction_reference: reference,
        idempotency_key: paymentKey.current,
      });

      const sale = createdSale.current;
      createdSale.current = null;
      setLocked(false);
      setPosOpen(false);
      setNotice(`Sale ${sale.receipt_number} completed — ${money(sale.total_amount)}.`);
      sales.reload();
      openReceipt({ id: sale.sale_id });
    } catch (err) {
      setPosError(
        createdSale.current
          ? `The sale was saved (${createdSale.current.receipt_number}) but recording the payment failed: ${err.message} Press "Retry payment".`
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Sales" subtitle="Ring up sales and review your transactions">
        <PrimaryButton onClick={openPos} disabled={!branches.length}>
          <Plus className="mr-2 h-5 w-5" /> New Sale
        </PrimaryButton>
      </PageHeader>

      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      <ErrorBanner message={receiptError} />
      <ErrorBanner message={sales.error} onRetry={sales.reload} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Revenue" value={money(revenue)} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Completed Sales" value={completed.length} icon={Receipt} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Average Sale" value={money(completed.length ? revenue / completed.length : 0)} icon={TrendingUp} color="text-purple-600" bg="bg-purple-100" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search by receipt or cashier..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {sales.loading && !sales.data ? <Spinner label="Loading sales..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-4 font-medium">Receipt</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Branch</th>
                  <th className="p-4 font-medium">Cashier</th><th className="p-4 text-right font-medium">Total</th><th className="p-4 font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{s.receipt_number}</td>
                    <td className="p-4 text-slate-500">{formatDateTime(s.created_at)}</td>
                    <td className="p-4 text-slate-500">{s.branch_name}</td>
                    <td className="p-4 text-slate-500">{s.cashier_name || '—'}</td>
                    <td className="p-4 text-right font-semibold text-slate-800">{money(s.total_amount)}</td>
                    <td className="p-4"><Badge tone={s.status === 'completed' ? 'green' : s.status === 'draft' ? 'orange' : 'slate'}>{s.status}</Badge></td>
                    <td className="p-4 text-right"><SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => openReceipt(s)}>View</SecondaryButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleSales.length === 0 && <EmptyState message="No sales yet. Click “New Sale” to ring up your first one." />}
          </div>
        )}
      </div>

      {/* ---- Receipt ---- */}
      {receipt && (
        <Modal title="Receipt" onClose={() => setReceipt(null)} maxWidth="max-w-md">
          {receipt.loading ? <Spinner label="Loading receipt..." /> : (
            <div className="space-y-4 text-sm">
              <div className="text-center">
                <p className="text-base font-bold text-slate-800">{receipt.business_name}</p>
                <p className="text-slate-500">{receipt.branch_name}</p>
                <p className="mt-1 font-semibold">{receipt.receipt_number}</p>
                <p className="text-xs text-slate-500">{formatDateTime(receipt.created_at)} · {receipt.cashier}</p>
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {receipt.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{i.product_name}<span className="block text-xs text-slate-400">{formatQty(i.quantity)} × {money(i.unit_price)}</span></td>
                      <td className="py-2 text-right font-medium">{money(i.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(receipt.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Discount</span><span>{money(receipt.discount_amount)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Tax</span><span>{money(receipt.tax_amount)}</span></div>
                <div className="flex justify-between text-base font-bold text-slate-800"><span>Total</span><span>{money(receipt.total_amount)}</span></div>
              </div>
              <div className="flex justify-end"><SecondaryButton onClick={() => printReceipt(receipt)}><Printer className="mr-2 h-4 w-4" /> Print</SecondaryButton></div>
            </div>
          )}
        </Modal>
      )}

      {/* ---- New sale (POS) ---- */}
      {posOpen && (
        <Modal title="New Sale" onClose={closePos} maxWidth="max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Products */}
            <div className="lg:col-span-3">
              <div className="mb-3 flex space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input className={`${inputClass} pl-9`} placeholder="Search product, SKU or barcode..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} disabled={locked} autoFocus />
                </div>
                <select className={`${inputClass.replace("w-full", "w-44")} shrink-0`} value={posBranch} onChange={(e) => { setPosBranch(e.target.value); setCart({}); }} disabled={locked || branches.length <= 1}>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {catalogue.loading && !catalogue.data ? <Spinner /> : (
                <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                  {productList.map((p) => {
                    const available = stockByProduct[p.id] ?? 0;
                    const out = available <= 0;
                    return (
                      <button
                        key={p.id} type="button" disabled={out || locked}
                        onClick={() => setQty(p.id, (cart[p.id] || 0) + 1)}
                        className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.sku}</p>
                        <p className="mt-2 text-sm font-bold text-blue-600">{money(p.selling_price)}</p>
                        <p className={`text-xs ${out ? 'text-red-500' : 'text-slate-500'}`}>{out ? 'Out of stock' : `${formatQty(available)} in stock`}</p>
                      </button>
                    );
                  })}
                  {productList.length === 0 && <div className="col-span-full"><EmptyState message="No matching products." /></div>}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
              <h3 className="mb-3 flex items-center font-bold text-slate-800"><ShoppingCart className="mr-2 h-5 w-5" /> Cart</h3>
              <div className="max-h-48 flex-1 space-y-2 overflow-y-auto">
                {cartLines.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Tap a product to add it.</p>}
                {cartLines.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-sm">
                    <div className="mr-2 min-w-0">
                      <p className="truncate font-medium text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{money(product.selling_price)} each</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button disabled={locked} onClick={() => setQty(product.id, qty - 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><Minus size={14} /></button>
                      <span className="w-8 text-center font-semibold">{formatQty(qty)}</span>
                      <button disabled={locked} onClick={() => setQty(product.id, qty + 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><Plus size={14} /></button>
                      <button disabled={locked} onClick={() => setQty(product.id, 0)} className="rounded p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Discount</span>
                  <input type="number" min="0" step="0.01" disabled={locked} className="w-28 rounded border border-slate-300 px-2 py-1 text-right text-sm" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="flex justify-between text-slate-500"><span>Tax ({taxRate}%)</span><span>{money(taxAmount)}</span></div>
                <div className="flex justify-between text-lg font-bold text-slate-800"><span>Total</span><span>{money(total)}</span></div>
              </div>

              <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
                <Field label="Payment method">
                  <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </Field>
                {method === 'cash' ? (
                  <Field label="Cash received" hint={change !== null ? (change >= 0 ? `Change: ${money(change)}` : `Short by ${money(-change)}`) : undefined}>
                    <input type="number" min="0" step="0.01" className={inputClass} value={tendered} onChange={(e) => setTendered(e.target.value)} />
                  </Field>
                ) : (
                  <Field label="Transaction reference (optional)">
                    <input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} />
                  </Field>
                )}
              </div>

              <ErrorBanner message={posError} />

              <PrimaryButton
                className="mt-3 w-full justify-center py-3 text-base"
                onClick={charge}
                disabled={busy || (!locked && (cartLines.length === 0 || !posBranch)) || (method === 'cash' && change !== null && change < 0)}
              >
                {busy ? 'Processing...' : locked ? 'Retry payment' : (<><CheckCircle2 className="mr-2 h-5 w-5" /> Charge {money(total)}</>)}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Sales;
