import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDateTime, exportToCSV } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Eye,
  Calendar
} from 'lucide-react';

export default function Sales() {
  const { addToast } = useToast();
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);

  const loadSales = () => {
    setLoading(true);
    api(`/sales?q=${encodeURIComponent(q)}&page=${page}&size=15&dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .then((d) => {
        setSales(d.items || []);
        setTotal(d.total || 0);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  }, [q, page, dateFrom, dateTo]);

  const handleExport = () => {
    if (!sales.length) return addToast('No sales data to export.', 'info');
    const rows = sales.map((s) => ({
      InvoiceNo: s.invoice_no,
      Date: s.created_at,
      Cashier: s.cashier,
      Customer: s.customer_name || 'Walk-in',
      Subtotal: s.subtotal,
      Discount: s.discount,
      Taxable: s.taxable,
      CGST: s.cgst,
      SGST: s.sgst,
      TotalPayable: s.total,
      Payments: s.payments?.map((p) => `${p.method}:${p.amount}`).join(';')
    }));
    exportToCSV(`RoyalMart_Sales_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addToast('Sales log exported to CSV.', 'success');
  };

  const pages = Math.max(1, Math.ceil(total / 15));

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Sales Transactions & Invoices</h2>
          <p className="sub" style={{ margin: 0 }}>
            Complete audit log of {total} customer invoices, GST breakdowns & sales returns
          </p>
        </div>
        <button type="button" className="ghost" onClick={handleExport}>
          <Download size={14} style={{ marginRight: '6px' }} /> Export Sales CSV
        </button>
      </div>

      <div className="tools" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <input
          style={{ flex: 2, minWidth: '220px' }}
          placeholder="Search invoice number, customer name, phone, or cashier…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          title="From Date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          title="To Date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
        />
        {(dateFrom || dateTo) && (
          <button className="ghost sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
            Clear Dates
          </button>
        )}
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Cashier</th>
              <th>Taxable</th>
              <th>GST Tax</th>
              <th>Total Bill</th>
              <th>Tender Type</th>
              <th className="ra">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.invoice_no}</b>
                  {s.returns && s.returns.length > 0 && (
                    <span className="pill low" style={{ marginLeft: '4px', fontSize: '9px' }}>
                      RETURNED
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '11px' }}>{formatDateTime(s.created_at)}</td>
                <td>
                  <b>{s.customer_name || 'Walk-in Customer'}</b>
                  {s.customer_mobile && <div className="mut" style={{ fontSize: '10px' }}>{s.customer_mobile}</div>}
                </td>
                <td>{s.cashier}</td>
                <td>{inr(s.taxable)}</td>
                <td>{inr(s.cgst + s.sgst + (s.igst || 0))}</td>
                <td><b>{inr(s.total)}</b></td>
                <td>
                  <span className="pill">
                    {s.payments?.map((p) => p.method.toUpperCase()).join(' + ') || 'CASH'}
                  </span>
                </td>
                <td className="ra">
                  <button
                    type="button"
                    onClick={() => setViewInvoice(s)}
                    style={{ marginRight: '8px' }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnTarget(s)}
                    style={{ color: '#8a3b2c' }}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          ‹ Prev
        </button>
        <span>
          Page {page} of {pages} · {total} sales records
        </span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next ›
        </button>
      </div>

      {/* Invoice Details Modal */}
      {viewInvoice && (
        <Modal title={`Invoice ${viewInvoice.invoice_no}`} onClose={() => setViewInvoice(null)} maxWidth="520px">
          <div className="invoice" id="printable-sales-inv">
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #dcded4', paddingBottom: '8px' }}>
              <h2>ROYAL MART</h2>
              <div style={{ fontSize: '12px' }}>42, Anna Salai, T. Nagar, Chennai - 600017</div>
              <div style={{ fontSize: '11px', color: '#6d756d' }}>GSTIN: 33AAAAA0000A1Z5</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '8px 0' }}>
              <div>
                <b>Inv: {viewInvoice.invoice_no}</b>
                <div>Date: {formatDateTime(viewInvoice.created_at)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Cashier: {viewInvoice.cashier}</div>
                <div>Customer: {viewInvoice.customer_name || 'Walk-in'}</div>
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
                {viewInvoice.items?.map((it) => (
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
              <dd>{inr(viewInvoice.taxable)}</dd>
              <dt>CGST</dt>
              <dd>{inr(viewInvoice.cgst)}</dd>
              <dt>SGST</dt>
              <dd>{inr(viewInvoice.sgst)}</dd>
              <dt className="gt">Total Paid</dt>
              <dd className="gt">{inr(viewInvoice.total)}</dd>
            </dl>

            {viewInvoice.returns && viewInvoice.returns.length > 0 && (
              <div className="alert" style={{ marginTop: '10px', fontSize: '12px' }}>
                <b>Return History:</b>
                {viewInvoice.returns.map((r) => (
                  <div key={r.id}>
                    • Refunded {inr(r.refund_amount)} for {r.qty}x {r.product_name} ({r.reason})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="acts" style={{ marginTop: '14px' }}>
            <button type="button" className="ghost" onClick={() => setViewInvoice(null)}>Close</button>
            <button type="button" className="btn" onClick={() => window.print()}>
              <Printer size={14} style={{ marginRight: '6px' }} /> Print
            </button>
          </div>
        </Modal>
      )}

      {/* Sales Return / Refund Modal */}
      {returnTarget && (
        <SalesReturnModal
          sale={returnTarget}
          onClose={() => setReturnTarget(null)}
          onDone={() => {
            setReturnTarget(null);
            addToast('Return processed and inventory updated.', 'success');
            loadSales();
          }}
        />
      )}
    </div>
  );
}

function SalesReturnModal({ sale, onClose, onDone }) {
  const [selectedItemId, setSelectedItemId] = useState(sale.items?.[0]?.id || '');
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('Defective / Quality Issue');
  const [restock, setRestock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const selectedItem = sale.items?.find((i) => i.id === selectedItemId) || sale.items?.[0];

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const numQty = Number(qty);
    if (numQty <= 0 || numQty > selectedItem.qty) {
      return setErr(`Return quantity must be between 1 and ${selectedItem.qty}`);
    }
    setBusy(true);
    setErr('');
    try {
      await api(`/sales/${sale.id}/return`, {
        method: 'POST',
        body: JSON.stringify({
          item_id: selectedItem.id,
          return_qty: numQty,
          reason,
          restock
        })
      });
      onDone();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Process Sales Return · ${sale.invoice_no}`} onClose={onClose} maxWidth="480px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Select Item to Return
          <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
            {sale.items?.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} (Sold: {it.qty} @ {inr(it.unit_price)})
              </option>
            ))}
          </select>
        </label>

        <label className="full">
          Return Quantity (Max: {selectedItem?.qty || 1})
          <input
            type="number"
            min="1"
            max={selectedItem?.qty || 1}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>

        <label className="full">
          Return Reason
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Defective / Quality Issue">Defective / Quality Issue</option>
            <option value="Customer Change of Mind">Customer Change of Mind</option>
            <option value="Wrong Item Purchased">Wrong Item Purchased</option>
            <option value="Packaging Broken">Packaging Broken</option>
          </select>
        </label>

        <label className="chk full">
          <input
            type="checkbox"
            checked={restock}
            onChange={(e) => setRestock(e.target.checked)}
          />
          Restock into inventory (Item is undamaged and resalable)
        </label>

        {err && <div className="alert full">{err}</div>}

        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" style={{ background: '#8a3b2c' }} disabled={busy}>
            {busy ? 'Processing…' : 'Process Refund'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
