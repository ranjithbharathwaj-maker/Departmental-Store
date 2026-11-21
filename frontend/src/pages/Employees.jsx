import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  UserCheck,
  Plus,
  Shield,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ROLES = [
  { id: 'owner', name: 'Store Owner', desc: 'Complete access to all modules, financial reporting & settings' },
  { id: 'manager', name: 'Store Manager', desc: 'POS, catalog, inventory, purchases, suppliers, analytics & customer management' },
  { id: 'cashier', name: 'Cashier / Billing Staff', desc: 'POS checkout billing, customer registration & invoice lookup' },
  { id: 'inventory', name: 'Inventory Manager', desc: 'Stock audit, adjustments, purchase orders, vendor GRN & damage write-offs' },
  { id: 'accountant', name: 'Accountant', desc: 'Finance ledgers, P&L statements, supplier payments & tax reports' }
];

export default function Employees() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [form, setForm] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api('/employees'), api('/sales?size=200')])
      .then(([emp, s]) => {
        setEmployees(emp || []);
        setSales(s.items || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cashier shift activity breakdown
  const cashierStats = {};
  for (const s of sales) {
    const c = s.cashier || 'Cashier';
    if (!cashierStats[c]) cashierStats[c] = { bills: 0, sales: 0 };
    cashierStats[c].bills += 1;
    cashierStats[c].sales += s.total;
  }

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Staff Roster & Role Permissions</h2>
          <p className="sub" style={{ margin: 0 }}>
            Manage store employee credentials, role-based module access & register activity
          </p>
        </div>
        <button type="button" className="btn sm" onClick={() => setForm({})}>
          <Plus size={15} style={{ marginRight: '6px' }} /> + Add Employee
        </button>
      </div>

      {/* Roster table */}
      <div className="tw" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Assigned Role</th>
              <th>Login Email</th>
              <th>Phone</th>
              <th>Permitted Modules</th>
              <th>Bills Processed</th>
              <th>Status</th>
              <th className="ra">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const stats = cashierStats[emp.name] || { bills: 0, sales: 0 };
              return (
                <tr key={emp.email}>
                  <td><b>{emp.name}</b></td>
                  <td>
                    <span className="pill" style={{ textTransform: 'capitalize' }}>
                      {emp.role}
                    </span>
                  </td>
                  <td><code>{emp.email}</code></td>
                  <td>{emp.phone || '—'}</td>
                  <td style={{ fontSize: '11px' }}>
                    {emp.permissions.includes('*') ? (
                      <b style={{ color: '#496751' }}>Full Access (*)</b>
                    ) : (
                      emp.permissions.slice(0, 3).join(', ') + (emp.permissions.length > 3 ? ` +${emp.permissions.length - 3}` : '')
                    )}
                  </td>
                  <td>{stats.bills} bills</td>
                  <td>
                    <span className="pill ok" style={{ fontSize: '10px' }}>Active</span>
                  </td>
                  <td className="ra">
                    <button type="button" onClick={() => setForm(emp)}>Edit Role</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="card">
        <h3>Role Permission Matrix</h3>
        <p className="sub" style={{ marginBottom: '16px' }}>
          Overview of module access permissions enforced in Royal Mart Demo Mode
        </p>
        <div className="tw" style={{ border: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Role Title</th>
                <th>Description</th>
                <th>Permitted Screens</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.name}</b></td>
                  <td>{r.desc}</td>
                  <td>
                    <code>{r.id === 'owner' ? '*' : r.id === 'manager' ? 'Dashboard, POS, Products, Inventory, Purchases, Sales, Reports' : r.id === 'cashier' ? 'POS Billing, Customers, Sales' : r.id === 'inventory' ? 'Inventory, Products, Purchases, Insights' : 'Finance, Reports, Sales'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {form && (
        <EmployeeModal
          employee={form.email ? form : null}
          onClose={() => setForm(null)}
          onSaved={(msg) => {
            setForm(null);
            addToast(msg, 'success');
            loadData();
          }}
        />
      )}
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [f, setF] = useState(
    employee
      ? { ...employee }
      : {
          name: '',
          email: '',
          role: 'cashier',
          phone: '',
          password: 'Demo@123'
        }
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim()) {
      return setErr('Name and Email are required.');
    }
    setBusy(true);
    setErr('');
    try {
      if (isEdit) {
        await api(`/employees/${encodeURIComponent(employee.email)}`, { method: 'PUT', body: JSON.stringify(f) });
        onSaved(`Employee "${f.name}" role updated.`);
      } else {
        await api('/employees', { method: 'POST', body: JSON.stringify(f) });
        onSaved(`Employee "${f.name}" added to store staff roster.`);
      }
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit Staff Member · ${employee.name}` : 'Add New Staff Member'} onClose={onClose} maxWidth="480px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Employee Full Name *
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="e.g. Murugan Pillai"
          />
        </label>
        <label className="full">
          Login Email Address *
          <input
            type="email"
            required
            disabled={isEdit}
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            placeholder="e.g. employee@royalmart.demo"
          />
        </label>
        <label className="full">
          Assign Role & Permissions *
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Contact Phone
          <input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            placeholder="+91 98401 00000"
          />
        </label>
        {!isEdit && (
          <label className="full">
            Initial Demo Password
            <input
              type="text"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </label>
        )}
        {err && <div className="alert full">{err}</div>}
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
