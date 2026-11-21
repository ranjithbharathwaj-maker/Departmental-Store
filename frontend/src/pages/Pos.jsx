import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api.js';
import { inr, num } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  PauseCircle,
  PlayCircle,
  User,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Pos() {
  const { addToast } = useToast();
  const searchInputRef = useRef(null);

  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [bd, setBd] = useState('');
  const [interstate, setInterstate] = useState(false);
  const [quote, setQuote] = useState(null);

  // Customer
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custForm, setCustForm] = useState({ name: '', mobile: '' });
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Payments
  const [pays, setPays] = useState([{ method: 'cash', amount: '' }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [invoice, setInvoice] = useState(null);

  // Held Carts
  const [heldCarts, setHeldCarts] = useState([]);

  // Load customer directory for quick selection
  useEffect(() => {
    api('/customers').then((data) => setCustomers(data || [])).catch(() => {});
  }, []);

  // Search autocomplete
  useEffect(() => {
    if (!q.trim()) {
      setRes([]);
      return;
    }
    const timer = setTimeout(() => {
      api(`/products?size=10&q=${encodeURIComponent(q.trim())}`)
        .then((r) => setRes(r.items || []))
        .catch(() => {});
    }, 120);
    return () => clearTimeout(timer);
  }, [q]);

  const addToCart = (product) => {
    if (product.qty <= 0) {
      addToast(`Cannot add "${product.name}" - Item is out of stock!`, 'error');
      return;
    }
    setCart((curr) => {
      const idx = curr.findIndex((x) => x.id === product.id);
      if (idx < 0) {
        return [...curr, { id: product.id, name: product.name, barcode: product.barcode, price: product.selling_price, stock: product.qty, qty: 1, disc: '' }];
      }
      const existing = curr[idx];
      if (existing.qty + 1 > product.qty) {
        addToast(`Maximum stock available for ${product.name} is ${product.qty}`, 'error');
        return curr;
      }
      return curr.map((x, j) => (j === idx ? { ...x, qty: x.qty + 1 } : x));
    });
    setQ('');
    setRes([]);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleScanEnter = (e) => {
    if (e.key === 'Enter' && res.length > 0) {
      const match = res.find((p) => p.barcode === q.trim()) || res[0];
      if (match) addToCart(match);
    }
  };

  const updateCartLine = (idx, key, val) => {
    setCart((curr) =>
      curr.map((x, j) => {
        if (j !== idx) return x;
        if (key === 'qty') {
          const desired = Math.max(0.1, Number(val));
          if (desired > x.stock) {
            addToast(`Only ${x.stock} in stock!`, 'error');
            return { ...x, qty: x.stock };
          }
          return { ...x, qty: desired };
        }
        return { ...x, [key]: val };
      })
    );
  };

  const removeCartLine = (idx) => {
    setCart((curr) => curr.filter((_, j) => j !== idx));
  };

  // Recalculate quote whenever cart or discounts change
  const buildQuoteBody = () => ({
    items: cart.map((x) => ({
      product_id: x.id,
      qty: Number(x.qty) || 1,
      discount_pct: Number(x.disc) || 0
    })),
    bill_discount: Number(bd) || 0,
    interstate
  });

  useEffect(() => {
    if (cart.length === 0) {
      setQuote(null);
      return;
    }
    api('/sales/quote', { method: 'POST', body: JSON.stringify(buildQuoteBody()) })
      .then((q) => {
        setQuote(q);
        setErr('');
      })
      .catch((x) => {
        setQuote(null);
        setErr(x.message);
      });
  }, [cart, bd, interstate]);

  // Synchronize payment amounts
  useEffect(() => {
    if (quote && pays.length === 1) {
      setPays([{ ...pays[0], amount: quote.total }]);
    }
  }, [quote?.total]);

  const totalPaid = pays.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const paymentOk = quote && Math.abs(totalPaid - quote.total) < 0.05;

  const handleCompleteSale = async () => {
    if (!paymentOk) return;
    setBusy(true);
    setErr('');

    try {
      const saleBody = {
        ...buildQuoteBody(),
        payments: pays.map((p) => ({ method: p.method, amount: Number(p.amount) })),
        customer_id: selectedCust?.id || null,
        customer_name: selectedCust?.name || custForm.name || null,
        customer_mobile: selectedCust?.mobile || custForm.mobile || null
      };

      const completed = await api('/sales', { method: 'POST', body: JSON.stringify(saleBody) });
      setInvoice(completed);
      addToast(`Sale completed! Invoice ${completed.invoice_no} generated.`, 'success');
      // Reset POS state
      setCart([]);
      setBd('');
      setPays([{ method: 'cash', amount: '' }]);
      setSelectedCust(null);
      setCustForm({ name: '', mobile: '' });
    } catch (e) {
      setErr(e.message);
      addToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Hold / Resume Bill
  const holdCurrentBill = () => {
    if (cart.length === 0) return;
    const held = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      cart,
      bd,
      customer: selectedCust || custForm
    };
    setHeldCarts((prev) => [...prev, held]);
    setCart([]);
    setBd('');
    setSelectedCust(null);
    setCustForm({ name: '', mobile: '' });
    addToast('Bill placed on hold.', 'info');
  };

  const resumeHeldBill = (heldId) => {
    const found = heldCarts.find((h) => h.id === heldId);
    if (!found) return;
    setCart(found.cart);
    setBd(found.bd);
    if (found.customer?.id) setSelectedCust(found.customer);
    else if (found.customer?.name) setCustForm(found.customer);
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldId));
    addToast('Held bill resumed to register.', 'success');
  };

  return (
    <div className="pos-layout">
      {/* LEFT: Product Lookup & Active Cart */}
      <div className="pos-main">
        <div className="bar" style={{ marginBottom: '10px' }}>
          <h2>POS Terminal · Register #01</h2>
          {heldCarts.length > 0 && (
            <div className="held-badge">
              <PauseCircle size={14} /> {heldCarts.length} Held Bill(s)
            </div>
          )}
        </div>

        {/* Barcode scanner & search input */}
        <div className="sbox">
          <input
            ref={searchInputRef}
            autoFocus
            placeholder="Scan barcode with barcode scanner or type product name / SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleScanEnter}
          />
          {res.length > 0 && (
            <ul className="drop">
              {res.map((p) => (
                <li key={p.id} onClick={() => addToCart(p)}>
                  <div>
                    <b>{p.name}</b>
                    <small className="mut">
                      Barcode: {p.barcode || 'N/A'} · SKU: {p.sku}
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b>{inr(p.selling_price)}</b>
                    <div style={{ fontSize: '11px', color: p.qty <= p.min_stock ? '#8a3b2c' : '#496751' }}>
                      {p.qty > 0 ? `${p.qty} in stock` : 'Out of stock'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Held bills ribbon if any exist */}
        {heldCarts.length > 0 && (
          <div className="held-ribbon">
            <span>Parked Carts:</span>
            {heldCarts.map((h) => (
              <button key={h.id} type="button" className="ghost sm" onClick={() => resumeHeldBill(h.id)}>
                <PlayCircle size={13} style={{ marginRight: '4px' }} />
                {h.customer?.name || 'Walk-in'} ({h.cart.length} items · {h.time})
              </button>
            ))}
          </div>
        )}

        {/* Active Items Table */}
        {cart.length > 0 ? (
          <div className="tw" style={{ marginTop: '10px' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Rate</th>
                  <th style={{ width: '100px' }}>Qty</th>
                  <th style={{ width: '85px' }}>Disc %</th>
                  <th style={{ textAlign: 'right' }}>Line Total</th>
                  <th style={{ width: '40px' }} />
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                      {item.barcode && <div className="mut" style={{ fontSize: '10px' }}>{item.barcode}</div>}
                    </td>
                    <td>{inr(item.price)}</td>
                    <td>
                      <div className="qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateCartLine(idx, 'qty', item.qty - 1)}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          className="mini-input"
                          value={item.qty}
                          onChange={(e) => updateCartLine(idx, 'qty', e.target.value)}
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateCartLine(idx, 'qty', item.qty + 1)}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="mini-input"
                        placeholder="0"
                        value={item.disc}
                        onChange={(e) => updateCartLine(idx, 'disc', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {quote?.lines[idx] ? inr(quote.lines[idx].total) : inr(item.price * item.qty)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeCartLine(idx)}
                        style={{ color: '#8a3b2c', border: 0, background: 'none', cursor: 'pointer' }}
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ padding: '60px 20px', marginTop: '16px' }}>
            <ShoppingCart size={36} style={{ color: '#D5BD91', marginBottom: '8px' }} />
            <p>The register cart is currently empty.</p>
            <small className="mut">Scan product barcode or search catalog items above to begin billing.</small>
          </div>
        )}

        {/* Quick Cart Actions */}
        {cart.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <button type="button" className="ghost" onClick={holdCurrentBill}>
              <PauseCircle size={14} style={{ marginRight: '6px' }} /> Hold Bill
            </button>
            <button
              type="button"
              className="ghost"
              style={{ color: '#8a3b2c' }}
              onClick={() => {
                if (window.confirm('Clear all items from current cart?')) setCart([]);
              }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Bill Summary, Customer & Payments */}
      <aside className="pos-sidebar">
        <h3>Billing Summary</h3>

        {/* Customer Select / Input */}
        <div className="pos-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Customer Info</label>
            {selectedCust && (
              <span className="pill" style={{ fontSize: '10px' }}>
                <Sparkles size={10} style={{ marginRight: '4px' }} />
                {selectedCust.loyalty_points} Points
              </span>
            )}
          </div>
          <select
            value={selectedCust?.id || ''}
            onChange={(e) => {
              const cust = customers.find((c) => c.id === e.target.value);
              setSelectedCust(cust || null);
            }}
          >
            <option value="">-- Walk-in Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mobile}) - {c.loyalty_points} pts
              </option>
            ))}
          </select>
          {!selectedCust && (
            <div className="two" style={{ marginTop: '6px' }}>
              <input
                placeholder="Name (Optional)"
                value={custForm.name}
                onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
              />
              <input
                placeholder="Mobile (98401...)"
                value={custForm.mobile}
                onChange={(e) => setCustForm({ ...custForm, mobile: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Discount & Taxes Settings */}
        <div className="pos-box">
          <label>
            Flat Bill Discount (₹)
            <input
              type="number"
              min="0"
              value={bd}
              placeholder="0.00"
              onChange={(e) => setBd(e.target.value)}
            />
          </label>
          <label className="chk" style={{ marginTop: '8px', fontSize: '11px' }}>
            <input
              type="checkbox"
              checked={interstate}
              onChange={(e) => setInterstate(e.target.checked)}
            />
            Interstate Sale (IGST instead of CGST+SGST)
          </label>
        </div>

        {/* Detailed Financial Calculation */}
        {quote && (
          <div className="pos-box" style={{ background: '#faf9f4' }}>
            <dl>
              <dt>Gross Items Total</dt>
              <dd>{inr(quote.subtotal)}</dd>
              {quote.discount > 0 && (
                <>
                  <dt style={{ color: '#8a3b2c' }}>Total Discount</dt>
                  <dd style={{ color: '#8a3b2c' }}>−{inr(quote.discount)}</dd>
                </>
              )}
              <dt>Net Taxable Amount</dt>
              <dd>{inr(quote.taxable)}</dd>
              {!interstate ? (
                <>
                  <dt>CGST</dt>
                  <dd>{inr(quote.cgst)}</dd>
                  <dt>SGST</dt>
                  <dd>{inr(quote.sgst)}</dd>
                </>
              ) : (
                <>
                  <dt>IGST</dt>
                  <dd>{inr(quote.igst)}</dd>
                </>
              )}
              {quote.round_off !== 0 && (
                <>
                  <dt>Round-off</dt>
                  <dd>{inr(quote.round_off)}</dd>
                </>
              )}
              <dt className="gt">Net Payable</dt>
              <dd className="gt">{inr(quote.total)}</dd>
            </dl>
          </div>
        )}

        {/* Payment Split & Tendering */}
        {quote && (
          <div className="pos-box">
            <label style={{ marginBottom: '6px' }}>Payment Tendered</label>
            {pays.map((p, i) => (
              <div className="two" key={i} style={{ marginBottom: '6px' }}>
                <select
                  value={p.method}
                  onChange={(e) =>
                    setPays(pays.map((x, j) => (j === i ? { ...x, method: e.target.value } : x)))
                  }
                >
                  <option value="cash">Cash 💵</option>
                  <option value="upi">UPI / QR 📱</option>
                  <option value="card">Debit / Credit Card 💳</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={p.amount}
                  onChange={(e) =>
                    setPays(pays.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className="ghost sm"
              onClick={() => setPays([...pays, { method: 'upi', amount: '' }])}
            >
              + Add Split Payment
            </button>

            {!paymentOk && (
              <div className="alert" style={{ marginTop: '8px', fontSize: '11px' }}>
                Total payable is {inr(quote.total)}. Tendered amount is {inr(totalPaid)}.
              </div>
            )}
          </div>
        )}

        {err && <div className="alert">{err}</div>}

        <button
          type="button"
          className="btn"
          disabled={!paymentOk || busy || cart.length === 0}
          onClick={handleCompleteSale}
          style={{ width: '100%', padding: '16px', fontSize: '14px' }}
        >
          {busy ? 'Processing Sale…' : `Complete Sale (${inr(quote ? quote.total : 0)})`}
        </button>
      </aside>

      {/* Invoice Receipt Modal */}
      {invoice && (
        <Modal title="Store Tax Invoice" onClose={() => setInvoice(null)} maxWidth="520px">
          <div className="invoice printable" id="printable-invoice">
            <div className="inv-header">
              <h2>{invoice.store_name || 'ROYAL MART'}</h2>
              <div style={{ fontSize: '12px' }}>{invoice.store_address}</div>
              <div style={{ fontSize: '11px', color: '#6d756d' }}>
                GSTIN: {invoice.store_gstin} · State: 33 (Tamil Nadu)
              </div>
              <div style={{ borderBottom: '1px dashed #dcded4', margin: '8px 0' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '6px 0' }}>
              <div>
                <b>Invoice: {invoice.invoice_no}</b>
                <div>Date: {new Date(invoice.created_at).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Cashier: {invoice.cashier}</div>
                {invoice.customer_name && <div>Customer: {invoice.customer_name}</div>}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td style={{ textAlign: 'center' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right' }}>{inr(it.unit_price)}</td>
                    <td style={{ textAlign: 'right' }}>{inr(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl style={{ marginTop: '8px' }}>
              <dt>Taxable Subtotal</dt>
              <dd>{inr(invoice.taxable)}</dd>
              <dt>CGST</dt>
              <dd>{inr(invoice.cgst)}</dd>
              <dt>SGST</dt>
              <dd>{inr(invoice.sgst)}</dd>
              {invoice.igst > 0 && (
                <>
                  <dt>IGST</dt>
                  <dd>{inr(invoice.igst)}</dd>
                </>
              )}
              {invoice.discount > 0 && (
                <>
                  <dt>Discount</dt>
                  <dd>−{inr(invoice.discount)}</dd>
                </>
              )}
              <dt className="gt">Total Paid</dt>
              <dd className="gt">{inr(invoice.total)}</dd>
            </dl>

            <div style={{ fontSize: '11px', marginTop: '10px' }}>
              Paid Via:{' '}
              {invoice.payments?.map((p) => `${p.method.toUpperCase()} (${inr(p.amount)})`).join(' · ')}
            </div>
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#6d756d', marginTop: '12px' }}>
              Thank you for shopping at Royal Mart! Please visit again.
            </div>
          </div>

          <div className="acts" style={{ marginTop: '16px' }}>
            <button type="button" className="ghost" onClick={() => setInvoice(null)}>
              New Bill
            </button>
            <button type="button" className="btn" onClick={() => window.print()}>
              <Printer size={15} style={{ marginRight: '6px' }} /> Print Invoice
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
