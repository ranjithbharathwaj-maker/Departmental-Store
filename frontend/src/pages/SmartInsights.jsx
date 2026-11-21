import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { inr } from '../utils/helpers.js';
import { useToast } from '../components/Toast.jsx';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Boxes,
  ArrowRight
} from 'lucide-react';

export default function SmartInsights() {
  const nav = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = () => {
    setLoading(true);
    api('/insights')
      .then((d) => setData(d))
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div>
      <div className="bar">
        <div>
          <h2><Sparkles size={20} style={{ color: '#D5BD91', verticalAlign: 'middle', marginRight: '8px' }} />Smart Retail Intelligence Engine</h2>
          <p className="sub" style={{ margin: 0 }}>
            Automated expiry radar, dead stock detection, profit intelligence & auto-reorder recommendations
          </p>
        </div>
        <button type="button" className="ghost sm" onClick={loadInsights}>
          Recalculate Insights
        </button>
      </div>

      {loading && !data && <p>Analyzing catalog and sales telemetry…</p>}

      {data && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* 1. EXPIRY RADAR */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Clock size={16} style={{ color: '#b7634e', marginRight: '6px' }} />
                Expiry Radar · Batch Risk Monitor
              </h3>
              <span className="pill low">{data.expiry_radar.total_at_risk} Batches at Risk</span>
            </div>
            <p className="sub" style={{ marginBottom: '12px' }}>
              Batches nearing shelf-life expiration in Chennai weather. Recommended: Discount clearance or vendor return.
            </p>

            <div className="tw" style={{ border: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Item</th>
                    <th>Batch #</th>
                    <th>Stock Qty</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                    <th>Risk Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expiry_radar.expired.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td><code>{p.batch_no}</code></td>
                      <td>{p.qty} {p.unit}</td>
                      <td><span style={{ color: '#8a3b2c', fontWeight: 600 }}>{p.expiry_date}</span></td>
                      <td>0 days</td>
                      <td><span className="pill low">EXPIRED</span></td>
                    </tr>
                  ))}
                  {data.expiry_radar.urgent.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td><code>{p.batch_no}</code></td>
                      <td>{p.qty} {p.unit}</td>
                      <td>{p.expiry_date}</td>
                      <td><b>{p.days_left} days</b></td>
                      <td><span className="pill low">URGENT (&lt;7d)</span></td>
                    </tr>
                  ))}
                  {data.expiry_radar.upcoming.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td><code>{p.batch_no}</code></td>
                      <td>{p.qty} {p.unit}</td>
                      <td>{p.expiry_date}</td>
                      <td>{p.days_left} days</td>
                      <td><span className="pill">Attention (&lt;30d)</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. SMART REORDER SUGGESTIONS */}
          <div className="card">
            <div className="card-header">
              <h3>
                <ShoppingCart size={16} style={{ color: '#496751', marginRight: '6px' }} />
                Smart Reorder Recommendations
              </h3>
              <span className="pill">{data.reorder_suggestions.length} Items Below Min Stock</span>
            </div>
            <p className="sub" style={{ marginBottom: '12px' }}>
              Algorithmically calculated replenishment based on 30-day sales rate and current stock levels.
            </p>

            <div className="tw" style={{ border: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>30-Day Velocity</th>
                    <th>Suggested Reorder</th>
                    <th>Estimated PO Cost</th>
                    <th className="ra">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reorder_suggestions.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td>{p.category}</td>
                      <td><span className="pill low">{p.current_stock} {p.unit}</span></td>
                      <td>{p.min_stock} {p.unit}</td>
                      <td>{p.sold_last_30d} units/mo</td>
                      <td><b>+{p.suggested_qty} {p.unit}</b></td>
                      <td>{inr(p.estimated_cost)}</td>
                      <td className="ra">
                        <button type="button" onClick={() => nav('/purchases')}>
                          Create PO <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. DEAD STOCK DETECTION */}
          <div className="card">
            <div className="card-header">
              <h3>
                <TrendingDown size={16} style={{ color: '#8a7a52', marginRight: '6px' }} />
                Dead Stock Detection
              </h3>
              <span className="pill">{data.dead_stock.length} Slow Movers</span>
            </div>
            <p className="sub" style={{ marginBottom: '12px' }}>
              Products with high capital tied up that recorded 0 transactions over the past 30 days.
            </p>

            <div className="tw" style={{ border: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Item</th>
                    <th>Category</th>
                    <th>Unsold Quantity</th>
                    <th>Tied-up Capital</th>
                    <th>Dormancy Period</th>
                    <th>Suggested Tactic</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dead_stock.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.name}</b></td>
                      <td>{p.category}</td>
                      <td>{p.qty} {p.unit}</td>
                      <td><b>{inr(p.tied_capital)}</b></td>
                      <td>35+ Days</td>
                      <td>
                        <span className="pill">Bundle with high velocity items or 15% discount</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. PROFIT INTELLIGENCE & MARGIN ANALYSIS */}
          <div className="dash-grid-2">
            <div className="card">
              <div className="card-header">
                <h3>
                  <TrendingUp size={16} style={{ color: '#496751', marginRight: '6px' }} />
                  Highest Gross Margin Products
                </h3>
              </div>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Selling Price</th>
                      <th>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.profit_intelligence.highest_margin.map((p) => (
                      <tr key={p.id}>
                        <td><b>{p.name}</b></td>
                        <td>{inr(p.selling_price)}</td>
                        <td><b style={{ color: '#496751' }}>{p.margin_pct}% ({inr(p.margin)})</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Stock Loss & Shrinkage Tracker</h3>
              </div>
              <div style={{ marginBottom: '10px' }}>
                Total Recorded Loss Value: <b>{inr(data.stock_losses.total_value)}</b>
              </div>
              <div className="tw" style={{ border: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Reason</th>
                      <th>Lost Qty</th>
                      <th>Loss Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stock_losses.items.slice(0, 5).map((l, i) => (
                      <tr key={i}>
                        <td><b>{l.product}</b></td>
                        <td>{l.reason}</td>
                        <td>{l.lost_qty}</td>
                        <td style={{ color: '#8a3b2c' }}>{inr(l.loss_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
