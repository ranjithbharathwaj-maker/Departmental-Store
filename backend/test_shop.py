import os, uuid, pytest
from fastapi.testclient import TestClient
from main import app
pytestmark = pytest.mark.skipif(not os.getenv("DATABASE_URL"), reason="no database available")
c = TestClient(app)
def login(e, p): return {"Authorization": "Bearer " + c.post("/api/auth/login", json={"email": e, "password": p}).json()["token"]}
def dash(h): return {k: float(v) for k, v in c.get("/api/dashboard?days=1", headers=h).json().items()}

def test_product_to_sale_stock_profit_isolation():
    own, cash, o2 = login("owner@merchant.demo", "Owner@123"), login("cashier@merchant.demo", "Cashier@123"), login("other@store2.demo", "Other@123")
    bc = uuid.uuid4().hex[:12]
    body = dict(name="Test Biscuit", barcode=bc, category="Snacks", purchase_price=80, selling_price=118, gst=18, min_stock=2, opening_qty=10)
    assert c.post("/api/products", json=body, headers=cash).status_code == 403          # cashier cannot create products
    r = c.post("/api/products", json=body, headers=own); assert r.status_code == 201; pid = r.json()["id"]
    assert c.post("/api/products", json=body, headers=own).status_code == 409           # duplicate barcode
    assert c.post("/api/products", json={**body, "name": ""}, headers=own).status_code == 422
    d0 = dash(own)
    cart = dict(items=[dict(product_id=pid, qty=2)])
    q = c.post("/api/sales/quote", json=cart, headers=cash).json()
    assert float(q["total"]) == 236 and float(q["cgst"]) == 18 and float(q["sgst"]) == 18  # GST computed by backend
    assert c.post("/api/sales", json={**cart, "payments": [{"method": "cash", "amount": 100}]}, headers=cash).status_code == 422
    over = dict(items=[dict(product_id=pid, qty=99)], payments=[{"method": "cash", "amount": 1}])
    assert c.post("/api/sales", json=over, headers=cash).status_code == 409             # no overselling
    r = c.post("/api/sales", json={**cart, "payments": [{"method": "cash", "amount": 136}, {"method": "upi", "amount": 100}]}, headers=cash)
    assert r.status_code == 201; sale = r.json(); assert sale["invoice_no"].startswith("INV-") and len(sale["payments"]) == 2
    assert float(c.get("/api/products?q=" + bc, headers=own).json()["items"][0]["qty"]) == 8   # stock deducted once; failed attempts left no trace
    mv = c.get(f"/api/stock/movements?product_id={pid}", headers=own).json()
    assert [m["movement_type"] for m in mv] == ["sale", "opening"]
    d1 = dash(own)
    assert d1["sales"] - d0["sales"] == 236 and d1["transactions"] - d0["transactions"] == 1
    assert d1["gross_profit"] - d0["gross_profit"] == 40                                 # taxable 200 - cost 160
    assert c.get("/api/products?q=" + bc, headers=o2).json()["total"] == 0               # tenant isolation
    assert c.get("/api/sales/" + sale["id"], headers=o2).status_code == 404
    assert c.post("/api/sales", json=cart | {"payments": [{"method": "cash", "amount": 236}]}, headers=o2).status_code == 404
    c.put(f"/api/products/{pid}", json={**body, "selling_price": 125}, headers=own)
    assert len(c.get(f"/api/products/{pid}/history", headers=own).json()) == 2           # price change preserved
    assert c.post("/api/stock/adjust", json=dict(product_id=pid, new_qty=-1, reason="x"), headers=own).status_code == 422
    assert c.post("/api/stock/adjust", json=dict(product_id=pid, new_qty=5, reason="Stock count correction"), headers=own).status_code == 200
    assert c.post(f"/api/products/{pid}/archive", headers=own).status_code == 200
    assert c.get("/api/products?q=" + bc, headers=cash).json()["total"] == 0             # archived products leave POS
    assert c.get("/api/sales/" + sale["id"], headers=own).status_code == 200            # history survives archiving
