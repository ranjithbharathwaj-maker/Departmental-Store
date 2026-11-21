import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { inr, formatDateTime } from '../utils/helpers.js';
import {
  TrendingUp,
  Receipt,
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShoppingCart,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const nav = useNavigate();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    setErr('');
    api(`/dashboard?days=${days}`)
      .then((d) => setData(d))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, [days]);

  // Find max value in chart points for SVG scaling
  const chartPoints = data?.chart_points || [];
  const maxSales = Math.max(...chartPoints.map((p) => p.total), 1);

  return (
    <div className="dash-container">
      <div className="bar">
        <div>
          <h2>Executive Store Dashboard</h2>
          <p className="sub" style={{ margin: 0 }}>
            Real-time analytics and inventory health for <b>Royal Mart Chennai</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={days} onChange={(e) => setDays(+e.target.value)}>
            <option value={1}>Today's Summary</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button className="btn sm" onClick={() => nav('/pos')}>
            <ShoppingCart size={15} style={{ marginRight: '6px' }} /> Open POS
          </button>
        </div>
      </div>

      {err && <div className="alert">{err}</div>}
      {loading && !data && <div className="splash">Loading store analytics…</div>}

      {data && (
        <>
          {/* Top KPI Cards */}
          <div className="kpis">
            <button type="button" onClick={() => nav('/sales')}>
              <small>Total Sales Revenue</small>
              <b>{inr(data.sales)}</b>
              <span className="kpi-hint green">
                <TrendingUp size={13} /> {data.transactions} transactions completed
              </span>
            </button>

            <button type="button" onClick={() => nav('/sales')}>
              <small>Gross Margin Profit</small>
              <b>{inr(data.gross_profit)}</b>
              <span className="kpi-hint">
                Margin: {data.sales ? Math.round((data.gross_profit / data.sales) * 100) : 0}% of net sales
              </span>
            </button>

            <button type="button" onClick={() => nav('/inventory')}>
              <small>Total Stock Valuation</small>
              <b>{inr(data.stock_value)}</b>
              <span className="kpi-hint">
                <Boxes size={13} /> Across {data.products} active catalog items
              </span>
            </button>

            <button
              type="button"
              onClick={() => nav('/inventory')}
              style={{ borderTopColor: data.low_stock > 0 ? '#b7634e' : '#496751' }}
            >
              <small>Low Stock Alerts</small>
              <b style={{ color: data.low_stock > 0 ? '#8a3b2c' : 'inherit' }}>
                {data.low_stock} Items
              </b>
              <span className="kpi-hint" style={{ color: data.low_stock > 0 ? '#8a3b2c' : 'inherit' }}>
                <AlertTriangle size={13} /> Requires supplier replenishment
              </span>
            </button>
          </div>

          {/* Quick Notice Banner if items near expiry */}
          {data.near_expiry > 0 && (
            <div className="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>
                  <b>Expiry Radar Alert:</b> {data.near_expiry} batches expiring within 30 days. Plan promotional offers or vendor returns.
                </span>
              </div>
              <button className="ghost sm" onClick={() => nav('/insights')} style={{ fontSize: '11px', padding: '4px 10px' }}>
                View Expiry Radar <ArrowUpRight size={13} />
              </button>
            </div>
          )}

          {/* Sales Trend Chart & Category Breakdown */}
          <div className="dash-grid-2">
            <div className="card">
              <div className="card-header">
                <h3>Sales Velocity Trend ({days === 1 ? 'Last 7 Days' : `Last ${days} Days`})</h3>
                <span className="mut" style={{ fontSize: '11px' }}>Daily Revenue (₹)</span>
              </div>
              <div className="chart-container">
                <div className="svg-bar-chart">
                  {chartPoints.map((pt, idx) => {
                    const heightPct = Math.max(8, Math.round((pt.total / maxSales) * 100));
                    return (
                      <div key={idx} className="chart-col">
                        <span className="chart-val">{inr(pt.total)}</span>
                        <div
                          className="chart-bar"
                          style={{ height: `${heightPct}%` }}
                          title={`${pt.label}: ${inr(pt.total)} (${pt.transactions} bills)`}
                        />
                        <span className="chart-lbl">{pt.label.split(',')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="card">
              <div className="card-header">
                <h3>Top Selling Products</h3>
                <button className="link-btn" onClick={() => nav('/reports')}>View all</button>
              </div>
              <div className="top-list">
                {data.top_products && data.top_products.length > 0 ? (
                  data.top_products.map((p, idx) => (
                    <div key={idx} className="top-item">
                      <div className="top-rank">{idx + 1}</div>
                      <div className="top-info">
                        <b>{p.name}</b>
                        <small className="mut">{p.qty} units sold in this period</small>
                      </div>
                      <div className="top-amt">{inr(p.revenue)}</div>
                    </div>
                  ))
                ) : (
                  <p className="empty" style={{ margin: '16px 0' }}>No sales recorded in selected timeframe.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Invoices & Quick Actions */}
          <div className="dash-grid-2" style={{ marginTop: '16px' }}>
            <div className="card">
              <div className="card-header">
                <h3>Recent Billing Transactions</h3>
                <button className="link-btn" onClick={() => nav('/sales')}>All sales</button>
              </div>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date / Time</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_sales && data.recent_sales.length > 0 ? (
                      data.recent_sales.map((s) => (
                        <tr key={s.id}>
                          <td><b>{s.invoice_no}</b></td>
                          <td>{formatDateTime(s.created_at)}</td>
                          <td>{s.customer_name || 'Walk-in Customer'}</td>
                          <td>{s.items?.length || 0}</td>
                          <td><b>{inr(s.total)}</b></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="empty">No recent transactions.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Smart Store Insights Snippet */}
            <div className="card">
              <div className="card-header">
                <h3><Sparkles size={16} style={{ color: '#D5BD91', verticalAlign: 'middle', marginRight: '6px' }} />Smart Insights Shortcut</h3>
                <button className="link-btn" onClick={() => nav('/insights')}>Full analysis</button>
              </div>
              <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                <div className="insight-card" onClick={() => nav('/insights')}>
                  <b>Reorder Recommendation:</b> {data.low_stock} products are below safe stock thresholds. Check supplier leads.
                </div>
                <div className="insight-card" onClick={() => nav('/insights')}>
                  <b>Profit Intelligence:</b> Average gross margin across grocery items is healthy at ~28%.
                </div>
                <div className="insight-card" onClick={() => nav('/finance')}>
                  <b>Daily Cash Register:</b> Remember to complete the end-of-day register closing report.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
