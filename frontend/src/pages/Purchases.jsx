import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDate } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Truck,
  Plus,
  PackageCheck,
  CreditCard,
  FileCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Purchases() {
  const { addToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewPo, setShowNewPo] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api('/purchases'),
      api('/suppliers'),
      api('/products?size=100')
    ])
      .then(([pur, sup, prod]) => {
        setPurchases(pur || []);
        setSuppliers(sup || []);
        setProducts(prod.items || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceiveGRN = async (po) => {
    if (!window.confirm(`Receive goods for order ${po.po_no}? This will automatically increase product inventory stock.`)) {
      return;
    }
    try {
      const res = await api(`/purchases/${po.id}/receive`, { method: 'POST' });
      addToast(`Goods received! Generated GRN: ${res.grnNo}. Inventory stock updated.`, 'success');
      loadData();
    } catch (x) {
      addToast(x.message, 'error');
    }
  };

  const pendingCount = purchases.filter((p) => p.status === 'pending').length;
  const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.total, 0);

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Purchase Orders & GRN Inward</h2>
          <p className="sub" style={{ margin: 0 }}>
            Vendor purchase management, Goods Receipt Notes (GRN) & supplier payables
          </p>
        </div>
        <button type="button" className="btn sm" onClick={() => setShowNewPo(true)}>
          <Plus size={15} style={{ marginRight: '6px' }} /> + New Purchase Order
        </button>
      </div>

      {/* Top summary cards */}
      <div className="kpis" style={{ marginBottom: '16px' }}>
        <button type="button">
          <small>Total Purchase Volume</small>
          <b>{inr(totalPurchaseValue)}</b>
          <span className="kpi-hint green">{purchases.length} Purchase Orders</span>
        </button>
        <button type="button" style={{ borderTopColor: pendingCount > 0 ? '#b7634e' : '#496751' }}>
          <small>Pending GRN Deliveries</small>
          <b style={{ color: pendingCount > 0 ? '#8a3b2c' : 'inherit' }}>{pendingCount} Orders</b>
          <span className="kpi-hint">Awaiting inward verification</span>
        </button>
        <button type="button">
          <small>Active Suppliers</small>
          <b>{suppliers.length} Vendors</b>
          <span className="kpi-hint">Chennai wholesale distributors</span>
        </button>
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items Ordered</th>
              <th>Total Amount</th>
              <th>Delivery Status</th>
              <th>Payment Status</th>
              <th className="ra">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((po) => {
              const isReceived = po.status === 'received';
              const isPaid = po.payment_status === 'paid';

              return (
                <tr key={po.id}>
                  <td>
                    <b>{po.po_no}</b>
                    {po.grn_no && <div className="mut" style={{ fontSize: '10px' }}>{po.grn_no}</div>}
                  </td>
                  <td>{formatDate(po.date)}</td>
                  <td><b>{po.supplier_name}</b></td>
                  <td>
                    {po.items?.length || 0} item(s)
                    <div className="mut" style={{ fontSize: '11px' }}>
                      {po.items?.[0]?.name}
                      {po.items?.length > 1 && ` +${po.items.length - 1} more`}
                    </div>
                  </td>
                  <td><b>{inr(po.total)}</b></td>
                  <td>
                    <span className={`pill ${isReceived ? 'ok' : 'low'}`}>
                      {po.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${isPaid ? 'ok' : 'low'}`}>
                      {po.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="ra">
                    {!isReceived && (
                      <button
                        type="button"
                        onClick={() => handleReceiveGRN(po)}
                        style={{ marginRight: '8px', color: '#496751', fontWeight: 600 }}
                      >
                        <PackageCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Receive GRN
                      </button>
                    )}
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => setPayTarget(po)}
                      >
                        Pay Vendor
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Purchase Order Modal */}
      {showNewPo && (
        <CreatePoModal
          suppliers={suppliers}
          products={products}
          onClose={() => setShowNewPo(false)}
          onDone={(msg) => {
            setShowNewPo(false);
            addToast(msg, 'success');
            loadData();
          }}
        />
      )}

      {/* Record Payment Modal */}
      {payTarget && (
        <RecordPaymentModal
          po={payTarget}
          onClose={() => setPayTarget(null)}
          onDone={() => {
            setPayTarget(null);
            addToast(`Payment recorded for ${payTarget.po_no}`, 'success');
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CreatePoModal({ suppliers, products, onClose, onDone }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [lines, setLines] = useState([
    { product_id: products[0]?.id || '', name: products[0]?.name || '', qty: 20, price: products[0]?.purchase_price || 100 }
  ]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const addLine = () => {
    const first = products[0];
    if (first) {
      setLines([...lines, { product_id: first.id, name: first.name, qty: 10, price: first.purchase_price }]);
    }
  };

  const updateLine = (idx, key, val) => {
    setLines((curr) =>
      curr.map((l, j) => {
        if (j !== idx) return l;
        if (key === 'product_id') {
          const prod = products.find((p) => p.id === val);
          return {
            ...l,
            product_id: val,
            name: prod?.name || '',
            price: prod?.purchase_price || l.price
          };
        }
        return { ...l, [key]: val };
      })
    );
  };

  const removeLine = (idx) => {
    setLines((curr) => curr.filter((_, j) => j !== idx));
  };

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return alert('Add at least one product.');
    setBusy(true);
    try {
      const created = await api('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: supplierId,
          items: lines,
          notes
        })
      });
      onDone(`Purchase Order ${created.po_no} created successfully.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Create Purchase Order (PO)" onClose={onClose} maxWidth="600px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Select Supplier *
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category}) - Outstanding: {inr(s.balance)}
              </option>
            ))}
          </select>
        </label>

        <div className="full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0 }}>Order Items</label>
            <button type="button" className="ghost sm" onClick={addLine}>+ Add Product Line</button>
          </div>
          {lines.map((l, idx) => (
            <div key={idx} className="po-item-row">
              <select
                value={l.product_id}
                onChange={(e) => updateLine(idx, 'product_id', e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={l.qty}
                onChange={(e) => updateLine(idx, 'qty', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Cost Rate"
                value={l.price}
                onChange={(e) => updateLine(idx, 'price', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeLine(idx)}
                style={{ border: 0, background: 'none', color: '#8a3b2c', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="full" style={{ textAlign: 'right', fontSize: '15px' }}>
          Total Estimated Order Cost: <b>{inr(total)}</b>
        </div>

        <label className="full">
          Order Instructions / Notes
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please deliver to T. Nagar store by Friday morning"
          />
        </label>

        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Issue Purchase Order'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RecordPaymentModal({ po, onClose, onDone }) {
  const [amt, setAmt] = useState(po.total);
  const [mode, setMode] = useState('bank_transfer');
  const [note, setNote] = useState(`Payment for PO ${po.po_no}`);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/purchases/${po.id}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: po.supplier_id,
          amount: Number(amt),
          mode,
          note
        })
      });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Record Supplier Payment · ${po.supplier_name}`} onClose={onClose} maxWidth="460px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          PO Total: <b>{inr(po.total)}</b>
        </label>
        <label className="full">
          Payment Amount (₹) *
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />
        </label>
        <label className="full">
          Payment Method
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="bank_transfer">NEFT / RTGS Bank Transfer</option>
            <option value="upi">UPI / Instant Pay</option>
            <option value="cheque">Bank Cheque</option>
            <option value="cash">Store Cash</option>
          </select>
        </label>
        <label className="full">
          Transaction Reference / Remarks
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Record Payment</button>
        </div>
      </form>
    </Modal>
  );
}
