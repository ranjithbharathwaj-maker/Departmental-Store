import React from 'react';
import Modal from './Modal.jsx';
import { inr } from '../utils/helpers.js';
import { Printer } from 'lucide-react';

export default function BarcodeModal({ product, onClose }) {
  if (!product) return null;
  const barcode = product.barcode || '8901234567890';

  // Generate SVG barcode bars pseudo-representation
  const bars = [];
  for (let i = 0; i < barcode.length; i++) {
    const digit = parseInt(barcode[i], 10) || 1;
    bars.push({ width: (digit % 3) + 1.5, gap: (digit % 2) + 1.2 });
  }

  return (
    <Modal title="Barcode Label Generator" onClose={onClose} maxWidth="420px">
      <div className="barcode-label" id="printable-barcode">
        <div className="barcode-brand">ROYAL MART · CHENNAI</div>
        <div className="barcode-name">{product.name}</div>
        <div className="barcode-sku">SKU: {product.sku || 'N/A'} · Category: {product.category}</div>
        <div className="barcode-visual">
          <svg width="220" height="50" viewBox="0 0 220 50">
            {bars.map((b, idx) => (
              <rect
                key={idx}
                x={10 + idx * 14}
                y="5"
                width={b.width * 2.2}
                height="40"
                fill="#294638"
              />
            ))}
          </svg>
          <div className="barcode-numbers">{barcode}</div>
        </div>
        <div className="barcode-prices">
          <span>MRP: {inr(product.mrp || product.selling_price)}</span>
          <b>Offer: {inr(product.selling_price)}</b>
          <small>(Incl. of all taxes)</small>
        </div>
      </div>
      <div className="acts" style={{ marginTop: '16px' }}>
        <button type="button" className="ghost" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn sm" onClick={() => window.print()}>
          <Printer size={15} style={{ marginRight: '6px' }} /> Print Label
        </button>
      </div>
    </Modal>
  );
}
