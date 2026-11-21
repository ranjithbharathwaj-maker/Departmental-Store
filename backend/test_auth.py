from fastapi.testclient import TestClient
from main import app
c = TestClient(app)
def tok(e, p): return c.post("/api/auth/login", json={"email": e, "password": p})
def H(t): return {"Authorization": "Bearer " + t}
def test_flows():
    assert tok("owner@merchant.demo", "wrong").status_code == 401
    r = tok("cashier@merchant.demo", "Cashier@123"); assert r.status_code == 200 and r.json()["user"]["home"] == "/pos"
    t = r.json()["token"]
    assert c.get("/api/module/pos", headers=H(t)).status_code == 200
    assert c.get("/api/module/finance", headers=H(t)).status_code == 403   # cashier blocked
    assert c.get("/api/module/pos").status_code == 401                      # no login
    o = tok("owner@merchant.demo", "Owner@123").json()["token"]
    assert c.get("/api/module/finance", headers=H(o)).status_code == 200
    for _ in range(5): tok("stock@merchant.demo", "bad")
    assert tok("stock@merchant.demo", "Stock@123").status_code == 429        # rate limit
