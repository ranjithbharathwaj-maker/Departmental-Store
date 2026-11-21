import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { inr, exportToCSV } from '../utils/helpers.js';
import { useToast } from '../components/Toast.jsx';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  Filter,
  RefreshCw
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'daily_sales', label: 'Daily Sales & Margin Report' },
  { id: 'product_sales', label: 'Product Sales Performance' },
  { id: 'category_sales', label: 'Category Sales Distribution' },
  { id: 'inventory_valuation', label: 'Stock Valuation & Status' },
  { id: 'profit_and_loss', label: 'Profit & Loss Statement' },
  { id: 'employee_sales', label: 'Cashier Register Performance' }
];

export default function Reports() {
  const { addToast } = useToast();
  const [type, setType] = useState('daily_sales');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = () => {
    setLoading(true);
    api(`/reports?type=${type}`)
      .then((d) => setReport(d))
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, [type]);

  const handleExportCSV = () => {
    if (!report || !report.rows || !report.rows.length) {
      return addToast('No data available to export.', 'info');
    }
    exportToCSV(`RoyalMart_${type}_${new Date().toISOString().slice(0, 10)}.csv`, report.rows);
    addToast(`${report.title} exported to CSV successfully.`, 'success');
  };

  const currentDef = REPORT_TYPES.find((r) => r.id === type);

  return (
    <div>
      <div className="bar">
        <div>
          <h2>Analytics & Financial Reports</h2>
          <p className="sub" style={{ margin: 0 }}>
            Generate executive store summaries, category distributions & exportable tax reports
          </p>
        </div>
        <button type="button" className="btn sm" onClick={handleExportCSV}>
          <Download size={14} style={{ marginRight: '6px' }} /> Download CSV
        </button>
      </div>

      {/* Report Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`filter-pill ${type === r.id ? 'active' : ''}`}
            onClick={() => setType(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && !report && <p>Generating report figures…</p>}

      {report && (
        <div className="card">
          <div className="card-header">
            <h3>{report.title}</h3>
            <button className="ghost sm" onClick={loadReport}>
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> Refresh
            </button>
          </div>

          {report.rows && report.rows.length > 0 ? (
            <div className="tw" style={{ border: 0, marginTop: '12px' }}>
              <table>
                <thead>
                  <tr>
                    {Object.keys(report.rows[0]).map((col) => (
                      <th key={col} style={{ textTransform: 'capitalize' }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((k) => {
                        const val = row[k];
                        const isMoney = typeof val === 'number' && (k.includes('price') || k.includes('cost') || k.includes('revenue') || k.includes('total') || k.includes('amount') || k.includes('profit') || k.includes('tax') || k.includes('discount') || k.includes('subtotal') || k.includes('sales'));
                        return (
                          <td key={k}>
                            {isMoney ? inr(val) : String(val ?? '—')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">No records found for this report configuration.</p>
          )}
        </div>
      )}
    </div>
  );
}
