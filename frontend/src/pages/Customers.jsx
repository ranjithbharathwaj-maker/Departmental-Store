import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDateTime } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { Users, Plus, Phone, Mail, Sparkles, ShoppingBag, Search } from 'lucide-react';

export default function Customers() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [form, setForm] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api('/customers'), api('/sales?size=200')])
      .then(([c, s]) => {
        setCustomers(c || []);
        setSales(s.items || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = customers.filter((c) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.mobile && c.mobile.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const totalPoints = customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0);

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Customer Profiles & Loyalty Club</h2>
          <p className="sub" style={{ margin: 0 }}>
            Track regular Chennai shoppers, loyalty rewards & lifetime customer spend
          </p>
        </div>
        <button type="button" className="btn sm" onClick={() => setForm({})}>
          <Plus size={15} style={{ marginRight: '6px' }} /> + Add Customer
        </button>
      </div>

      <div className="kpis" style={{ marginBottom: '16px' }}>
        <button type="button">
          <small>Total Registered Shoppers</small>
          <b>{customers.length} Members</b>
          <span className="kpi-hint green">Royal Mart loyalty program</span>
        </button>
        <button type="button">
          <small>Active Loyalty Points In Circulation</small>
          <b>{totalPoints.toLocaleString('en-IN')} Pts</b>
          <span className="kpi-hint">1 point per ₹100 spent</span>
        </button>
      </div>

      <div className="tools">
        <input
          placeholder="Search customer by name, mobile number or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Loyalty Points</th>
              <th>Lifetime Spend</th>
              <th>Store Visits</th>
              <th className="ra">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td>
                <td><code>{c.mobile || '—'}</code></td>
                <td>{c.email || '—'}</td>
                <td>
                  <span className="pill" style={{ background: '#F7F6F0', border: '1px solid #D5BD91' }}>
                    <Sparkles size={11} style={{ marginRight: '4px', color: '#D5BD91' }} />
                    {c.loyalty_points} Pts
                  </span>
                </td>
                <td><b>{inr(c.total_spent)}</b></td>
                <td>{c.visits || 0} visits</td>
                <td className="ra">
                  <button
                    type="button"
                    onClick={() => setProfileTarget(c)}
                    style={{ marginRight: '8px' }}
                  >
                    History
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(c)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {form && (
        <CustomerFormModal
          customer={form.id ? form : null}
          onClose={() => setForm(null)}
          onSaved={(msg) => {
            setForm(null);
            addToast(msg, 'success');
            loadData();
          }}
        />
      )}

      {/* Profile & History Modal */}
      {profileTarget && (
        <CustomerProfileModal
          customer={profileTarget}
          sales={sales.filter((s) => s.customer_id === profileTarget.id || s.customer_mobile === profileTarget.mobile)}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>
  );
}

function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEdit = Boolean(customer);
  const [f, setF] = useState(
    customer
      ? { ...customer }
      : { name: '', mobile: '', email: '', loyalty_points: 0 }
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Customer name is required.');
    setBusy(true);
    setErr('');
    try {
      if (isEdit) {
        await api(`/customers/${customer.id}`, { method: 'PUT', body: JSON.stringify(f) });
        onSaved(`Customer "${f.name}" profile updated.`);
      } else {
        await api('/customers', { method: 'POST', body: JSON.stringify(f) });
        onSaved(`Customer "${f.name}" enrolled into Royal Mart Loyalty Club.`);
      }
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit Customer · ${customer.name}` : 'Enroll New Customer'} onClose={onClose} maxWidth="480px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Customer Full Name *
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="e.g. Rajesh Kumar"
          />
        </label>
        <label className="full">
          Mobile Number (10 digits)
          <input
            value={f.mobile}
            onChange={(e) => setF({ ...f, mobile: e.target.value })}
            placeholder="9840112341"
          />
        </label>
        <label className="full">
          Email Address
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            placeholder="rajesh.k@gmail.com"
          />
        </label>
        <label className="full">
          Opening Loyalty Points
          <input
            type="number"
            value={f.loyalty_points}
            onChange={(e) => setF({ ...f, loyalty_points: e.target.value })}
          />
        </label>
        {err && <div className="alert full">{err}</div>}
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Update Customer' : 'Enroll Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CustomerProfileModal({ customer, sales, onClose }) {
  return (
    <Modal title={`Customer Profile · ${customer.name}`} onClose={onClose} maxWidth="560px">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#E9EFE8', padding: '12px', fontSize: '12px', marginBottom: '12px' }}>
        <div>Mobile: <b>{customer.mobile || '—'}</b></div>
        <div>Email: <b>{customer.email || '—'}</b></div>
        <div>Loyalty Points: <b>{customer.loyalty_points}</b></div>
        <div>Lifetime Spend: <b>{inr(customer.total_spent)}</b></div>
      </div>

      <h4>Recent Purchase Invoices ({sales.length})</h4>
      {sales.length > 0 ? (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Total Bill</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.invoice_no}</b></td>
                  <td>{formatDateTime(s.created_at)}</td>
                  <td>{inr(s.total)}</td>
                  <td>{s.items?.length || 1} item(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No past invoices found for this shopper yet.</p>
      )}

      <div className="acts" style={{ marginTop: '14px' }}>
        <button type="button" className="ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
