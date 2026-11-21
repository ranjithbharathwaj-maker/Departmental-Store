import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr } from '../utils/helpers.js';
import { useToast } from '../components/Toast.jsx';
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  Percent,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('store'); // 'store', 'invoice', 'tax', 'inventory', 'demo'
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = () => {
    setLoading(true);
    api('/settings')
      .then((d) => setSettings(d))
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/settings', { method: 'PUT', body: JSON.stringify(settings) });
      addToast('Settings updated successfully.', 'success');
    } catch (x) {
      addToast(x.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Are you sure you want to restore the original Royal Mart demo seed data? Any new sales, products, or adjustments will be reset to factory seed.')) {
      return;
    }
    setBusy(true);
    try {
      await api('/demo/reset', { method: 'POST' });
      addToast('Demo database restored to fresh Royal Mart seed data!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (e) {
      addToast(e.message, 'error');
      setBusy(false);
    }
  };

  if (loading || !settings) return <div className="splash">Loading store configuration…</div>;

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Store Configuration & System Settings</h2>
          <p className="sub" style={{ margin: 0 }}>
            Manage Royal Mart store profile, invoice headers, GST tax slabs & demo parameters
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`filter-pill ${tab === 'store' ? 'active' : ''}`}
          onClick={() => setTab('store')}
        >
          <Store size={14} style={{ marginRight: '6px' }} /> Store Identity
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'invoice' ? 'active' : ''}`}
          onClick={() => setTab('invoice')}
        >
          <Receipt size={14} style={{ marginRight: '6px' }} /> Invoice Print Settings
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'tax' ? 'active' : ''}`}
          onClick={() => setTab('tax')}
        >
          <Percent size={14} style={{ marginRight: '6px' }} /> GST Tax Config
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'inventory' ? 'active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          <Sliders size={14} style={{ marginRight: '6px' }} /> Inventory Preferences
        </button>
        <button
          type="button"
          className={`filter-pill ${tab === 'demo' ? 'active' : ''}`}
          onClick={() => setTab('demo')}
          style={{ borderColor: '#D5BD91' }}
        >
          <RotateCcw size={14} style={{ marginRight: '6px', color: '#D5BD91' }} /> Demo Mode Reset
        </button>
      </div>

      <div className="card">
        {tab === 'store' && (
          <form onSubmit={handleSave} className="fgrid">
            <h3>Store Profile & Regional Details</h3>
            <div className="full" />
            <label className="full">
              Store Name
              <input
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              />
            </label>
            <label className="full">
              Store Tagline / Slogan
              <input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </label>
            <label className="full">
              Physical Store Address
              <input
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </label>
            <label>
              Official Contact Phone
              <input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </label>
            <label>
              Store Email
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </label>
            <label>
              GSTIN Number
              <input
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
              />
            </label>
            <label>
              State Code
              <input
                value={settings.state_code}
                onChange={(e) => setSettings({ ...settings, state_code: e.target.value })}
              />
            </label>
            <div className="full acts" style={{ marginTop: '16px' }}>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? 'Saving…' : 'Save Store Details'}
              </button>
            </div>
          </form>
        )}

        {tab === 'invoice' && (
          <form onSubmit={handleSave} className="fgrid">
            <h3>Receipt & Thermal Invoice Templates</h3>
            <div className="full" />
            <label>
              Invoice Number Prefix
              <input
                value={settings.invoice_prefix}
                onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
              />
            </label>
            <label className="chk full">
              <input
                type="checkbox"
                checked={settings.auto_print_invoice}
                onChange={(e) => setSettings({ ...settings, auto_print_invoice: e.target.checked })}
              />
              Auto-trigger print dialog immediately upon sale completion
            </label>
            <label className="full">
              Footer Terms / Thank You Note
              <input
                value={settings.invoice_footer}
                onChange={(e) => setSettings({ ...settings, invoice_footer: e.target.value })}
              />
            </label>
            <div className="full acts" style={{ marginTop: '16px' }}>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? 'Saving…' : 'Save Invoice Configuration'}
              </button>
            </div>
          </form>
        )}

        {tab === 'tax' && (
          <form onSubmit={handleSave} className="fgrid">
            <h3>Indian GST Configuration</h3>
            <div className="full" />
            <label className="full">
              GST Scheme Type
              <select
                value={settings.tax_scheme}
                onChange={(e) => setSettings({ ...settings, tax_scheme: e.target.value })}
              >
                <option value="regular">Regular GST Scheme (B2B + B2C with ITC)</option>
                <option value="composition">Composition Scheme (Fixed turnover levy)</option>
              </select>
            </label>
            <label className="chk full">
              <input
                type="checkbox"
                checked={settings.hsn_required}
                onChange={(e) => setSettings({ ...settings, hsn_required: e.target.checked })}
              />
              Mandate HSN / SAC Codes on Invoices
            </label>
            <div className="full acts" style={{ marginTop: '16px' }}>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? 'Saving…' : 'Save Tax Configuration'}
              </button>
            </div>
          </form>
        )}

        {tab === 'inventory' && (
          <form onSubmit={handleSave} className="fgrid">
            <h3>Stock Warnings & Replenishment Rules</h3>
            <div className="full" />
            <label>
              Global Low Stock Warning Threshold (Units)
              <input
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({ ...settings, low_stock_threshold: Number(e.target.value) })}
              />
            </label>
            <label>
              Expiry Radar Warning Horizon (Days)
              <input
                type="number"
                value={settings.expiry_warning_days}
                onChange={(e) => setSettings({ ...settings, expiry_warning_days: Number(e.target.value) })}
              />
            </label>
            <label className="chk full">
              <input
                type="checkbox"
                checked={settings.enable_split_payments}
                onChange={(e) => setSettings({ ...settings, enable_split_payments: e.target.checked })}
              />
              Enable Split Payments at POS (Cash + UPI + Card)
            </label>
            <label className="chk full">
              <input
                type="checkbox"
                checked={settings.enable_loyalty_points}
                onChange={(e) => setSettings({ ...settings, enable_loyalty_points: e.target.checked })}
              />
              Enable Loyalty Points Auto-calculation
            </label>
            <div className="full acts" style={{ marginTop: '16px' }}>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? 'Saving…' : 'Save Inventory Preferences'}
              </button>
            </div>
          </form>
        )}

        {tab === 'demo' && (
          <div>
            <h3>Demo Environment & State Controls</h3>
            <p className="sub" style={{ marginBottom: '16px' }}>
              Royal Mart is currently running in <b>High-Fidelity Demo Mode</b> with localStorage persistence.
            </p>

            <div className="alert ok" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              <b>Persistence Active:</b> All products added, transactions billed, and stock adjusted will remain saved in this browser across refreshes.
            </div>

            <div style={{ background: '#FAF9F4', padding: '16px', border: '1px solid #dcded4', marginBottom: '20px' }}>
              <h4>Reset Demo Data to Initial Seed</h4>
              <p className="sub" style={{ margin: '8px 0 14px' }}>
                Accidentally deleted products or want to restart clean with the original 60 products, 32 customers, 10 suppliers, and 105 demo sales?
              </p>
              <button
                type="button"
                className="btn sm"
                style={{ background: '#8a3b2c' }}
                onClick={handleResetDemoData}
                disabled={busy}
              >
                <RotateCcw size={14} style={{ marginRight: '6px' }} />
                {busy ? 'Resetting…' : 'Restore Factory Seed Data'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
