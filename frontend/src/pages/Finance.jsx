import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, formatDate } from '../utils/helpers.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Wallet,
  Plus,
  Receipt,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

export default function Finance() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('pl'); // 'pl', 'expenses', 'closings'
  const [expenses, setExpenses] = useState([]);
  const [closings, setClosings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api('/expenses'),
      api('/finance/closings'),
      api('/sales?size=200')
    ])
      .then(([exp, close, s]) => {
        setExpenses(exp || []);
        setClosings(close || []);
        setSales(s.items || []);
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live P&L metrics
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalCogs = sales.reduce((acc, s) => acc + (s.cost_total || s.total * 0.72), 0);
  const grossProfit = totalSalesRevenue - totalCogs;
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Financial Ledger & Store Accounting</h2>
          <p className="sub" style={{ margin: 0 }}>
            Profit & Loss statements, operating expense vouchers & daily cash register closing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="ghost" onClick={() => setShowExpenseModal(true)}>
            <Plus size={14} style={{ marginRight: '6px' }} /> Record Expense
          </button>
          <button type="button" className="btn sm" onClick={() => setShowClosingModal(true)}>
            <Receipt size={14} style={{ marginRight: '6px' }} /> Daily Cash Closing
          </button>
        </div>
      </div>

      {/* Top Level Financial Health Cards */}
      <div className="kpis" style={{ marginBottom: '16px' }}>
        <button type="button">
          <small>Total Sales Revenue</small>
          <b>{inr(totalSalesRevenue)}</b>
          <span className="kpi-hint green"><ArrowUpRight size={13} /> Gross Store Inflow</span>
        </button>
        <button type="button">
          <small>Cost of Goods (COGS)</small>
          <b>{inr(totalCogs)}</b>
          <span className="kpi-hint">Wholesale cost of sold inventory</span>
        </button>
        <button type="button">
          <small>Operating Expenses</small>
          <b>{inr(totalOperatingExpenses)}</b>
          <span className="kpi-hint"><ArrowDownRight size={13} /> Rent, power, payroll, supplies</span>
        </button>
        <button type="button" style={{ borderTopColor: netProfit >= 0 ? '#496751' : '#b7634e' }}>
          <small>Estimated Net Profit</small>
          <b style={{ color: netProfit >= 0 ? '#496751' : '#8a3b2c' }}>{inr(netProfit)}</b>
          <span className="kpi-hint">Net Margin: {totalSalesRevenue ? Math.round((netProfit / totalSalesRevenue) * 100) : 0}%</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          className={`filter-pill ${tab === 'pl' ? 'active' : ''}`}
          onClick={() => setTab('pl')}
        >
          Profit & Loss Statement
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'expenses' ? 'active' : ''}`}
          onClick={() => setTab('expenses')}
        >
          Expense Vouchers ({expenses.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'closings' ? 'active' : ''}`}
          onClick={() => setTab('closings')}
        >
          Register Closings ({closings.length})
        </button>
      </div>

      {tab === 'pl' && (
        <div className="card">
          <div className="card-header">
            <h3>Year-to-Date Store Profit & Loss (P&L) Statement</h3>
            <span className="mut" style={{ fontSize: '11px' }}>Royal Mart Chennai</span>
          </div>
          <div className="tw" style={{ border: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Financial Component</th>
                  <th>Description / Breakdown</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>1. Total Sales Revenue</b></td>
                  <td>Sum of all completed customer POS billing invoices</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{inr(totalSalesRevenue)}</td>
                </tr>
                <tr>
                  <td><b>2. Cost of Goods Sold (COGS)</b></td>
                  <td>Direct supplier purchase cost of merchandise sold</td>
                  <td style={{ textAlign: 'right', color: '#8a3b2c' }}>−{inr(totalCogs)}</td>
                </tr>
                <tr style={{ background: '#E9EFE8' }}>
                  <td><b>3. Gross Trading Margin (1 − 2)</b></td>
                  <td>Store product markup profit ({Math.round((grossProfit / (totalSalesRevenue || 1)) * 100)}% Gross Margin)</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#294638' }}>{inr(grossProfit)}</td>
                </tr>
                <tr>
                  <td><b>4. Operating Overhead Expenses</b></td>
                  <td>Rent, electricity, wages, freight, packaging, maintenance</td>
                  <td style={{ textAlign: 'right', color: '#8a3b2c' }}>−{inr(totalOperatingExpenses)}</td>
                </tr>
                <tr style={{ background: '#FAF9F4', fontSize: '15px' }}>
                  <td><b>5. Estimated Net Store Profit (3 − 4)</b></td>
                  <td>Net bottom-line earnings retained after all expenses</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: netProfit >= 0 ? '#496751' : '#8a3b2c' }}>
                    {inr(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Reference</th>
                <th>Approved By</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td><b>{e.category}</b></td>
                  <td>{e.description}</td>
                  <td><span className="pill">{e.payment_mode.toUpperCase()}</span></td>
                  <td><code>{e.reference}</code></td>
                  <td>{e.approved_by || 'Store Manager'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{inr(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'closings' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Closing Date</th>
                <th>Cashier</th>
                <th>Opening Float</th>
                <th>Cash Collected</th>
                <th>Cash Expenses</th>
                <th>Expected Drawer Cash</th>
                <th>Counted Cash</th>
                <th>Discrepancy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {closings.map((c) => (
                <tr key={c.id}>
                  <td>{formatDate(c.date)}</td>
                  <td><b>{c.cashier}</b></td>
                  <td>{inr(c.opening_cash)}</td>
                  <td>{inr(c.cash_sales)}</td>
                  <td>{inr(c.cash_expenses)}</td>
                  <td>{inr(c.expected_cash)}</td>
                  <td><b>{inr(c.counted_cash)}</b></td>
                  <td style={{ color: c.difference === 0 ? '#496751' : '#8a3b2c', fontWeight: 600 }}>
                    {c.difference > 0 ? `+${inr(c.difference)}` : inr(c.difference)}
                  </td>
                  <td>
                    <span className={`pill ${c.status === 'balanced' ? 'ok' : 'low'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onDone={(msg) => {
            setShowExpenseModal(false);
            addToast(msg, 'success');
            loadData();
          }}
        />
      )}

      {/* Daily Cash Closing Modal */}
      {showClosingModal && (
        <DailyClosingModal
          onClose={() => setShowClosingModal(false)}
          onDone={(msg) => {
            setShowClosingModal(false);
            addToast(msg, 'success');
            loadData();
          }}
        />
      )}
    </div>
  );
}

function ExpenseModal({ onClose, onDone }) {
  const [category, setCategory] = useState('Store Rent');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Enter valid expense amount.');
    setBusy(true);
    try {
      await api('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category,
          description: desc,
          amount: Number(amount),
          payment_mode: mode
        })
      });
      onDone('Expense voucher recorded successfully.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Record Operating Expense" onClose={onClose} maxWidth="460px">
      <form onSubmit={submit} className="fgrid">
        <label className="full">
          Expense Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Store Rent">Store Building Rent</option>
            <option value="Electricity">Electricity / TNEB Utility</option>
            <option value="Staff Salaries">Staff Salaries & Wages</option>
            <option value="Logistics & Freight">Transport & Freight</option>
            <option value="Packaging & Bags">Packaging Materials & Bags</option>
            <option value="Store Sanitation">Pest Control & Sanitation</option>
            <option value="Internet & IT">Broadband & IT Software</option>
            <option value="Equipment Maintenance">Chiller / Machine Repair</option>
            <option value="Printing & Rolls">Thermal Receipt Rolls</option>
            <option value="Miscellaneous">Miscellaneous Store Expense</option>
          </select>
        </label>
        <label className="full">
          Expense Amount (₹) *
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="full">
          Payment Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="cash">Store Register Cash</option>
            <option value="upi">UPI / GPay</option>
            <option value="bank_transfer">Bank Transfer / NEFT</option>
            <option value="card">Company Debit Card</option>
          </select>
        </label>
        <label className="full">
          Voucher Remarks / Notes
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Monthly commercial rent for T. Nagar branch"
          />
        </label>
        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Record Expense</button>
        </div>
      </form>
    </Modal>
  );
}

function DailyClosingModal({ onClose, onDone }) {
  const [opening, setOpening] = useState(2000);
  const [salesCash, setSalesCash] = useState(14800);
  const [expensesCash, setExpensesCash] = useState(1200);
  const [counted, setCounted] = useState(15600);
  const [notes, setNotes] = useState('Register closed cleanly.');
  const [busy, setBusy] = useState(false);

  const expected = opening + salesCash - expensesCash;
  const diff = counted - expected;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/finance/closings', {
        method: 'POST',
        body: JSON.stringify({
          opening_cash: Number(opening),
          cash_sales: Number(salesCash),
          cash_expenses: Number(expensesCash),
          expected_cash: expected,
          counted_cash: Number(counted),
          difference: diff,
          notes
        })
      });
      onDone('Daily register closing submitted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="End-of-Day Cash Register Closing" onClose={onClose} maxWidth="480px">
      <form onSubmit={submit} className="fgrid">
        <label>
          Opening Float Cash (₹)
          <input
            type="number"
            value={opening}
            onChange={(e) => setOpening(Number(e.target.value))}
          />
        </label>
        <label>
          Total Cash Sales Tendered (₹)
          <input
            type="number"
            value={salesCash}
            onChange={(e) => setSalesCash(Number(e.target.value))}
          />
        </label>
        <label>
          Cash Paid-out for Expenses (₹)
          <input
            type="number"
            value={expensesCash}
            onChange={(e) => setExpensesCash(Number(e.target.value))}
          />
        </label>
        <label>
          Actual Physical Cash Counted (₹) *
          <input
            type="number"
            required
            value={counted}
            onChange={(e) => setCounted(Number(e.target.value))}
          />
        </label>

        <div className="full" style={{ background: '#E9EFE8', padding: '12px', fontSize: '13px' }}>
          <div>Expected Drawer Cash: <b>{inr(expected)}</b></div>
          <div style={{ color: diff === 0 ? '#496751' : '#8a3b2c', marginTop: '4px' }}>
            Cash Discrepancy: <b>{diff === 0 ? 'Balanced (₹0)' : inr(diff)}</b>
          </div>
        </div>

        <label className="full">
          Shift Closing Remarks
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="full acts">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Submit Daily Closing</button>
        </div>
      </form>
    </Modal>
  );
}
