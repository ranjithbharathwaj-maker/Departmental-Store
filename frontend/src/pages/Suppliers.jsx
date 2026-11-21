import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDate } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { Truck, Plus, Phone, Mail, MapPin, Receipt, Search } from 'lucide-react';

export default function Suppliers() {
  const { addToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [form, setForm] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const loadSuppliers = () => {
    setLoading(true);
    Promise.all([api('/suppliers'), api('/purchases')])
      .then(([sup, pur]) => {
        setSuppliers(sup || []);
        setPurchases(pur || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filtered = suppliers.filter((s) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(term)) ||
      (s.gstin && s.gstin.toLowerCase().includes(term)) ||
      (s.category && s.category.toLowerCase().includes(term))
    );
  });

  const totalOutstanding = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Supplier Directory & Vendor Ledgers</h2>
          <p className="sub" style={{ margin: 0 }}>
            Track wholesale distributor contacts, GSTIN numbers & payable balances
          </p>
        </div>
        <button type="button" className="btn sm" onClick={() => setForm({})}>
          <Plus size={15} style={{ marginRight: '6px' }} /> + Add Supplier
        </button>
      </div>

      {/* Summary KPI */}
      <div className="kpis" style={{ marginBottom: '16px' }}>
        <button type="button">
          <small>Total Outstanding Vendor Payables</small>
          <b>{inr(totalOutstanding)}</b>
          <span className="kpi-hint">Across {suppliers.length} active suppliers</span>
        </button>
      </div>

      <div className="tools">
        <input
          placeholder="Search supplier name, contact person, category or GSTIN…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Category</th>
              <th>GSTIN</th>
              <th>Contact Info</th>
              <th>Outstanding Balance</th>
              <th className="ra">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.name}</b>
                  <div className="mut" style={{ fontSize: '11px' }}>{s.address}</div>
                </td>
                <td>{s.contact_person || '—'}</td>
                <td>{s.category}</td>
                <td><code>{s.gstin || '33AAAAA...'}</code></td>
                <td>
                  <div>{s.phone}</div>
                  <div className="mut" style={{ fontSize: '11px' }}>{s.email}</div>
                </td>
                <td>
                  <b style={{ color: s.balance > 0 ? '#8a3b2c' : '#496751' }}>
                    {inr(s.balance)}
                  </b>
                </td>
                <td className="ra">
                  <button
                    type="button"
                    onClick={() => setHistoryTarget(s)}
                    style={{ marginRight: '8px' }}
                  >
                    PO History
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(s)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Supplier Modal */}
      {form && (
        <SupplierFormModal
          supplier={form.id ? form : null}
          onClose={() => setForm(null)}
          onSaved={(msg) => {
            setForm(null);
            addToast(msg, 'success');
            loadSuppliers();
          }}
        />
      )}

      {/* PO History Modal */}
      {historyTarget && (
        <SupplierHistoryModal
          supplier={historyTarget}
          purchases={purchases.filter((p) => p.supplier_id === historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}

function SupplierFormModal({ supplier, onClose, onSaved }) {
  const isEdit = Boolean(supplier);
  const [f, setF] = useState(
    supplier
      ? { ...supplier }
      : {
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          gstin: '',
          address: '',
          category: 'Groceries',
          opening_balance: 0
        }
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return alert('Supplier name is required.');
    setBusy(true);
    try {
      if (isEdit) {
        await api(`/suppliers/${supplier.id}`, { method: 'PUT', body: JSON.stringify(f) });
        onSaved(`Supplier "${f.name}" updated successfully.`);
      } else {
        await api('/suppliers', { method: 'POST', body: JSON.stringify(f) });
        onSaved(`Supplier "${f.name}" added to vendor directory.`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit Supplier · ${supplier.name}` : 'Add New Supplier'} onClose={onClose} maxWidth="500px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Supplier Business Name *
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="e.g. Chennai Mega Traders"
          />
        </label>
        <label>
          Contact Person
          <input
            value={f.contact_person}
            onChange={(e) => setF({ ...f, contact_person: e.target.value })}
            placeholder="e.g. S. Ramanathan"
          />
        </label>
        <label>
          Phone Number
          <input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            placeholder="+91 98410 00000"
          />
        </label>
        <label>
          Email Address
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            placeholder="orders@vendor.com"
          />
        </label>
        <label>
          GSTIN Number
          <input
            value={f.gstin}
            onChange={(e) => setF({ ...f, gstin: e.target.value })}
            placeholder="33AAACM1234F1Z1"
          />
        </label>
        <label className="full">
          Warehouse Address
          <input
            value={f.address}
            onChange={(e) => setF({ ...f, address: e.target.value })}
            placeholder="12, Koyambedu Market, Chennai"
          />
        </label>
        {!isEdit && (
          <label className="full">
            Opening Payable Balance (₹)
            <input
              type="number"
              value={f.opening_balance}
              onChange={(e) => setF({ ...f, opening_balance: e.target.value })}
            />
          </label>
        )}
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Update Supplier' : 'Save Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SupplierHistoryModal({ supplier, purchases, onClose }) {
  return (
    <Modal title={`Purchase History · ${supplier.name}`} onClose={onClose} maxWidth="600px">
      <div style={{ marginBottom: '12px', fontSize: '13px' }}>
        Current Balance Owed: <b>{inr(supplier.balance)}</b> · GSTIN: <code>{supplier.gstin}</code>
      </div>
      {purchases.length > 0 ? (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Date</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td><b>{p.po_no}</b></td>
                  <td>{formatDate(p.date)}</td>
                  <td>{inr(p.total)}</td>
                  <td><span className="pill">{p.status}</span></td>
                  <td><span className="pill">{p.payment_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No past purchase orders recorded with this supplier yet.</p>
      )}
      <div className="acts" style={{ marginTop: '14px' }}>
        <button type="button" className="ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
