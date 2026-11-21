import React, { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  Store,
  Receipt,
  Users,
  UserCheck,
  Wallet,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

import { tok, wipe, api } from './api.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import {
  Dashboard,
  Products,
  Pos,
  Inventory,
  Purchases,
  Suppliers,
  Sales,
  Customers,
  Employees,
  Finance,
  SmartInsights,
  Reports,
  Settings
} from './pages.jsx';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

const can = (u, p) => {
  if (!u || !u.permissions) return false;
  return u.permissions.includes('*') || u.permissions.includes(p);
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (tok()) {
      api('/auth/me')
        .then(setUser)
        .catch(wipe)
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const login = async (email, password, remember = true) => {
    const d = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    wipe();
    (remember ? localStorage : sessionStorage).setItem('mt', d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    wipe();
    setUser(null);
  };

  const switchRole = async (targetEmail) => {
    const u = await login(targetEmail, 'Demo@123', true);
    return u;
  };

  return (
    <Ctx.Provider value={{ user, ready, login, logout, switchRole }}>
      {children}
    </Ctx.Provider>
  );
}

function Guard({ perm, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="splash">Loading Royal Mart…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (perm && !can(user, perm)) return <Navigate to="/forbidden" replace />;
  return children;
}

const DEMO_USERS = [
  ['Store Owner', 'owner@royalmart.demo', 'Demo@123', 'owner'],
  ['Store Manager', 'manager@royalmart.demo', 'Demo@123', 'manager'],
  ['Cashier', 'cashier@royalmart.demo', 'Demo@123', 'cashier'],
  ['Inventory Manager', 'inventory@royalmart.demo', 'Demo@123', 'inventory'],
  ['Accountant', 'accountant@royalmart.demo', 'Demo@123', 'accountant']
];

function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [q] = useSearchParams();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [rem, setRem] = useState(true);
  const [err, setErr] = useState(q.get('expired') ? 'Your session expired. Please sign in again.' : '');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  if (user) return <Navigate to={user.home || '/dashboard'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setNote('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (!pw) return setErr('Enter your password.');
    setBusy(true);
    setErr('');
    try {
      const u = await login(email.trim(), pw, rem);
      nav(u.home || '/dashboard', { replace: true });
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={submit} noValidate>
        <div className="brand">
          <span className="mark">M</span>
          <b>ROYAL MART</b>
        </div>
        <h1>Welcome Back</h1>
        <p className="sub">Departmental Store Management System (Chennai, TN)</p>

        {err && <div className="alert" role="alert">{err}</div>}
        {note && <div className="alert ok">{note}</div>}

        <label>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. owner@royalmart.demo"
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <span className="pw">
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Demo@123"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        <div className="row">
          <label className="chk">
            <input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} />
            Remember me
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setNote('In Demo Mode all demo accounts use password "Demo@123". Click below to auto-fill.');
            }}
          >
            Forgot password?
          </a>
        </div>

        <button className="btn" disabled={busy}>
          {busy ? 'Authenticating…' : 'Sign in to Store'}
        </button>

        <div className="demo">
          <small>⚡ DEMO ACCOUNTS · CLICK TO QUICK FILL</small>
          <div>
            {DEMO_USERS.map(([n, e, p]) => (
              <button
                type="button"
                key={n}
                onClick={() => {
                  setEmail(e);
                  setPw(p);
                  setErr('');
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </form>

      <aside className="login-side">
        <div>
          <h2>One calm place to run the complete supermarket.</h2>
          <ul>
            <li>High-velocity POS Billing & Barcode Scanning</li>
            <li>Multi-tier Stock & Inventory Audit Ledgers</li>
            <li>Vendor Purchase Orders & GRN Auto-inward</li>
            <li>Smart Insights: Expiry Radar & Dead Stock Detection</li>
            <li>Real-time Indian GST Calculations (CGST/SGST/IGST)</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

const MODS = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['pos', 'POS Billing', ShoppingCart],
  ['products', 'Products', Package],
  ['inventory', 'Inventory', Boxes],
  ['purchases', 'Purchases', Truck],
  ['suppliers', 'Suppliers', Store],
  ['sales', 'Sales & Invoices', Receipt],
  ['customers', 'Customers', Users],
  ['employees', 'Employees', UserCheck],
  ['finance', 'Finance & P&L', Wallet],
  ['insights', 'Smart Insights', Sparkles],
  ['reports', 'Reports', BarChart3],
  ['settings', 'Settings', SettingsIcon]
];

function Shell() {
  const { user, logout, switchRole } = useAuth();
  const nav = useNavigate();
  const { addToast } = useToast();

  const handleQuickSwitch = async (e) => {
    const targetEmail = e.target.value;
    if (!targetEmail || targetEmail === user.email) return;
    try {
      const newUser = await switchRole(targetEmail);
      addToast(`Switched role to ${newUser.name} (${newUser.role})`, 'info');
      nav(newUser.home || '/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <span className="mark">M</span>
          <b>ROYAL MART</b>
        </div>
        <div className="demo-badge-side">
          <ShieldCheck size={13} style={{ marginRight: '4px', color: '#496751' }} /> Demo Mode Active
        </div>

        <nav>
          {MODS.filter(([id]) => can(user, id)).map(([id, label, Icon]) => (
            <NavLink key={id} to={'/' + id}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="who">
          <Store size={15} />
          <div>
            <b>Royal Mart</b>
            <div style={{ fontSize: '10px' }}>Chennai, Tamil Nadu</div>
          </div>
        </div>
      </aside>

      <section className="main">
        <header className="top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              Signed in as <b>{user.name}</b> · <em>{user.role}</em>
            </span>
            <div className="role-switcher">
              <span style={{ fontSize: '11px', color: '#6d756d' }}>Switch Role:</span>
              <select value={user.email} onChange={handleQuickSwitch}>
                {DEMO_USERS.map(([rName, rEmail]) => (
                  <option key={rEmail} value={rEmail}>
                    {rName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

function Page({ id }) {
  switch (id) {
    case 'dashboard':
      return <Dashboard />;
    case 'pos':
      return <Pos />;
    case 'products':
      return <Products />;
    case 'inventory':
      return <Inventory />;
    case 'purchases':
      return <Purchases />;
    case 'suppliers':
      return <Suppliers />;
    case 'sales':
      return <Sales />;
    case 'customers':
      return <Customers />;
    case 'employees':
      return <Employees />;
    case 'finance':
      return <Finance />;
    case 'insights':
      return <SmartInsights />;
    case 'reports':
      return <Reports />;
    case 'settings':
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/forbidden"
            element={
              <div className="splash">
                <h2>Access Restricted</h2>
                <p>Your current role does not have permission to access that module.</p>
                <a href="/dashboard">Return to Dashboard</a>
              </div>
            }
          />
          <Route element={<Guard><Shell /></Guard>}>
            {MODS.map(([id]) => (
              <Route
                key={id}
                path={'/' + id}
                element={
                  <Guard perm={id}>
                    <Page id={id} />
                  </Guard>
                }
              />
            ))}
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return <Navigate to={user ? user.home || '/dashboard' : '/login'} replace />;
}
