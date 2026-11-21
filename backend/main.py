"""Merchant API. Demo mode: built-in accounts. Supabase wiring comes in the next step."""
import os, time, hmac, hashlib, jwt
from collections import defaultdict
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SECRET = os.getenv("JWT_SECRET", "dev-only-change-me")
app = FastAPI(title="Merchant API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
                   allow_methods=["*"], allow_headers=["*"])

def _hash(pw: str, salt: bytes = b"merchant-demo") -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 120_000).hex()

PERMS = {
    "owner": ["*"],
    "manager": ["dashboard", "products", "inventory", "purchases", "sales", "customers", "reports"],
    "cashier": ["pos", "customers", "sales"],
    "inventory": ["inventory", "products", "purchases"],
    "accountant": ["finance", "reports", "sales"],
}
HOME = {"owner": "/dashboard", "manager": "/dashboard", "cashier": "/pos", "inventory": "/inventory", "accountant": "/finance"}
DEMO = [  # (email, password, name, role)
    ("owner@merchant.demo", "Owner@123", "Anita Raman", "owner"),
    ("manager@merchant.demo", "Manager@123", "Karthik Subbu", "manager"),
    ("cashier@merchant.demo", "Cashier@123", "Priya Nair", "cashier"),
    ("stock@merchant.demo", "Stock@123", "Imran Sheikh", "inventory"),
    ("accounts@merchant.demo", "Accounts@123", "Meera Iyer", "accountant"),
]
STORE1, STORE2 = "11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"
USERS = {e: dict(email=e, pw=_hash(p), name=n, role=r, store="Sunrise Departmental Store", store_id=STORE1, active=True) for e, p, n, r in DEMO}
USERS["other@store2.demo"] = dict(email="other@store2.demo", pw=_hash("Other@123"), name="Rahul Mehta", role="owner",
                                  store="Lakshmi Supermart", store_id=STORE2, active=True)  # second tenant, for isolation tests
FAILS: dict = defaultdict(list)

def public(u):
    return dict(email=u["email"], name=u["name"], role=u["role"], store=u["store"],
                permissions=PERMS[u["role"]], home=HOME[u["role"]])

class Login(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(b: Login):
    key, now = b.email.strip().lower(), time.time()
    FAILS[key] = [t for t in FAILS[key] if now - t < 300]
    if len(FAILS[key]) >= 5:
        raise HTTPException(429, "Too many attempts. Try again in a few minutes.")
    u = USERS.get(key)
    if not u or not hmac.compare_digest(u["pw"], _hash(b.password)):
        FAILS[key].append(now)
        raise HTTPException(401, "Incorrect email or password.")
    if not u["active"]:
        raise HTTPException(403, "This account has been deactivated. Contact the store owner.")
    FAILS.pop(key, None)
    token = jwt.encode({"sub": key, "exp": now + 8 * 3600}, SECRET, algorithm="HS256")
    return {"token": token, "user": public(u)}

def current_user(authorization: str = Header(default="")):
    try:
        sub = jwt.decode(authorization.removeprefix("Bearer "), SECRET, algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Session expired. Please sign in again.")
    u = USERS.get(sub)
    if not u or not u["active"]:
        raise HTTPException(401, "Account unavailable.")
    return u

def need(perm: str):
    def dep(u=Depends(current_user)):
        if "*" not in PERMS[u["role"]] and perm not in PERMS[u["role"]]:
            raise HTTPException(403, "Your role does not have access to this module.")
        return u
    return dep

@app.get("/api/auth/me")
def me(u=Depends(current_user)):
    return public(u)

@app.get("/api/module/{name}")
def module(name: str, u=Depends(current_user)):
    need(name)(u)
    return {"module": name, "user": u["name"], "role": u["role"], "message": "Access granted by the server."}

from shop import router  # noqa: E402
app.include_router(router)
