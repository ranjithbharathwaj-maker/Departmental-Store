// Unified API Layer with Seamless Demo Mode Interceptor
import * as demo from './demo/demoStorage.js';

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export const tok = () => localStorage.getItem('mt') || sessionStorage.getItem('mt');
export const wipe = () => {
  localStorage.removeItem('mt');
  sessionStorage.removeItem('mt');
};

export async function api(path, opt = {}) {
  // If demo mode is enabled, handle locally with complete simulation
  if (IS_DEMO_MODE) {
    return handleDemoApi(path, opt);
  }

  // Real backend path
  const t = tok();
  const r = await fetch('/api' + path, {
    ...opt,
    headers: {
      'Content-Type': 'application/json',
      ...(t && { Authorization: 'Bearer ' + t })
    }
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && t && path !== '/auth/login') {
    wipe();
    location.href = '/login?expired=1';
  }
  if (!r.ok) {
    throw new Error(typeof d.detail === 'string' ? d.detail : 'Please check the highlighted values and try again.');
  }
  return d;
}

// Router for Demo Mode requests
async function handleDemoApi(path, opt = {}) {
  // Add realistic micro-delay for smooth UI feel
  await new Promise(r => setTimeout(r, 40));

  const method = (opt.method || 'GET').toUpperCase();
  const body = opt.body ? (typeof opt.body === 'string' ? JSON.parse(opt.body) : opt.body) : {};

  // Extract query params
  const [cleanPath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Auth routes
  if (cleanPath === '/auth/login' && method === 'POST') {
    return demo.demoLogin(body.email, body.password);
  }

  if (cleanPath === '/auth/me') {
    const u = demo.demoGetCurrentUser(tok());
    if (!u) throw new Error('Unauthenticated');
    return u;
  }

  // 2. Dashboard
  if (cleanPath === '/dashboard') {
    const days = parseInt(params.get('days') || '1', 10);
    return demo.getDashboardMetrics(days);
  }

  // 3. Products
  if (cleanPath === '/products' && method === 'GET') {
    return demo.getProducts({
      q: params.get('q') || '',
      category: params.get('category') || '',
      sort: params.get('sort') || 'name',
      page: parseInt(params.get('page') || '1', 10),
      size: parseInt(params.get('size') || '10', 10),
      archived: params.get('archived') === 'true'
    });
  }

  if (cleanPath === '/products' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.createProduct(body, user?.name);
  }

  const prodArchiveMatch = cleanPath.match(/^\/products\/([^/]+)\/archive$/);
  if (prodArchiveMatch && method === 'POST') {
    return demo.archiveProduct(prodArchiveMatch[1]);
  }

  const prodIdMatch = cleanPath.match(/^\/products\/([^/]+)$/);
  if (prodIdMatch && method === 'PUT') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.updateProduct(prodIdMatch[1], body, user?.name);
  }

  // 4. Stock & Movements
  if (cleanPath === '/stock/adjust' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.adjustStock(body.product_id, body.new_qty, body.reason, user?.name);
  }

  if (cleanPath === '/stock/damage' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.recordStockDamage(body.product_id, body.damage_qty, body.reason, user?.name);
  }

  if (cleanPath === '/stock/transfer' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.recordStockTransfer(body.product_id, body.from_location, body.to_location, body.transfer_qty, user?.name);
  }

  if (cleanPath === '/stock/movements') {
    const pid = params.get('product_id') || null;
    const page = parseInt(params.get('page') || '1', 10);
    return demo.getStockMovements(pid, page, 25);
  }

  // 5. Sales & POS
  if (cleanPath === '/sales/quote' && method === 'POST') {
    return demo.calculateQuote(body);
  }

  if (cleanPath === '/sales' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.createSale(body, user?.name || 'Cashier');
  }

  if (cleanPath === '/sales' && method === 'GET') {
    return demo.getSales({
      q: params.get('q') || '',
      page: parseInt(params.get('page') || '1', 10),
      size: parseInt(params.get('size') || '20', 10),
      dateFrom: params.get('dateFrom') || '',
      dateTo: params.get('dateTo') || ''
    });
  }

  const saleReturnMatch = cleanPath.match(/^\/sales\/([^/]+)\/return$/);
  if (saleReturnMatch && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.processSaleReturn(saleReturnMatch[1], body.item_id, body.return_qty, body.reason, body.restock, user?.name);
  }

  const saleIdMatch = cleanPath.match(/^\/sales\/([^/]+)$/);
  if (saleIdMatch && method === 'GET') {
    return demo.getSaleDetail(saleIdMatch[1]);
  }

  // 6. Purchases & Suppliers
  if (cleanPath === '/purchases' && method === 'GET') {
    return demo.getPurchases();
  }

  if (cleanPath === '/purchases' && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.createPurchaseOrder(body, user?.name);
  }

  const grnMatch = cleanPath.match(/^\/purchases\/([^/]+)\/receive$/);
  if (grnMatch && method === 'POST') {
    const user = demo.demoGetCurrentUser(tok());
    return demo.receiveGoodsGRN(grnMatch[1], user?.name);
  }

  const poPayMatch = cleanPath.match(/^\/purchases\/([^/]+)\/payment$/);
  if (poPayMatch && method === 'POST') {
    return demo.recordSupplierPayment(body.supplier_id, poPayMatch[1], body.amount, body.mode, body.note);
  }

  if (cleanPath === '/suppliers' && method === 'GET') {
    return demo.getSuppliers();
  }

  if (cleanPath === '/suppliers' && method === 'POST') {
    return demo.createSupplier(body);
  }

  const supIdMatch = cleanPath.match(/^\/suppliers\/([^/]+)$/);
  if (supIdMatch && method === 'PUT') {
    return demo.updateSupplier(supIdMatch[1], body);
  }

  // 7. Customers
  if (cleanPath === '/customers' && method === 'GET') {
    return demo.getCustomers();
  }

  if (cleanPath === '/customers' && method === 'POST') {
    return demo.createCustomer(body);
  }

  const custIdMatch = cleanPath.match(/^\/customers\/([^/]+)$/);
  if (custIdMatch && method === 'PUT') {
    return demo.updateCustomer(custIdMatch[1], body);
  }

  // 8. Employees
  if (cleanPath === '/employees' && method === 'GET') {
    return demo.getEmployees();
  }

  if (cleanPath === '/employees' && method === 'POST') {
    return demo.createEmployee(body);
  }

  const empEmailMatch = cleanPath.match(/^\/employees\/([^/]+)$/);
  if (empEmailMatch && method === 'PUT') {
    return demo.updateEmployee(decodeURIComponent(empEmailMatch[1]), body);
  }

  // 9. Finance & Expenses
  if (cleanPath === '/expenses' && method === 'GET') {
    return demo.getExpenses();
  }

  if (cleanPath === '/expenses' && method === 'POST') {
    return demo.createExpense(body);
  }

  if (cleanPath === '/finance/closings' && method === 'GET') {
    return demo.getCashRegisterClosings();
  }

  if (cleanPath === '/finance/closings' && method === 'POST') {
    return demo.recordClosing(body);
  }

  // 10. Smart Insights
  if (cleanPath === '/insights') {
    return demo.getSmartInsights();
  }

  // 11. Reports
  if (cleanPath === '/reports') {
    const type = params.get('type') || 'daily_sales';
    return demo.getReportsData(type, {
      dateFrom: params.get('from') || '',
      dateTo: params.get('to') || ''
    });
  }

  // 12. Settings
  if (cleanPath === '/settings' && method === 'GET') {
    return demo.getSettings();
  }

  if (cleanPath === '/settings' && method === 'PUT') {
    return demo.saveSettings(body);
  }

  if (cleanPath === '/demo/reset' && method === 'POST') {
    return demo.resetDemoData();
  }

  // 13. Module permission check fallback
  if (cleanPath.startsWith('/module/')) {
    const mod = cleanPath.replace('/module/', '');
    const user = demo.demoGetCurrentUser(tok());
    return {
      module: mod,
      user: user?.name || 'Demo User',
      role: user?.role || 'owner',
      message: 'Access granted in Demo Mode.'
    };
  }

  // Fallback for unhandled path in demo mode
  console.warn(`[Demo API] Unhandled route: ${method} ${cleanPath}`);
  return { ok: true, message: `Demo mode mocked response for ${cleanPath}` };
}
