// Royal Mart Demo Mode Storage & Business Operations Engine
import {
  STORE_INFO,
  DEMO_ACCOUNTS,
  CATEGORIES,
  SUPPLIERS,
  PRODUCTS,
  CUSTOMERS,
  generateSeedSales,
  PURCHASES,
  STOCK_MOVEMENTS,
  EXPENSES,
  CASH_REGISTER_CLOSINGS,
  SETTINGS_DEFAULT
} from './seedData.js';

const STORAGE_KEY = 'royalmart_demo_data_v1';

function getInitialState() {
  const seedSales = generateSeedSales();
  return {
    store: { ...STORE_INFO },
    accounts: [...DEMO_ACCOUNTS],
    categories: [...CATEGORIES],
    suppliers: [...SUPPLIERS],
    products: [...PRODUCTS],
    customers: [...CUSTOMERS],
    sales: seedSales,
    purchases: [...PURCHASES],
    stock_movements: [...STOCK_MOVEMENTS],
    expenses: [...EXPENSES],
    closings: [...CASH_REGISTER_CLOSINGS],
    settings: { ...SETTINGS_DEFAULT },
    invoice_seq: 1000 + seedSales.length + 1,
    po_seq: 15,
    grn_seq: 12
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.products || parsed.products.length < 5) {
      const initial = getInitialState();
      saveData(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse demo data from localStorage, resetting to seed', err);
    const initial = getInitialState();
    saveData(initial);
    return initial;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function resetDemoData() {
  const fresh = getInitialState();
  saveData(fresh);
  return fresh;
}

// ======================== AUTHENTICATION ========================
export function demoLogin(email, password) {
  const data = loadData();
  const cleanEmail = email.trim().toLowerCase();
  const acc = data.accounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (!acc) {
    throw new Error('Incorrect email address.');
  }
  if (acc.password !== password) {
    throw new Error('Incorrect password. For demo accounts use: Demo@123 (or Owner@123)');
  }
  const token = 'demo-jwt-token-' + btoa(acc.email) + '-' + Date.now();
  return {
    token,
    user: {
      email: acc.email,
      name: acc.name,
      role: acc.role,
      phone: acc.phone,
      store: data.store.name,
      permissions: acc.permissions,
      home: acc.home
    }
  };
}

export function demoGetCurrentUser(token) {
  const data = loadData();
  if (!token) return null;
  // try to decode email from token
  try {
    const parts = token.split('-');
    if (parts.length >= 4) {
      const email = atob(parts[3]);
      const acc = data.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (acc) {
        return {
          email: acc.email,
          name: acc.name,
          role: acc.role,
          phone: acc.phone,
          store: data.store.name,
          permissions: acc.permissions,
          home: acc.home
        };
      }
    }
  } catch {
    // fallback
  }
  // Default to owner account if valid token format
  const fallback = data.accounts[0];
  return {
    email: fallback.email,
    name: fallback.name,
    role: fallback.role,
    phone: fallback.phone,
    store: data.store.name,
    permissions: fallback.permissions,
    home: fallback.home
  };
}

// ======================== PRODUCTS ========================
export function getProducts({ q = '', category = '', sort = 'name', page = 1, size = 10, archived = false } = {}) {
  const data = loadData();
  let list = data.products.filter(p => (archived ? !p.is_active : p.is_active));
  
  if (category) {
    list = list.filter(p => p.category === category);
  }
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.barcode && p.barcode.includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.brand && p.brand.toLowerCase().includes(term))
    );
  }

  // Sort
  if (sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'price') {
    list.sort((a, b) => a.selling_price - b.selling_price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.selling_price - a.selling_price);
  } else if (sort === 'stock') {
    list.sort((a, b) => a.qty - b.qty);
  } else if (sort === 'stock_desc') {
    list.sort((a, b) => b.qty - a.qty);
  }

  const total = list.length;
  const start = (page - 1) * size;
  const items = list.slice(start, start + size);
  return { items, total, page, size };
}

export function createProduct(prodData, userName = 'Store Owner') {
  const data = loadData();
  // check barcode unique
  if (prodData.barcode && data.products.some(p => p.barcode === prodData.barcode && p.is_active)) {
    throw new Error(`A product with barcode "${prodData.barcode}" already exists.`);
  }

  const id = 'prod-' + Date.now().toString().slice(-6);
  const newProduct = {
    id,
    name: prodData.name.trim(),
    barcode: prodData.barcode ? prodData.barcode.trim() : ('890' + Math.floor(1000000000 + Math.random() * 9000000000)),
    sku: prodData.sku ? prodData.sku.trim() : ('SKU-' + Date.now().toString().slice(-4)),
    category: prodData.category || 'Groceries',
    brand: prodData.brand || 'Royal Mart',
    unit: prodData.unit || 'piece',
    purchase_price: Number(prodData.purchase_price) || 0,
    selling_price: Number(prodData.selling_price) || 0,
    mrp: Number(prodData.mrp) || Number(prodData.selling_price) || 0,
    gst: Number(prodData.gst) || 0,
    qty: Number(prodData.opening_qty) || 0,
    min_stock: Number(prodData.min_stock) || 5,
    expiry_date: prodData.expiry_date || '2028-12-31',
    batch_no: prodData.batch_no || ('B-' + new Date().getFullYear()),
    supplier_id: prodData.supplier_id || (data.suppliers[0]?.id || 'sup-001'),
    is_active: true
  };

  data.products.unshift(newProduct);

  if (newProduct.qty > 0) {
    data.stock_movements.unshift({
      id: 'mov-' + Date.now(),
      product_id: newProduct.id,
      product: newProduct.name,
      type: 'opening',
      qty_before: 0,
      qty_change: newProduct.qty,
      qty_after: newProduct.qty,
      reason: 'Opening stock for newly added product',
      date: new Date().toISOString(),
      user: userName
    });
  }

  saveData(data);
  return newProduct;
}

export function updateProduct(id, prodData, userName = 'Store Owner') {
  const data = loadData();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx < 0) throw new Error('Product not found.');

  // barcode check
  if (prodData.barcode && data.products.some(p => p.id !== id && p.barcode === prodData.barcode && p.is_active)) {
    throw new Error(`A product with barcode "${prodData.barcode}" already exists.`);
  }

  const existing = data.products[idx];
  const updated = {
    ...existing,
    name: prodData.name?.trim() ?? existing.name,
    barcode: prodData.barcode?.trim() ?? existing.barcode,
    sku: prodData.sku?.trim() ?? existing.sku,
    category: prodData.category ?? existing.category,
    brand: prodData.brand ?? existing.brand,
    unit: prodData.unit ?? existing.unit,
    purchase_price: prodData.purchase_price != null ? Number(prodData.purchase_price) : existing.purchase_price,
    selling_price: prodData.selling_price != null ? Number(prodData.selling_price) : existing.selling_price,
    mrp: prodData.mrp != null ? Number(prodData.mrp) : existing.mrp,
    gst: prodData.gst != null ? Number(prodData.gst) : existing.gst,
    min_stock: prodData.min_stock != null ? Number(prodData.min_stock) : existing.min_stock,
    expiry_date: prodData.expiry_date || existing.expiry_date,
    batch_no: prodData.batch_no || existing.batch_no,
    supplier_id: prodData.supplier_id || existing.supplier_id
  };

  data.products[idx] = updated;
  saveData(data);
  return updated;
}

export function archiveProduct(id) {
  const data = loadData();
  const p = data.products.find(x => x.id === id);
  if (!p) throw new Error('Product not found.');
  p.is_active = false;
  saveData(data);
  return { archived: true, id };
}

// ======================== STOCK & MOVEMENTS ========================
export function adjustStock(productId, newQty, reason, userName = 'Inventory Manager') {
  const data = loadData();
  const p = data.products.find(x => x.id === productId);
  if (!p) throw new Error('Product not found.');

  const parsedQty = Math.max(0, Number(newQty));
  const before = p.qty;
  const change = parsedQty - before;
  p.qty = parsedQty;

  const movement = {
    id: 'mov-' + Date.now(),
    product_id: p.id,
    product: p.name,
    type: 'adjustment',
    qty_before: before,
    qty_change: change,
    qty_after: parsedQty,
    reason: reason || 'Stock count adjustment',
    date: new Date().toISOString(),
    user: userName
  };
  data.stock_movements.unshift(movement);
  saveData(data);
  return { qty: parsedQty, movement };
}

export function recordStockDamage(productId, damageQty, reason, userName = 'Inventory Manager') {
  const data = loadData();
  const p = data.products.find(x => x.id === productId);
  if (!p) throw new Error('Product not found.');
  const numDamage = Number(damageQty);
  if (numDamage <= 0 || numDamage > p.qty) {
    throw new Error(`Invalid damage quantity. Available stock: ${p.qty}`);
  }

  const before = p.qty;
  p.qty = before - numDamage;

  const movement = {
    id: 'mov-' + Date.now(),
    product_id: p.id,
    product: p.name,
    type: 'damage',
    qty_before: before,
    qty_change: -numDamage,
    qty_after: p.qty,
    reason: reason || 'Damaged / Expired stock write-off',
    date: new Date().toISOString(),
    user: userName
  };
  data.stock_movements.unshift(movement);
  saveData(data);
  return { qty: p.qty, movement };
}

export function recordStockTransfer(productId, fromLocation, toLocation, transferQty, userName = 'Inventory Manager') {
  const data = loadData();
  const p = data.products.find(x => x.id === productId);
  if (!p) throw new Error('Product not found.');
  const qty = Number(transferQty);
  if (qty <= 0 || qty > p.qty) {
    throw new Error(`Invalid transfer quantity. Available stock: ${p.qty}`);
  }

  const movement = {
    id: 'mov-' + Date.now(),
    product_id: p.id,
    product: p.name,
    type: 'transfer',
    qty_before: p.qty,
    qty_change: 0,
    qty_after: p.qty,
    reason: `Transferred ${qty} ${p.unit} from ${fromLocation} to ${toLocation}`,
    date: new Date().toISOString(),
    user: userName
  };
  data.stock_movements.unshift(movement);
  saveData(data);
  return { success: true, movement };
}

export function getStockMovements(productId = null, page = 1, size = 25) {
  const data = loadData();
  let list = data.stock_movements;
  if (productId) {
    list = list.filter(m => m.product_id === productId);
  }
  const total = list.length;
  const start = (page - 1) * size;
  const items = list.slice(start, start + size);
  return { items, total, page, size };
}

// ======================== POS & SALES ========================
export function calculateQuote(cart) {
  const data = loadData();
  const items = cart.items || [];
  if (items.length === 0) {
    return {
      lines: [],
      subtotal: 0,
      discount: 0,
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      round_off: 0,
      total: 0
    };
  }

  let rawSubtotal = 0;
  let rawDiscount = 0;
  let lines = [];
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  for (const item of items) {
    const prod = data.products.find(p => p.id === item.product_id);
    if (!prod) {
      throw new Error(`Product not found in store catalog: ${item.product_id}`);
    }
    const qty = Number(item.qty) || 1;
    const unitPrice = prod.selling_price;
    const lineGross = unitPrice * qty;
    const discPct = Math.min(100, Math.max(0, Number(item.discount_pct) || 0));
    const lineDisc = Math.round((lineGross * discPct) / 100 * 100) / 100;
    const lineTotal = lineGross - lineDisc;

    rawSubtotal += lineGross;
    rawDiscount += lineDisc;

    const gst = prod.gst || 0;
    const taxable = Math.round((lineTotal * 100) / (100 + gst) * 100) / 100;
    const tax = Math.round((lineTotal - taxable) * 100) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    if (cart.interstate) {
      igst = tax;
    } else {
      cgst = Math.round((tax / 2) * 100) / 100;
      sgst = tax - cgst;
    }

    totalTaxable += taxable;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    lines.push({
      product_id: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      qty: qty,
      unit: prod.unit,
      unit_price: unitPrice,
      cost_price: prod.purchase_price,
      discount_pct: discPct,
      discount: lineDisc,
      taxable,
      cgst,
      sgst,
      igst,
      total: lineTotal
    });
  }

  const billDiscount = Math.max(0, Number(cart.bill_discount) || 0);
  const itemsTotal = lines.reduce((s, l) => s + l.total, 0);
  if (billDiscount > itemsTotal) {
    throw new Error('Bill discount cannot exceed total bill amount.');
  }

  const afterBillDisc = Math.max(0, itemsTotal - billDiscount);
  const roundedPayable = Math.round(afterBillDisc);
  const roundOff = Math.round((roundedPayable - afterBillDisc) * 100) / 100;

  return {
    lines,
    subtotal: Math.round(rawSubtotal * 100) / 100,
    discount: Math.round((rawDiscount + billDiscount) * 100) / 100,
    bill_discount: billDiscount,
    taxable: Math.round(totalTaxable * 100) / 100,
    cgst: Math.round(totalCgst * 100) / 100,
    sgst: Math.round(totalSgst * 100) / 100,
    igst: Math.round(totalIgst * 100) / 100,
    round_off: roundOff,
    total: roundedPayable
  };
}

export function createSale(saleInput, userName = 'Ananya Iyer') {
  const data = loadData();
  const quote = calculateQuote(saleInput);

  if (quote.lines.length === 0) {
    throw new Error('Cart is empty.');
  }

  // Stock check
  for (const line of quote.lines) {
    const prod = data.products.find(p => p.id === line.product_id);
    if (!prod) throw new Error(`Product ${line.name} is no longer available.`);
    if (prod.qty < line.qty) {
      throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.qty} ${prod.unit}, Requested: ${line.qty}`);
    }
  }

  // Payment check
  const payments = saleInput.payments || [{ method: 'cash', amount: quote.total }];
  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  if (Math.abs(totalPaid - quote.total) > 0.05) {
    throw new Error(`Payment mismatch! Entered: ₹${totalPaid.toFixed(2)}, Required: ₹${quote.total.toFixed(2)}`);
  }

  // Generate Invoice Number
  data.invoice_seq = (data.invoice_seq || 1000) + 1;
  const invoiceNo = `INV-${data.invoice_seq}`;
  const now = new Date().toISOString();

  // Deduct stock and log movements
  let costTotal = 0;
  for (const line of quote.lines) {
    const prod = data.products.find(p => p.id === line.product_id);
    const before = prod.qty;
    prod.qty = before - line.qty;
    costTotal += (prod.purchase_price || 0) * line.qty;

    data.stock_movements.unshift({
      id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      product_id: prod.id,
      product: prod.name,
      type: 'sale',
      qty_before: before,
      qty_change: -line.qty,
      qty_after: prod.qty,
      reason: `POS Sale ${invoiceNo}`,
      ref: invoiceNo,
      date: now,
      user: userName
    });
  }

  // Handle Customer Loyalty Points
  let custId = saleInput.customer_id || null;
  let custName = saleInput.customer_name?.trim() || null;
  let custMobile = saleInput.customer_mobile?.trim() || null;

  if (custMobile) {
    let customer = data.customers.find(c => c.mobile === custMobile);
    if (!customer) {
      customer = {
        id: 'cust-' + Date.now().toString().slice(-5),
        name: custName || 'Customer ' + custMobile.slice(-4),
        mobile: custMobile,
        email: '',
        loyalty_points: 0,
        total_spent: 0,
        visits: 0
      };
      data.customers.push(customer);
    }
    custId = customer.id;
    custName = customer.name;
    const earnedPoints = Math.floor(quote.total / 100);
    customer.loyalty_points += earnedPoints;
    customer.total_spent += quote.total;
    customer.visits += 1;
  }

  const saleRecord = {
    id: 'sale-' + Date.now(),
    invoice_no: invoiceNo,
    created_at: now,
    cashier: userName,
    customer_id: custId,
    customer_name: custName,
    customer_mobile: custMobile,
    subtotal: quote.subtotal,
    discount: quote.discount,
    bill_discount: quote.bill_discount,
    taxable: quote.taxable,
    cgst: quote.cgst,
    sgst: quote.sgst,
    igst: quote.igst,
    round_off: quote.round_off,
    total: quote.total,
    cost_total: Math.round(costTotal * 100) / 100,
    status: 'completed',
    items: quote.lines,
    payments: payments,
    store_name: data.store.name,
    store_address: data.store.address,
    store_phone: data.store.phone,
    store_gstin: data.store.gstin
  };

  data.sales.unshift(saleRecord);
  saveData(data);
  return saleRecord;
}

export function getSales({ q = '', page = 1, size = 20, dateFrom = '', dateTo = '' } = {}) {
  const data = loadData();
  let list = data.sales;

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(s =>
      s.invoice_no.toLowerCase().includes(term) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(term)) ||
      (s.customer_mobile && s.customer_mobile.includes(term)) ||
      (s.cashier && s.cashier.toLowerCase().includes(term))
    );
  }

  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    list = list.filter(s => new Date(s.created_at).getTime() >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime() + 24 * 3600 * 1000;
    list = list.filter(s => new Date(s.created_at).getTime() <= to);
  }

  const total = list.length;
  const start = (page - 1) * size;
  const items = list.slice(start, start + size);
  return { items, total, page, size };
}

export function getSaleDetail(saleId) {
  const data = loadData();
  const s = data.sales.find(x => x.id === saleId || x.invoice_no === saleId);
  if (!s) throw new Error('Invoice not found.');
  return {
    ...s,
    store_name: data.store.name,
    store_address: data.store.address,
    store_phone: data.store.phone,
    store_gstin: data.store.gstin
  };
}

export function processSaleReturn(saleId, itemId, returnQty, reason, canRestock = true, userName = 'Store Manager') {
  const data = loadData();
  const sale = data.sales.find(s => s.id === saleId || s.invoice_no === saleId);
  if (!sale) throw new Error('Original invoice not found.');

  const item = sale.items.find(i => i.id === itemId || i.product_id === itemId);
  if (!item) throw new Error('Item not found in invoice.');

  const qty = Number(returnQty);
  if (qty <= 0 || qty > item.qty) {
    throw new Error(`Invalid return quantity. Maximum refundable qty: ${item.qty}`);
  }

  const refundUnitPrice = item.unit_price * (1 - (item.discount_pct || 0) / 100);
  const refundAmount = Math.round(refundUnitPrice * qty);

  // Update product stock if goods are restockable
  const prod = data.products.find(p => p.id === item.product_id);
  if (prod && canRestock) {
    const before = prod.qty;
    prod.qty = before + qty;

    data.stock_movements.unshift({
      id: 'mov-' + Date.now(),
      product_id: prod.id,
      product: prod.name,
      type: 'return',
      qty_before: before,
      qty_change: qty,
      qty_after: prod.qty,
      reason: `Customer Return: ${reason} (Inv ${sale.invoice_no})`,
      ref: sale.invoice_no,
      date: new Date().toISOString(),
      user: userName
    });
  }

  // Mark return on sale
  if (!sale.returns) sale.returns = [];
  sale.returns.push({
    id: 'ret-' + Date.now(),
    date: new Date().toISOString(),
    item_id: item.id,
    product_name: item.name,
    qty,
    refund_amount: refundAmount,
    reason,
    restocked: canRestock,
    processed_by: userName
  });

  saveData(data);
  return { success: true, refundAmount, sale };
}

// ======================== PURCHASES & SUPPLIERS ========================
export function getPurchases() {
  const data = loadData();
  return data.purchases;
}

export function createPurchaseOrder(poInput, userName = 'Murugan Pillai') {
  const data = loadData();
  const supplier = data.suppliers.find(s => s.id === poInput.supplier_id);
  if (!supplier) throw new Error('Supplier not found.');

  data.po_seq = (data.po_seq || 20) + 1;
  const poNo = `PO-2026-${String(data.po_seq).padStart(3, '0')}`;

  const items = (poInput.items || []).map(it => ({
    product_id: it.product_id,
    name: it.name,
    qty: Number(it.qty) || 1,
    price: Number(it.price) || 0,
    total: (Number(it.qty) || 1) * (Number(it.price) || 0)
  }));

  const total = items.reduce((s, it) => s + it.total, 0);

  const po = {
    id: 'po-' + Date.now(),
    po_no: poNo,
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    date: new Date().toISOString(),
    status: 'pending',
    payment_status: 'unpaid',
    total,
    items,
    notes: poInput.notes || ''
  };

  data.purchases.unshift(po);
  saveData(data);
  return po;
}

export function receiveGoodsGRN(purchaseId, userName = 'Murugan Pillai') {
  const data = loadData();
  const po = data.purchases.find(p => p.id === purchaseId);
  if (!po) throw new Error('Purchase Order not found.');
  if (po.status === 'received') throw new Error('This purchase order is already marked received.');

  data.grn_seq = (data.grn_seq || 15) + 1;
  const grnNo = `GRN-2026-${String(data.grn_seq).padStart(3, '0')}`;
  const now = new Date().toISOString();

  // Increment stock for all items
  for (const it of po.items) {
    const prod = data.products.find(p => p.id === it.product_id);
    if (prod) {
      const before = prod.qty;
      prod.qty = before + it.qty;

      data.stock_movements.unshift({
        id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
        product_id: prod.id,
        product: prod.name,
        type: 'purchase',
        qty_before: before,
        qty_change: it.qty,
        qty_after: prod.qty,
        reason: `Goods Received: ${grnNo} (${po.po_no})`,
        ref: grnNo,
        date: now,
        user: userName
      });
    }
  }

  po.status = 'received';
  po.grn_no = grnNo;
  po.received_at = now;

  // Add to supplier balance
  const sup = data.suppliers.find(s => s.id === po.supplier_id);
  if (sup && po.payment_status !== 'paid') {
    sup.balance = (sup.balance || 0) + po.total;
  }

  saveData(data);
  return { success: true, grnNo, po };
}

export function recordSupplierPayment(supplierId, purchaseId, amount, paymentMode = 'bank_transfer', note = '') {
  const data = loadData();
  const sup = data.suppliers.find(s => s.id === supplierId);
  if (!sup) throw new Error('Supplier not found.');

  const amt = Number(amount);
  if (amt <= 0) throw new Error('Payment amount must be greater than 0.');

  sup.balance = Math.max(0, (sup.balance || 0) - amt);

  if (purchaseId) {
    const po = data.purchases.find(p => p.id === purchaseId);
    if (po) {
      po.payment_status = amt >= po.total ? 'paid' : 'partial';
    }
  }

  // Also log under expenses for ledger transparency
  data.expenses.unshift({
    id: 'exp-' + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    category: 'Supplier Payments',
    description: `Payment to ${sup.name}: ${note || 'Against PO Invoice'}`,
    amount: amt,
    payment_mode: paymentMode,
    reference: `SUP-PAY-${Date.now().toString().slice(-4)}`,
    approved_by: 'Rajendran Sundaram'
  });

  saveData(data);
  return { success: true, balance: sup.balance };
}

export function getSuppliers() {
  const data = loadData();
  return data.suppliers;
}

export function createSupplier(supData) {
  const data = loadData();
  const newSup = {
    id: 'sup-' + Date.now().toString().slice(-5),
    name: supData.name.trim(),
    contact_person: supData.contact_person || '',
    phone: supData.phone || '',
    email: supData.email || '',
    gstin: supData.gstin || '',
    address: supData.address || '',
    category: supData.category || 'General',
    balance: Number(supData.opening_balance) || 0,
    created_at: new Date().toISOString()
  };
  data.suppliers.push(newSup);
  saveData(data);
  return newSup;
}

export function updateSupplier(id, supData) {
  const data = loadData();
  const idx = data.suppliers.findIndex(s => s.id === id);
  if (idx < 0) throw new Error('Supplier not found.');
  data.suppliers[idx] = { ...data.suppliers[idx], ...supData };
  saveData(data);
  return data.suppliers[idx];
}

// ======================== CUSTOMERS ========================
export function getCustomers() {
  const data = loadData();
  return data.customers;
}

export function createCustomer(custData) {
  const data = loadData();
  if (custData.mobile && data.customers.some(c => c.mobile === custData.mobile.trim())) {
    throw new Error('A customer with this mobile number already exists.');
  }
  const newCust = {
    id: 'cust-' + Date.now().toString().slice(-5),
    name: custData.name.trim(),
    mobile: custData.mobile ? custData.mobile.trim() : '',
    email: custData.email ? custData.email.trim() : '',
    loyalty_points: Number(custData.loyalty_points) || 0,
    total_spent: 0,
    visits: 0
  };
  data.customers.push(newCust);
  saveData(data);
  return newCust;
}

export function updateCustomer(id, custData) {
  const data = loadData();
  const idx = data.customers.findIndex(c => c.id === id);
  if (idx < 0) throw new Error('Customer not found.');
  data.customers[idx] = { ...data.customers[idx], ...custData };
  saveData(data);
  return data.customers[idx];
}

// ======================== EMPLOYEES ========================
export function getEmployees() {
  const data = loadData();
  return data.accounts;
}

export function createEmployee(empData) {
  const data = loadData();
  if (data.accounts.some(a => a.email.toLowerCase() === empData.email.trim().toLowerCase())) {
    throw new Error('An employee with this email already exists.');
  }

  const role = empData.role || 'cashier';
  const permsMap = {
    owner: ['*'],
    manager: ['dashboard', 'pos', 'products', 'inventory', 'purchases', 'suppliers', 'sales', 'customers', 'insights', 'reports'],
    cashier: ['pos', 'customers', 'sales'],
    inventory: ['inventory', 'products', 'purchases', 'suppliers', 'insights'],
    accountant: ['finance', 'reports', 'sales', 'purchases', 'insights']
  };
  const homeMap = {
    owner: '/dashboard',
    manager: '/dashboard',
    cashier: '/pos',
    inventory: '/inventory',
    accountant: '/finance'
  };

  const newEmp = {
    email: empData.email.trim(),
    password: empData.password || 'Demo@123',
    name: empData.name.trim(),
    role: role,
    phone: empData.phone || '+91 98401 00000',
    store: data.store.name,
    permissions: permsMap[role] || ['pos'],
    home: homeMap[role] || '/dashboard',
    active: true
  };
  data.accounts.push(newEmp);
  saveData(data);
  return newEmp;
}

export function updateEmployee(email, empData) {
  const data = loadData();
  const idx = data.accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (idx < 0) throw new Error('Employee not found.');
  data.accounts[idx] = { ...data.accounts[idx], ...empData };
  saveData(data);
  return data.accounts[idx];
}

// ======================== EXPENSES & FINANCE ========================
export function getExpenses() {
  const data = loadData();
  return data.expenses;
}

export function createExpense(expData) {
  const data = loadData();
  const newExp = {
    id: 'exp-' + Date.now(),
    date: expData.date || new Date().toISOString().slice(0, 10),
    category: expData.category || 'General Store Expense',
    description: expData.description || '',
    amount: Number(expData.amount) || 0,
    payment_mode: expData.payment_mode || 'cash',
    reference: expData.reference || ('VOUCHER-' + Math.floor(100 + Math.random() * 900)),
    approved_by: expData.approved_by || 'Store Manager'
  };
  data.expenses.unshift(newExp);
  saveData(data);
  return newExp;
}

export function getCashRegisterClosings() {
  const data = loadData();
  return data.closings;
}

export function recordClosing(closingData) {
  const data = loadData();
  const newClosing = {
    id: 'close-' + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    cashier: closingData.cashier || 'Cashier',
    opening_cash: Number(closingData.opening_cash) || 2000,
    cash_sales: Number(closingData.cash_sales) || 0,
    cash_expenses: Number(closingData.cash_expenses) || 0,
    expected_cash: Number(closingData.expected_cash) || 0,
    counted_cash: Number(closingData.counted_cash) || 0,
    difference: Number(closingData.difference) || 0,
    status: Math.abs(Number(closingData.difference)) < 1 ? 'balanced' : Number(closingData.difference) > 0 ? 'surplus' : 'shortage',
    notes: closingData.notes || 'End of day register closure'
  };
  data.closings.unshift(newClosing);
  saveData(data);
  return newClosing;
}

// ======================== DASHBOARD & ANALYTICS ========================
export function getDashboardMetrics(days = 1) {
  const data = loadData();
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 3600 * 1000);

  const filteredSales = data.sales.filter(s => new Date(s.created_at) >= cutoff);
  const totalSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = filteredSales.reduce((acc, s) => acc + (s.cost_total || s.total * 0.75), 0);
  const grossProfit = totalSales - totalCost;

  // Active products & stock value
  const activeProducts = data.products.filter(p => p.is_active);
  const stockValue = activeProducts.reduce((acc, p) => acc + p.qty * p.purchase_price, 0);
  const lowStock = activeProducts.filter(p => p.qty <= p.min_stock && p.qty > 0).length;
  const outOfStock = activeProducts.filter(p => p.qty === 0).length;

  // Near expiry (<30 days from today)
  const todayStr = now.toISOString().slice(0, 10);
  const thirtyDaysStr = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const nearExpiryCount = activeProducts.filter(p => p.expiry_date && p.expiry_date <= thirtyDaysStr).length;

  // Recent transactions (last 6)
  const recentSales = data.sales.slice(0, 6);

  // Top selling products (based on filtered sales)
  const productSalesMap = {};
  for (const sale of filteredSales) {
    for (const item of sale.items) {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.product_id].qty += item.qty;
      productSalesMap[item.product_id].revenue += item.total;
    }
  }
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily points for trend chart (last 7 or 30 days)
  const chartDays = days === 1 ? 7 : days;
  const chartPoints = [];
  for (let d = chartDays - 1; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 24 * 3600 * 1000);
    const dayStr = dayDate.toISOString().slice(0, 10);
    const daySales = data.sales.filter(s => s.created_at.slice(0, 10) === dayStr);
    const dayTotal = daySales.reduce((s, it) => s + it.total, 0);
    const dayCount = daySales.length;
    chartPoints.push({
      date: dayStr,
      label: dayDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      total: dayTotal,
      transactions: dayCount
    });
  }

  // Category sales breakdown
  const categoryMap = {};
  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const prod = data.products.find(p => p.id === item.product_id);
      const cat = prod?.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + item.total;
    }
  }

  return {
    sales: Math.round(totalSales),
    transactions: filteredSales.length,
    products: activeProducts.length,
    stock_value: Math.round(stockValue),
    gross_profit: Math.round(grossProfit),
    low_stock: lowStock,
    out_of_stock: outOfStock,
    near_expiry: nearExpiryCount,
    recent_sales: recentSales,
    top_products: topProducts,
    chart_points: chartPoints,
    category_sales: categoryMap
  };
}

// ======================== SMART INSIGHTS ========================
export function getSmartInsights() {
  const data = loadData();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const sevenDaysStr = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const thirtyDaysStr = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  // 1. Expiry Radar
  const expiredItems = [];
  const urgentExpiry = [];
  const upcomingExpiry = [];

  for (const p of data.products.filter(x => x.is_active)) {
    if (!p.expiry_date) continue;
    if (p.expiry_date < todayStr) {
      expiredItems.push({ ...p, status: 'expired', days_left: 0 });
    } else if (p.expiry_date <= sevenDaysStr) {
      const diff = Math.ceil((new Date(p.expiry_date) - now) / (1000 * 3600 * 24));
      urgentExpiry.push({ ...p, status: 'urgent', days_left: diff });
    } else if (p.expiry_date <= thirtyDaysStr) {
      const diff = Math.ceil((new Date(p.expiry_date) - now) / (1000 * 3600 * 24));
      upcomingExpiry.push({ ...p, status: 'upcoming', days_left: diff });
    }
  }

  // 2. Dead Stock (zero sales in past 30 days and stock > 5)
  const cutoff30d = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const soldProductIds = new Set();
  for (const s of data.sales.filter(x => new Date(x.created_at) >= cutoff30d)) {
    for (const item of s.items) soldProductIds.add(item.product_id);
  }

  const deadStock = data.products
    .filter(p => p.is_active && p.qty > 5 && !soldProductIds.has(p.id))
    .map(p => ({
      ...p,
      tied_capital: p.qty * p.purchase_price,
      days_dormant: 35
    }));

  // 3. Smart Reorder Suggestions (qty <= min_stock)
  const reorderSuggestions = data.products
    .filter(p => p.is_active && p.qty <= p.min_stock)
    .map(p => {
      // Calculate 30-day velocity
      const soldQty = data.sales.reduce((sum, s) => {
        const match = s.items.find(i => i.product_id === p.id);
        return sum + (match ? match.qty : 0);
      }, 0);
      const dailyVelocity = soldQty / 30 || 0.5;
      const suggestedReorder = Math.max(10, Math.ceil(dailyVelocity * 20));
      return {
        ...p,
        current_stock: p.qty,
        min_stock: p.min_stock,
        sold_last_30d: soldQty,
        suggested_qty: suggestedReorder,
        estimated_cost: suggestedReorder * p.purchase_price
      };
    });

  // 4. Profit Intelligence (margin ranking)
  const margins = data.products
    .filter(p => p.is_active && p.selling_price > 0)
    .map(p => {
      const margin = p.selling_price - p.purchase_price;
      const marginPct = Math.round((margin / p.selling_price) * 100);
      return {
        ...p,
        margin,
        margin_pct: marginPct
      };
    })
    .sort((a, b) => b.margin_pct - a.margin_pct);

  const highestMargin = margins.slice(0, 5);
  const lowestMargin = [...margins].reverse().slice(0, 5);

  // 5. Stock Loss Tracking (from movements: damage + adjustment negative)
  const losses = data.stock_movements
    .filter(m => m.type === 'damage' || (m.type === 'adjustment' && m.qty_change < 0))
    .map(m => {
      const prod = data.products.find(p => p.id === m.product_id);
      const unitCost = prod ? prod.purchase_price : 50;
      const lostQty = Math.abs(m.qty_change);
      return {
        ...m,
        lost_qty: lostQty,
        loss_value: lostQty * unitCost
      };
    });

  const totalLossValue = losses.reduce((sum, l) => sum + l.loss_value, 0);

  return {
    expiry_radar: {
      expired: expiredItems,
      urgent: urgentExpiry,
      upcoming: upcomingExpiry,
      total_at_risk: expiredItems.length + urgentExpiry.length + upcomingExpiry.length
    },
    dead_stock: deadStock,
    reorder_suggestions: reorderSuggestions,
    profit_intelligence: {
      highest_margin: highestMargin,
      lowest_margin: lowestMargin,
      avg_margin_pct: Math.round(margins.reduce((s, m) => s + m.margin_pct, 0) / margins.length)
    },
    stock_losses: {
      items: losses,
      total_value: Math.round(totalLossValue)
    }
  };
}

// ======================== REPORTS ========================
export function getReportsData(type = 'daily_sales', { dateFrom = '', dateTo = '' } = {}) {
  const data = loadData();

  if (type === 'daily_sales') {
    const dayMap = {};
    for (const s of data.sales) {
      const day = s.created_at.slice(0, 10);
      if (!dayMap[day]) {
        dayMap[day] = { date: day, count: 0, subtotal: 0, discount: 0, tax: 0, total: 0, cost: 0 };
      }
      dayMap[day].count += 1;
      dayMap[day].subtotal += s.subtotal;
      dayMap[day].discount += s.discount;
      dayMap[day].tax += (s.cgst + s.sgst + s.igst);
      dayMap[day].total += s.total;
      dayMap[day].cost += (s.cost_total || s.total * 0.75);
    }
    const rows = Object.values(dayMap)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(r => ({
        ...r,
        profit: Math.round(r.total - r.cost),
        margin: Math.round(((r.total - r.cost) / (r.total || 1)) * 100) + '%'
      }));
    return { title: 'Daily Sales Report', rows };
  }

  if (type === 'product_sales') {
    const prodMap = {};
    for (const s of data.sales) {
      for (const it of s.items) {
        if (!prodMap[it.product_id]) {
          prodMap[it.product_id] = { id: it.product_id, name: it.name, qty: 0, revenue: 0, cost: 0 };
        }
        prodMap[it.product_id].qty += it.qty;
        prodMap[it.product_id].revenue += it.total;
        prodMap[it.product_id].cost += (it.cost_price || 0) * it.qty;
      }
    }
    const rows = Object.values(prodMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(r => ({
        ...r,
        profit: Math.round(r.revenue - r.cost),
        margin: Math.round(((r.revenue - r.cost) / (r.revenue || 1)) * 100) + '%'
      }));
    return { title: 'Product Performance Report', rows };
  }

  if (type === 'category_sales') {
    const catMap = {};
    for (const s of data.sales) {
      for (const it of s.items) {
        const prod = data.products.find(p => p.id === it.product_id);
        const cat = prod?.category || 'General';
        if (!catMap[cat]) catMap[cat] = { category: cat, items_sold: 0, revenue: 0, cost: 0 };
        catMap[cat].items_sold += it.qty;
        catMap[cat].revenue += it.total;
        catMap[cat].cost += (it.cost_price || 0) * it.qty;
      }
    }
    const rows = Object.values(catMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(r => ({
        ...r,
        profit: Math.round(r.revenue - r.cost),
        margin: Math.round(((r.revenue - r.cost) / (r.revenue || 1)) * 100) + '%'
      }));
    return { title: 'Category Sales Breakdown', rows };
  }

  if (type === 'inventory_valuation') {
    const rows = data.products
      .filter(p => p.is_active)
      .map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        qty: p.qty,
        unit: p.unit,
        purchase_price: p.purchase_price,
        selling_price: p.selling_price,
        total_cost_value: Math.round(p.qty * p.purchase_price),
        total_retail_value: Math.round(p.qty * p.selling_price),
        status: p.qty === 0 ? 'Out of Stock' : p.qty <= p.min_stock ? 'Low Stock' : 'In Stock'
      }))
      .sort((a, b) => b.total_cost_value - a.total_cost_value);
    return { title: 'Inventory Valuation Report', rows };
  }

  if (type === 'profit_and_loss') {
    const totalSales = data.sales.reduce((acc, s) => acc + s.total, 0);
    const totalCostOfGoods = data.sales.reduce((acc, s) => acc + (s.cost_total || s.total * 0.75), 0);
    const grossProfit = totalSales - totalCostOfGoods;
    const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const rows = [
      { metric: '1. Total Sales Revenue', amount: totalSales, note: 'Sum of all POS completed sales' },
      { metric: '2. Cost of Goods Sold (COGS)', amount: -totalCostOfGoods, note: 'Purchase cost of goods sold' },
      { metric: '3. Gross Profit (1 - 2)', amount: grossProfit, note: `Gross Margin: ${Math.round((grossProfit / totalSales) * 100)}%` },
      { metric: '4. Total Operating Expenses', amount: -totalExpenses, note: 'Rent, electricity, salaries, transport, maintenance' },
      { metric: '5. Estimated Net Profit (3 - 4)', amount: netProfit, note: `Net Margin: ${Math.round((netProfit / totalSales) * 100)}%` }
    ];
    return { title: 'Profit & Loss Statement (Year-to-date)', rows, summary: { totalSales, grossProfit, totalExpenses, netProfit } };
  }

  if (type === 'employee_sales') {
    const empMap = {};
    for (const s of data.sales) {
      const c = s.cashier || 'Cashier';
      if (!empMap[c]) empMap[c] = { cashier: c, transactions: 0, total_sales: 0 };
      empMap[c].transactions += 1;
      empMap[c].total_sales += s.total;
    }
    const rows = Object.values(empMap).sort((a, b) => b.total_sales - a.total_sales);
    return { title: 'Cashier Sales Performance', rows };
  }

  return { title: 'Report', rows: [] };
}

// ======================== SETTINGS ========================
export function getSettings() {
  const data = loadData();
  return { ...data.settings, store_name: data.store.name, address: data.store.address, phone: data.store.phone, email: data.store.email, gstin: data.store.gstin };
}

export function saveSettings(newSettings) {
  const data = loadData();
  data.settings = { ...data.settings, ...newSettings };
  if (newSettings.store_name) data.store.name = newSettings.store_name;
  if (newSettings.address) data.store.address = newSettings.address;
  if (newSettings.phone) data.store.phone = newSettings.phone;
  if (newSettings.email) data.store.email = newSettings.email;
  if (newSettings.gstin) data.store.gstin = newSettings.gstin;
  saveData(data);
  return data.settings;
}
