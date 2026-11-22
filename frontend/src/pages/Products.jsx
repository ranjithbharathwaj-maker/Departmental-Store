import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, num } from '../utils/helpers.js';
import { exportToExcel } from '../utils/excelExport.js';
import Modal from '../components/Modal.jsx';
import BarcodeModal from '../components/BarcodeModal.jsx';
import { useToast } from '../components/Toast.jsx';
import { Plus, Search, Filter, Download, Barcode, ArrowUpDown, Edit, Archive, Check } from 'lucide-react';

const CATEGORIES = [
  'Groceries',
  'Beverages',
  'Dairy Products',
  'Snacks & Biscuits',
  'Personal Care',
  'Home Cleaning',
  'Household & Essentials',
  'Stationery',
  'Packaged Foods',
  'Fruits & Vegetables'
];

const EMPTY_PROD = {
  name: '',
  barcode: '',
  sku: '',
  category: 'Groceries',
  brand: '',
  unit: 'piece',
  purchase_price: '',
  selling_price: '',
  mrp: '',
  gst: '5',
  min_stock: '10',
  opening_qty: '50',
  expiry_date: '2028-12-31'
};

export default function Products() {
  const { addToast } = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [adj, setAdj] = useState(null);
  const [barcodeTarget, setBarcodeTarget] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api(`/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${sort}&page=${page}&size=10`)
      .then((d) => setData(d))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [q, category, sort, page]);

  const handleArchive = async (p) => {
    if (!window.confirm(`Archive "${p.name}"? Past transactions will retain history.`)) return;
    try {
      await api(`/products/${p.id}/archive`, { method: 'POST' });
      addToast(`Product "${p.name}" archived.`, 'success');
      loadProducts();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!data || !data.items.length) {
      addToast('No products to export.', 'info');
      return;
    }
    setExporting(true);
    try {
      const res = await api('/products?size=9999');
      const columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Product Name', key: 'name', width: 28 },
        { header: 'Barcode', key: 'barcode', width: 16 },
        { header: 'SKU', key: 'sku', width: 14 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Brand', key: 'brand', width: 18 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Purchase Price', key: 'purchase_price', format: 'currency', width: 16 },
        { header: 'Selling Price', key: 'selling_price', format: 'currency', width: 16 },
        { header: 'MRP', key: 'mrp', format: 'currency', width: 14 },
        { header: 'GST %', key: 'gst', format: 'number', width: 10 },
        { header: 'Stock Qty', key: 'qty', format: 'integer', width: 12 },
        { header: 'Min Stock', key: 'min_stock', format: 'integer', width: 12 },
        { header: 'Expiry Date', key: 'expiry_date', format: 'date-only', width: 14 }
      ];
      const filename = await exportToExcel({
        moduleName: 'product-catalog',
        storeName: 'royal-mart',
        sheetName: 'Products',
        columns,
        rows: res.items,
        totals: { labelCol: 'name', sumCols: ['purchase_price', 'selling_price', 'mrp', 'qty'] }
      });
      addToast(`Product catalog exported: ${filename}`, 'success');
    } catch (e) {
      addToast(e.message || 'Export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / 10)) : 1;

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Product Catalog</h2>
          <p className="sub" style={{ margin: 0 }}>
            Manage {data?.total || 0} active store SKUs, pricing, GST & barcode labels
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="ghost" onClick={handleExportExcel} disabled={exporting}>
            <Download size={14} style={{ marginRight: '6px' }} /> {exporting ? 'Exporting…' : 'Export to Excel'}
          </button>
          <button type="button" className="btn sm" onClick={() => setForm({})}>
            <Plus size={15} style={{ marginRight: '6px' }} /> + Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="tools" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
          <input
            placeholder="Search by name, barcode, SKU or brand…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories ({CATEGORIES.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="price">Sort: Price (Low to High)</option>
          <option value="price_desc">Sort: Price (High to Low)</option>
          <option value="stock">Sort: Stock (Low to High)</option>
          <option value="stock_desc">Sort: Stock (High to Low)</option>
        </select>
      </div>

      {loading && !data && <p>Loading catalog items…</p>}

      {data && (
        <>
          {data.items.length > 0 ? (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Product & Brand</th>
                    <th>Barcode / SKU</th>
                    <th>Category</th>
                    <th>Purchase Rate</th>
                    <th>Selling Price</th>
                    <th>GST</th>
                    <th>Stock Level</th>
                    <th>Expiry</th>
                    <th className="ra">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => {
                    const isLow = Number(p.qty) <= Number(p.min_stock);
                    const isOut = Number(p.qty) === 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <b>{p.name}</b>
                          {p.brand && <div className="mut" style={{ fontSize: '11px' }}>{p.brand}</div>}
                        </td>
                        <td>
                          <code>{p.barcode || '—'}</code>
                          <div className="mut" style={{ fontSize: '10px' }}>{p.sku}</div>
                        </td>
                        <td>{p.category}</td>
                        <td>{inr(p.purchase_price)}</td>
                        <td><b>{inr(p.selling_price)}</b></td>
                        <td>{p.gst}%</td>
                        <td>
                          <span className={`pill ${isOut ? 'out' : isLow ? 'low' : ''}`}>
                            {isOut ? 'Out of Stock (0)' : `${p.qty} ${p.unit}`}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px' }}>{p.expiry_date || '—'}</td>
                        <td className="ra">
                          <button
                            type="button"
                            title="Generate Barcode"
                            onClick={() => setBarcodeTarget(p)}
                            style={{ marginRight: '6px' }}
                          >
                            <Barcode size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdj(p)}
                            style={{ marginRight: '6px' }}
                          >
                            Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(p)}
                            style={{ marginRight: '6px' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(p)}
                            style={{ color: '#8a3b2c' }}
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <p>No products match your current search or category filter.</p>
              <button className="ghost sm" onClick={() => { setQ(''); setCategory(''); }}>
                Reset Filters
              </button>
            </div>
          )}

          {/* Pager */}
          <div className="pager">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹ Prev
            </button>
            <span>
              Page {page} of {pages} · {data.total} products
            </span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next ›
            </button>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {form && (
        <ProductFormModal
          product={form.id ? form : null}
          onClose={() => setForm(null)}
          onSaved={(msg) => {
            setForm(null);
            addToast(msg, 'success');
            loadProducts();
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adj && (
        <StockAdjustModal
          product={adj}
          onClose={() => setAdj(null)}
          onSaved={() => {
            setAdj(null);
            addToast(`Stock updated for ${adj.name}`, 'success');
            loadProducts();
          }}
        />
      )}

      {/* Barcode Label Modal */}
      {barcodeTarget && (
        <BarcodeModal
          product={barcodeTarget}
          onClose={() => setBarcodeTarget(null)}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [f, setF] = useState(
    product
      ? {
          name: product.name || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          category: product.category || 'Groceries',
          brand: product.brand || '',
          unit: product.unit || 'piece',
          purchase_price: product.purchase_price ?? '',
          selling_price: product.selling_price ?? '',
          mrp: product.mrp ?? '',
          gst: product.gst ?? '5',
          min_stock: product.min_stock ?? '10',
          opening_qty: product.qty ?? '50',
          expiry_date: product.expiry_date || '2028-12-31'
        }
      : EMPTY_PROD
  );
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Product name is required.');
    if (f.purchase_price === '' || f.selling_price === '') {
      return setErr('Purchase price and selling price are required.');
    }
    setBusy(true);
    setErr('');

    const payload = {
      ...f,
      purchase_price: Number(f.purchase_price),
      selling_price: Number(f.selling_price),
      mrp: f.mrp ? Number(f.mrp) : Number(f.selling_price),
      gst: Number(f.gst) || 0,
      min_stock: Number(f.min_stock) || 5,
      opening_qty: Number(f.opening_qty) || 0
    };

    try {
      if (isEdit) {
        await api(`/products/${product.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        onSaved(`Product "${payload.name}" updated successfully.`);
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        onSaved(`Product "${payload.name}" added to catalog with ${payload.opening_qty} units opening stock.`);
      }
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit Product · ${product.name}` : 'Add New Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="fgrid">
        <label className="full">
          Product Name *
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="e.g. Aashirvaad Shudh Chakki Atta 5kg"
          />
        </label>

        <label>
          Barcode (EAN-13 / UPC)
          <input
            value={f.barcode}
            onChange={(e) => setF({ ...f, barcode: e.target.value })}
            placeholder="e.g. 8901030383023"
          />
        </label>

        <label>
          SKU Code
          <input
            value={f.sku}
            onChange={(e) => setF({ ...f, sku: e.target.value })}
            placeholder="e.g. GRO-ATT-003"
          />
        </label>

        <label>
          Category
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Brand Name
          <input
            value={f.brand}
            onChange={(e) => setF({ ...f, brand: e.target.value })}
            placeholder="e.g. Aashirvaad"
          />
        </label>

        <label>
          Unit of Measure
          <select value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
            <option value="piece">Piece (pc)</option>
            <option value="pack">Pack</option>
            <option value="bottle">Bottle</option>
            <option value="jar">Jar</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="litre">Litre (L)</option>
            <option value="bag">Bag</option>
            <option value="box">Box</option>
            <option value="dozen">Dozen</option>
          </select>
        </label>

        <label>
          Purchase Cost Price (₹) *
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={f.purchase_price}
            onChange={(e) => setF({ ...f, purchase_price: e.target.value })}
          />
        </label>

        <label>
          Selling Price (Incl. GST ₹) *
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={f.selling_price}
            onChange={(e) => setF({ ...f, selling_price: e.target.value })}
          />
        </label>

        <label>
          Maximum Retail Price (MRP ₹)
          <input
            type="number"
            step="0.01"
            min="0"
            value={f.mrp}
            onChange={(e) => setF({ ...f, mrp: e.target.value })}
          />
        </label>

        <label>
          GST Tax Slab (%)
          <select value={f.gst} onChange={(e) => setF({ ...f, gst: e.target.value })}>
            <option value="0">0% (Nil / Exempt)</option>
            <option value="5">5% (Essentials)</option>
            <option value="12">12% (Standard I)</option>
            <option value="18">18% (Standard II)</option>
            <option value="28">28% (Luxury)</option>
          </select>
        </label>

        <label>
          Reorder Alert Level (Min Stock)
          <input
            type="number"
            min="0"
            value={f.min_stock}
            onChange={(e) => setF({ ...f, min_stock: e.target.value })}
          />
        </label>

        {!isEdit && (
          <label>
            Opening Stock Quantity
            <input
              type="number"
              min="0"
              value={f.opening_qty}
              onChange={(e) => setF({ ...f, opening_qty: e.target.value })}
            />
          </label>
        )}

        <label>
          Batch Expiry Date
          <input
            type="date"
            value={f.expiry_date}
            onChange={(e) => setF({ ...f, expiry_date: e.target.value })}
          />
        </label>

        {err && <div className="alert full">{err}</div>}

        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StockAdjustModal({ product, onClose, onSaved }) {
  const [newQty, setNewQty] = useState(product.qty);
  const [reason, setReason] = useState('Physical Stock Audit Correction');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newQty === '' || Number(newQty) < 0) {
      return setErr('Enter a valid non-negative quantity.');
    }
    setBusy(true);
    setErr('');
    try {
      await api('/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          new_qty: Number(newQty),
          reason
        })
      });
      onSaved();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={`Stock Adjustment · ${product.name}`} onClose={onClose} maxWidth="480px">
      <form onSubmit={handleSubmit} className="fgrid">
        <div className="full" style={{ background: '#E9EFE8', padding: '12px', fontSize: '13px' }}>
          Current Recorded Stock: <b>{product.qty} {product.unit}</b>
        </div>

        <label className="full">
          Counted Physical Quantity *
          <input
            type="number"
            min="0"
            step="any"
            required
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
          />
        </label>

        <label className="full">
          Adjustment Reason
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Physical Stock Audit Correction">Physical Stock Audit Correction</option>
            <option value="Damaged Stock Written-off">Damaged Stock Written-off</option>
            <option value="Expired Batch Removed">Expired Batch Removed</option>
            <option value="Supplier Return Adjustment">Supplier Return Adjustment</option>
            <option value="Packaging Breakage">Packaging Breakage</option>
          </select>
        </label>

        {err && <div className="alert full">{err}</div>}

        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
