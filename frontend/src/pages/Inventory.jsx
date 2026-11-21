import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDateTime } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Boxes,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Trash2,
  Filter,
  Search,
  History,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function Inventory() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('stock'); // 'stock' or 'movements'
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'out', 'expiry'
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [adjProd, setAdjProd] = useState(null);
  const [damageProd, setDamageProd] = useState(null);
  const [transferProd, setTransferProd] = useState(null);

  const loadInventory = () => {
    setLoading(true);
    Promise.all([
      api('/products?size=100'),
      api('/stock/movements?page=1')
    ])
      .then(([pRes, mRes]) => {
        setProducts(pRes.items || []);
        setMovements(mRes.items || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const nowStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysStr = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (q) {
      const term = q.toLowerCase();
      const match =
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term));
      if (!match) return false;
    }
    if (filter === 'low') return p.qty <= p.min_stock && p.qty > 0;
    if (filter === 'out') return p.qty === 0;
    if (filter === 'expiry') return p.expiry_date && p.expiry_date <= thirtyDaysStr;
    return true;
  });

  const lowStockCount = products.filter((p) => p.qty <= p.min_stock && p.qty > 0).length;
  const outCount = products.filter((p) => p.qty === 0).length;
  const expiryCount = products.filter((p) => p.expiry_date && p.expiry_date <= thirtyDaysStr).length;

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Inventory Management & Stock Ledger</h2>
          <p className="sub" style={{ margin: 0 }}>
            Real-time stock valuation, batch expiries, damages & audit trail
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={tab === 'stock' ? 'btn sm' : 'ghost'}
            onClick={() => setTab('stock')}
          >
            <Boxes size={14} style={{ marginRight: '6px' }} /> Stock Overview
          </button>
          <button
            type="button"
            className={tab === 'movements' ? 'btn sm' : 'ghost'}
            onClick={() => setTab('movements')}
          >
            <History size={14} style={{ marginRight: '6px' }} /> Stock Movements
          </button>
        </div>
      </div>

      {tab === 'stock' && (
        <>
          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Items ({products.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              <AlertTriangle size={13} style={{ marginRight: '4px', color: '#8a3b2c' }} />
              Low Stock Alert ({lowStockCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'out' ? 'active' : ''}`}
              onClick={() => setFilter('out')}
            >
              Out of Stock ({outCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'expiry' ? 'active' : ''}`}
              onClick={() => setFilter('expiry')}
            >
              <Clock size={13} style={{ marginRight: '4px', color: '#D5BD91' }} />
              Expiring Soon ({expiryCount})
            </button>
          </div>

          <div className="tools">
            <input
              placeholder="Search inventory by name, barcode or SKU…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU / Category</th>
                  <th>Cost Rate</th>
                  <th>Stock Count</th>
                  <th>Reorder Level</th>
                  <th>Inventory Value</th>
                  <th>Batch / Expiry</th>
                  <th className="ra">Stock Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.qty <= p.min_stock && p.qty > 0;
                  const isOut = p.qty === 0;
                  const isExpiring = p.expiry_date && p.expiry_date <= thirtyDaysStr;

                  return (
                    <tr key={p.id}>
                      <td>
                        <b>{p.name}</b>
                        {p.barcode && <div className="mut" style={{ fontSize: '10px' }}>{p.barcode}</div>}
                      </td>
                      <td>
                        <div>{p.category}</div>
                        <code style={{ fontSize: '10px' }}>{p.sku}</code>
                      </td>
                      <td>{inr(p.purchase_price)}</td>
                      <td>
                        <span className={`pill ${isOut ? 'out' : isLow ? 'low' : ''}`}>
                          {isOut ? 'Out of stock' : `${p.qty} ${p.unit}`}
                        </span>
                      </td>
                      <td>{p.min_stock} {p.unit}</td>
                      <td><b>{inr(p.qty * p.purchase_price)}</b></td>
                      <td>
                        <div>{p.batch_no || 'B-2026'}</div>
                        <span style={{ fontSize: '11px', color: isExpiring ? '#8a3b2c' : '#6d756d', fontWeight: isExpiring ? 600 : 'normal' }}>
                          {p.expiry_date || '—'}
                        </span>
                      </td>
                      <td className="ra">
                        <button
                          type="button"
                          onClick={() => setAdjProd(p)}
                          style={{ marginRight: '8px' }}
                        >
                          Adjust
                        </button>
                        <button
                          type="button"
                          onClick={() => setDamageProd(p)}
                          style={{ marginRight: '8px', color: '#8a3b2c' }}
                        >
                          Damage
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransferProd(p)}
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <h3>Audit Trail · All Inventory Movements</h3>
            <button className="ghost sm" onClick={loadInventory}>Refresh Log</button>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Before</th>
                  <th>Change</th>
                  <th>After</th>
                  <th>Reason / Ref</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const isPositive = m.qty_change > 0;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: '11px' }}>{formatDateTime(m.date)}</td>
                      <td><b>{m.product}</b></td>
                      <td>
                        <span className={`pill ${m.type === 'sale' ? 'low' : m.type === 'purchase' ? 'ok' : ''}`}>
                          {m.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{m.qty_before}</td>
                      <td style={{ color: isPositive ? '#496751' : '#8a3b2c', fontWeight: 600 }}>
                        {isPositive ? `+${m.qty_change}` : m.qty_change}
                      </td>
                      <td><b>{m.qty_after}</b></td>
                      <td>{m.reason} {m.ref && <code>({m.ref})</code>}</td>
                      <td style={{ fontSize: '11px' }}>{m.user || 'System'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjProd && (
        <StockAuditModal
          product={adjProd}
          onClose={() => setAdjProd(null)}
          onDone={() => {
            setAdjProd(null);
            addToast(`Stock count updated for ${adjProd.name}`, 'success');
            loadInventory();
          }}
        />
      )}

      {/* Damage Modal */}
      {damageProd && (
        <DamageRecordModal
          product={damageProd}
          onClose={() => setDamageProd(null)}
          onDone={() => {
            setDamageProd(null);
            addToast(`Damage written off for ${damageProd.name}`, 'success');
            loadInventory();
          }}
        />
      )}

      {/* Transfer Modal */}
      {transferProd && (
        <TransferModal
          product={transferProd}
          onClose={() => setTransferProd(null)}
          onDone={() => {
            setTransferProd(null);
            addToast(`Stock transfer recorded for ${transferProd.name}`, 'success');
            loadInventory();
          }}
        />
      )}
    </div>
  );
}

function StockAuditModal({ product, onClose, onDone }) {
  const [qty, setQty] = useState(product.qty);
  const [reason, setReason] = useState('Stock Count Correction');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, new_qty: Number(qty), reason })
      });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Stock Adjustment · ${product.name}`} onClose={onClose} maxWidth="460px">
      <form onSubmit={save} className="fgrid">
        <label className="full">
          Current Recorded Stock
          <input disabled value={`${product.qty} ${product.unit}`} />
        </label>
        <label className="full">
          Physical Counted Quantity *
          <input
            type="number"
            min="0"
            step="any"
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <label className="full">
          Reason for Discrepancy
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Month-end physical audit verification"
          />
        </label>
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Update Stock'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DamageRecordModal({ product, onClose, onDone }) {
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('Expired batch removed from shelf');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (Number(qty) <= 0 || Number(qty) > product.qty) {
      return setErr(`Enter quantity between 1 and ${product.qty}`);
    }
    setBusy(true);
    setErr('');
    try {
      await api('/stock/damage', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, damage_qty: Number(qty), reason })
      });
      onDone();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Record Damage / Expiry Loss · ${product.name}`} onClose={onClose} maxWidth="460px">
      <form onSubmit={submit} className="fgrid">
        <div className="alert full" style={{ margin: 0, fontSize: '12px' }}>
          Writing off damage reduces available stock and logs an inventory loss event. Available: {product.qty} {product.unit}
        </div>
        <label className="full">
          Damaged / Expired Quantity *
          <input
            type="number"
            min="1"
            max={product.qty}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <label className="full">
          Loss Reason
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Expired batch removed from shelf">Expired batch removed from shelf</option>
            <option value="Packaging leakage / seal broken">Packaging leakage / seal broken</option>
            <option value="Dropped / transit damage">Dropped / transit damage</option>
            <option value="Moisture / heat deterioration">Moisture / heat deterioration</option>
          </select>
        </label>
        {err && <div className="alert full">{err}</div>}
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" style={{ background: '#8a3b2c' }} disabled={busy}>
            {busy ? 'Recording…' : 'Record Loss'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TransferModal({ product, onClose, onDone }) {
  const [qty, setQty] = useState('5');
  const [fromLoc, setFromLoc] = useState('Backroom Warehouse');
  const [toLoc, setToLoc] = useState('Main Store Front Rack');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/stock/transfer', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          from_location: fromLoc,
          to_location: toLoc,
          transfer_qty: Number(qty)
        })
      });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Internal Stock Transfer · ${product.name}`} onClose={onClose} maxWidth="460px">
      <form onSubmit={submit} className="fgrid">
        <label>
          Transfer From
          <select value={fromLoc} onChange={(e) => setFromLoc(e.target.value)}>
            <option value="Backroom Warehouse">Backroom Warehouse</option>
            <option value="Main Store Front Rack">Main Store Front Rack</option>
            <option value="Cold Storage Chiller">Cold Storage Chiller</option>
          </select>
        </label>
        <label>
          Transfer To
          <select value={toLoc} onChange={(e) => setToLoc(e.target.value)}>
            <option value="Main Store Front Rack">Main Store Front Rack</option>
            <option value="Checkout Counter Display">Checkout Counter Display</option>
            <option value="Cold Storage Chiller">Cold Storage Chiller</option>
          </select>
        </label>
        <label className="full">
          Quantity to Transfer ({product.unit})
          <input
            type="number"
            min="1"
            max={product.qty}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Record Transfer</button>
        </div>
      </form>
    </Modal>
  );
}
