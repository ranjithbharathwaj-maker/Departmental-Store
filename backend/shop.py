"""Products, stock, POS sales and dashboard. Every query is scoped to the signed-in user's store_id."""
from decimal import Decimal as D, ROUND_HALF_UP
from typing import Literal
from uuid import UUID
try:
    import psycopg
    UniqueViolation = psycopg.errors.UniqueViolation
except ImportError:
    try:
        import psycopg2 as psycopg
        UniqueViolation = psycopg.errors.UniqueViolation
    except ImportError:
        psycopg = None
        UniqueViolation = Exception
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator
from db import get_db
from main import need, current_user, PERMS

router = APIRouter(prefix="/api")
q2 = lambda x: D(x).quantize(D("0.01"), ROUND_HALF_UP)

def any_of(*ps):
    def dep(u=Depends(current_user)):
        p = PERMS[u["role"]]
        if "*" in p or any(x in p for x in ps):
            return u
        raise HTTPException(403, "Your role does not have access to this action.")
    return dep

# ---------- products ----------
class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    barcode: str | None = None
    sku: str | None = None
    category: str | None = None
    brand: str | None = None
    unit: str = "piece"
    purchase_price: D = Field(ge=0)
    selling_price: D = Field(ge=0)
    mrp: D | None = None
    gst: D = Field(default=0, ge=0, le=28)
    min_stock: D = Field(default=0, ge=0)
    opening_qty: D = Field(default=0, ge=0)

    @field_validator("barcode", "sku", "category", "brand", mode="before")
    @classmethod
    def blank(cls, v):
        return (v.strip() or None) if isinstance(v, str) else v

SORTS = {"name": "p.name", "price": "p.selling_price", "stock": "i.qty"}

@router.get("/products")
def list_products(q: str = "", category: str = "", sort: str = "name", page: int = Query(1, ge=1),
                  size: int = Query(20, ge=1, le=100), archived: bool = False,
                  u=Depends(any_of("products", "pos", "inventory")), db=Depends(get_db)):
    where = """p.store_id=%s and p.is_active=%s and (%s='' or p.name ilike %s or p.barcode=%s or p.sku ilike %s)
               and (%s='' or p.category=%s)"""
    args = (u["store_id"], not archived, q, f"%{q}%", q, f"%{q}%", category, category)
    total = db.execute(f"select count(*) n from products p where {where}", args).fetchone()["n"]
    rows = db.execute(f"""select p.*, i.qty from products p join inventory i on i.product_id=p.id where {where}
                          order by {SORTS.get(sort, 'p.name')} limit %s offset %s""", args + (size, (page - 1) * size)).fetchall()
    return {"items": rows, "total": total, "page": page, "size": size}

COLS = "name,barcode,sku,category,brand,unit,purchase_price,selling_price,mrp,gst,min_stock"

@router.post("/products", status_code=201)
def create_product(b: ProductIn, u=Depends(need("products")), db=Depends(get_db)):
    sid = u["store_id"]
    try:
        p = db.execute(f"insert into products(store_id,{COLS}) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) returning *",
                       (sid, b.name, b.barcode, b.sku, b.category, b.brand, b.unit, b.purchase_price, b.selling_price,
                        b.mrp, b.gst, b.min_stock)).fetchone()
    except UniqueViolation:
        raise HTTPException(409, "A product with this barcode already exists.")
    db.execute("insert into inventory(product_id,store_id,qty) values (%s,%s,%s)", (p["id"], sid, b.opening_qty))
    if b.opening_qty > 0:
        db.execute("""insert into stock_movements(store_id,product_id,movement_type,qty_before,qty_change,qty_after,reason,user_name)
                      values (%s,%s,'opening',0,%s,%s,'Opening stock',%s)""", (sid, p["id"], b.opening_qty, b.opening_qty, u["name"]))
    db.execute("insert into price_history(store_id,product_id,new_purchase,new_selling,changed_by) values (%s,%s,%s,%s,%s)",
               (sid, p["id"], b.purchase_price, b.selling_price, u["name"]))
    return p

@router.put("/products/{pid}")
def update_product(pid: UUID, b: ProductIn, u=Depends(need("products")), db=Depends(get_db)):
    sid = u["store_id"]
    old = db.execute("select * from products where id=%s and store_id=%s for update", (pid, sid)).fetchone()
    if not old:
        raise HTTPException(404, "Product not found.")
    try:
        p = db.execute("""update products set name=%s,barcode=%s,sku=%s,category=%s,brand=%s,unit=%s,purchase_price=%s,selling_price=%s,
                          mrp=%s,gst=%s,min_stock=%s,updated_at=now() where id=%s returning *""",
                       (b.name, b.barcode, b.sku, b.category, b.brand, b.unit, b.purchase_price, b.selling_price, b.mrp, b.gst,
                        b.min_stock, pid)).fetchone()
    except UniqueViolation:
        raise HTTPException(409, "A product with this barcode already exists.")
    if old["purchase_price"] != b.purchase_price or old["selling_price"] != b.selling_price:
        db.execute("""insert into price_history(store_id,product_id,old_purchase,new_purchase,old_selling,new_selling,changed_by)
                      values (%s,%s,%s,%s,%s,%s,%s)""", (sid, pid, old["purchase_price"], b.purchase_price, old["selling_price"], b.selling_price, u["name"]))
    return p

@router.post("/products/{pid}/archive")
def archive_product(pid: UUID, u=Depends(need("products")), db=Depends(get_db)):
    r = db.execute("update products set is_active=false,updated_at=now() where id=%s and store_id=%s returning id", (pid, u["store_id"])).fetchone()
    if not r:
        raise HTTPException(404, "Product not found.")
    return {"archived": True}

@router.get("/products/{pid}/history")
def price_history(pid: UUID, u=Depends(any_of("products")), db=Depends(get_db)):
    return db.execute("select * from price_history where product_id=%s and store_id=%s order by id desc", (pid, u["store_id"])).fetchall()

# ---------- stock ----------
class Adjust(BaseModel):
    product_id: UUID
    new_qty: D = Field(ge=0)
    reason: str = Field(min_length=1, max_length=200)

@router.post("/stock/adjust")
def adjust_stock(b: Adjust, u=Depends(any_of("inventory")), db=Depends(get_db)):
    sid = u["store_id"]
    r = db.execute("select qty from inventory where product_id=%s and store_id=%s for update", (b.product_id, sid)).fetchone()
    if not r:
        raise HTTPException(404, "Product not found.")
    db.execute("update inventory set qty=%s,updated_at=now() where product_id=%s", (b.new_qty, b.product_id))
    db.execute("""insert into stock_movements(store_id,product_id,movement_type,qty_before,qty_change,qty_after,reason,user_name)
                  values (%s,%s,'adjustment',%s,%s,%s,%s,%s)""", (sid, b.product_id, r["qty"], b.new_qty - r["qty"], b.new_qty, b.reason, u["name"]))
    return {"qty": b.new_qty}

@router.get("/stock/movements")
def movements(product_id: UUID | None = None, page: int = Query(1, ge=1), u=Depends(any_of("inventory")), db=Depends(get_db)):
    return db.execute("""select m.*, p.name product from stock_movements m join products p on p.id=m.product_id
                         where m.store_id=%s and (%s::uuid is null or m.product_id=%s) order by m.id desc limit 25 offset %s""",
                      (u["store_id"], product_id, product_id, (page - 1) * 25)).fetchall()

# ---------- POS: pricing is always computed here, never trusted from the browser ----------
class Line(BaseModel):
    product_id: UUID
    qty: D = Field(gt=0)
    discount_pct: D = Field(default=0, ge=0, le=100)

class Cart(BaseModel):
    items: list[Line] = Field(min_length=1)
    bill_discount: D = Field(default=0, ge=0)
    interstate: bool = False  # True -> IGST instead of CGST+SGST

class Pay(BaseModel):
    method: Literal["cash", "upi", "debit", "credit"]
    amount: D = Field(gt=0)

class SaleIn(Cart):
    payments: list[Pay] = Field(min_length=1)
    customer_name: str | None = None
    customer_mobile: str | None = None

def price_cart(db, sid, cart, lock=False):
    ids = sorted({str(l.product_id) for l in cart.items})
    rows = db.execute("""select p.id,p.name,p.selling_price,p.purchase_price,p.gst,i.qty from products p join inventory i on i.product_id=p.id
                         where p.store_id=%s and p.is_active and p.id=any(%s::uuid[]) order by p.id""" + (" for update of i" if lock else ""),
                      (sid, ids)).fetchall()
    by, want = {str(r["id"]): r for r in rows}, {}
    for l in cart.items:
        if str(l.product_id) not in by:
            raise HTTPException(404, "A product in the cart is not available.")
        want[str(l.product_id)] = want.get(str(l.product_id), 0) + l.qty
    for k, n in want.items():
        if n > by[k]["qty"]:
            raise HTTPException(409, f"Only {by[k]['qty'].normalize():f} of {by[k]['name']} in stock.")
    after = [q2(by[str(l.product_id)]["selling_price"] * l.qty * (D(100) - l.discount_pct) / 100) for l in cart.items]
    sub = sum(after)
    if cart.bill_discount > sub:
        raise HTTPException(422, "Bill discount cannot exceed the bill total.")
    lines, t = [], dict(cgst=D(0), sgst=D(0), igst=D(0), taxable=D(0))
    for l, a in zip(cart.items, after):
        r = by[str(l.product_id)]
        tot = q2(a - (cart.bill_discount * a / sub if sub else 0))
        tax = tot - q2(tot * 100 / (100 + r["gst"]))
        cg = D(0) if cart.interstate else q2(tax / 2)
        sg = D(0) if cart.interstate else tax - cg
        ig = tax if cart.interstate else D(0)
        ln = dict(product_id=r["id"], name=r["name"], qty=l.qty, unit_price=r["selling_price"], discount_pct=l.discount_pct,
                  discount=q2(r["selling_price"] * l.qty) - tot, taxable=tot - tax, cgst=cg, sgst=sg, igst=ig, total=tot, cost=r["purchase_price"])
        lines.append(ln)
        for k in t: t[k] += ln[k]
    raw = sum(x["total"] for x in lines)
    pay = q2(raw.quantize(D("1"), ROUND_HALF_UP))
    gross = sum(q2(by[str(l.product_id)]["selling_price"] * l.qty) for l in cart.items)
    return dict(lines=lines, subtotal=gross, discount=gross - raw, round_off=pay - raw, total=pay, **{k: q2(v) for k, v in t.items()})

@router.post("/sales/quote")
def quote(b: Cart, u=Depends(any_of("pos")), db=Depends(get_db)):
    return price_cart(db, u["store_id"], b)

def sale_detail(db, sid, sale_id):
    s = db.execute("""select s.*, st.name store_name, st.address store_address, st.gstin store_gstin from sales s
                      join stores st on st.id=s.store_id where s.id=%s and s.store_id=%s""", (sale_id, sid)).fetchone()
    if not s:
        raise HTTPException(404, "Invoice not found.")
    s["items"] = db.execute("select * from sale_items where sale_id=%s order by id", (sale_id,)).fetchall()
    s["payments"] = db.execute("select method,amount from sale_payments where sale_id=%s order by id", (sale_id,)).fetchall()
    return s

@router.post("/sales", status_code=201)
def create_sale(b: SaleIn, u=Depends(any_of("pos")), db=Depends(get_db)):
    sid = u["store_id"]
    t = price_cart(db, sid, b, lock=True)  # locks the stock rows until commit
    paid = q2(sum(p.amount for p in b.payments))
    if paid != t["total"]:
        raise HTTPException(422, f"Payments total {paid} must equal the payable amount {t['total']}.")
    n = db.execute("""insert into invoice_counters(store_id,last_no) values (%s,1) on conflict (store_id)
                      do update set last_no=invoice_counters.last_no+1 returning last_no""", (sid,)).fetchone()["last_no"]
    inv = f"INV-{n:06d}"
    s = db.execute("""insert into sales(store_id,invoice_no,cashier,customer_name,customer_mobile,subtotal,discount,taxable,cgst,sgst,igst,round_off,total)
                      values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) returning id""",
                   (sid, inv, u["name"], b.customer_name, b.customer_mobile, t["subtotal"], t["discount"], t["taxable"], t["cgst"],
                    t["sgst"], t["igst"], t["round_off"], t["total"])).fetchone()
    for l in t["lines"]:
        db.execute("""insert into sale_items(sale_id,store_id,product_id,name,qty,unit_price,discount,taxable,cgst,sgst,igst,total,cost_price)
                      values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                   (s["id"], sid, l["product_id"], l["name"], l["qty"], l["unit_price"], l["discount"], l["taxable"], l["cgst"], l["sgst"], l["igst"], l["total"], l["cost"]))
        aft = db.execute("update inventory set qty=qty-%s,updated_at=now() where product_id=%s and store_id=%s returning qty",
                         (l["qty"], l["product_id"], sid)).fetchone()["qty"]
        db.execute("""insert into stock_movements(store_id,product_id,movement_type,qty_before,qty_change,qty_after,reason,ref,user_name)
                      values (%s,%s,'sale',%s,%s,%s,'Sale',%s,%s)""", (sid, l["product_id"], aft + l["qty"], -l["qty"], aft, inv, u["name"]))
    for p in b.payments:
        db.execute("insert into sale_payments(sale_id,store_id,method,amount) values (%s,%s,%s,%s)", (s["id"], sid, p.method, p.amount))
    return sale_detail(db, sid, s["id"])

@router.get("/sales")
def list_sales(q: str = "", page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), u=Depends(any_of("sales", "pos")), db=Depends(get_db)):
    args = (u["store_id"], q, f"%{q}%", f"%{q}%")
    w = "store_id=%s and (%s='' or invoice_no ilike %s or customer_name ilike %s)"
    total = db.execute(f"select count(*) n from sales where {w}", args).fetchone()["n"]
    rows = db.execute(f"select * from sales where {w} order by created_at desc limit %s offset %s", args + (size, (page - 1) * size)).fetchall()
    return {"items": rows, "total": total}

@router.get("/sales/{sale_id}")
def get_sale(sale_id: UUID, u=Depends(any_of("sales", "pos")), db=Depends(get_db)):
    return sale_detail(db, u["store_id"], sale_id)

# ---------- dashboard (live database figures) ----------
@router.get("/dashboard")
def dashboard(days: int = Query(1, ge=1, le=366), u=Depends(any_of("dashboard")), db=Depends(get_db)):
    sid = u["store_id"]
    s = db.execute("""select coalesce(sum(total),0) sales, count(*) transactions from sales
                      where store_id=%s and status='completed' and created_at::date > current_date - %s""", (sid, days)).fetchone()
    gp = db.execute("""select coalesce(sum(si.taxable - si.cost_price*si.qty),0) gp from sale_items si join sales s on s.id=si.sale_id
                       where s.store_id=%s and s.status='completed' and s.created_at::date > current_date - %s""", (sid, days)).fetchone()["gp"]
    k = db.execute("""select count(*) products, coalesce(sum(i.qty*p.purchase_price),0) stock_value,
                      count(*) filter (where i.qty <= p.min_stock) low_stock from products p join inventory i on i.product_id=p.id
                      where p.store_id=%s and p.is_active""", (sid,)).fetchone()
    return {**s, "gross_profit": gp, **k}

# ---------- Excel Export (openpyxl) ----------
import io, re
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from fastapi.responses import StreamingResponse

def build_excel_response(module_name: str, store_name: str, columns: list, rows: list, totals: dict = None):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = module_name.capitalize()[:31]

    # Freeze header row
    ws.freeze_panes = "A2"

    # Header style: theme green fill (#294638) with bold white text
    header_fill = PatternFill(start_color="294638", end_color="294638", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_align = Alignment(horizontal="left", vertical="center", wrap_text=False)

    for col_idx, col in enumerate(columns, 1):
        cell = ws.cell(row=1, column=col_idx, value=col["header"])
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_align
    ws.row_dimensions[1].height = 26

    # Data rows
    for row_idx, r in enumerate(rows, 2):
        ws.row_dimensions[row_idx].height = 20
        for col_idx, col in enumerate(columns, 1):
            val = r.get(col["key"])
            cell = ws.cell(row=row_idx, column=col_idx)
            if col.get("format") in ("currency", "number"):
                cell.value = float(val) if val is not None else 0.0
                cell.number_format = '"₹"#,##0.00' if col.get("format") == "currency" else '#,##0.00'
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif col.get("format") == "integer":
                cell.value = int(val) if val is not None else 0
                cell.number_format = '#,##0'
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif col.get("format") == "date" and val:
                cell.value = str(val)[:19]
                cell.alignment = Alignment(horizontal="left", vertical="center")
            else:
                cell.value = str(val) if val is not None else ""
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Totals row if provided
    if totals and rows:
        tot_row_idx = len(rows) + 2
        ws.row_dimensions[tot_row_idx].height = 24
        tot_fill = PatternFill(start_color="E9EFE8", end_color="E9EFE8", fill_type="solid")
        tot_font = Font(name="Segoe UI", size=11, bold=True, color="294638")
        top_border = Side(style="thin", color="496751")
        bottom_border = Side(style="double", color="294638")
        cell_border = Border(top=top_border, bottom=bottom_border)

        for col_idx, col in enumerate(columns, 1):
            cell = ws.cell(row=tot_row_idx, column=col_idx)
            cell.fill = tot_fill
            cell.font = tot_font
            cell.border = cell_border
            if col["key"] == totals.get("label_col", columns[0]["key"]):
                cell.value = "TOTAL"
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif col["key"] in totals.get("sum_cols", []):
                s = sum(float(r.get(col["key"]) or 0) for r in rows)
                cell.value = s
                cell.number_format = '"₹"#,##0.00' if col.get("format") == "currency" else '#,##0.00'
                cell.alignment = Alignment(horizontal="right", vertical="center")

    # Auto-filter
    ws.auto_filter.ref = ws.dimensions

    # Auto column width
    for col_idx, col in enumerate(columns, 1):
        letter = get_column_letter(col_idx)
        max_len = max([len(str(ws.cell(row=r, column=col_idx).value or '')) for r in range(1, ws.max_row + 1)] or [10])
        ws.column_dimensions[letter].width = min(max(max_len + 4, 14), 45)

    stream = io.BytesIO()
    wb.save(stream)
    excel_bytes = stream.getvalue()

    clean_store = re.sub(r'[^a-z0-9]+', '-', store_name.lower()).strip('-') or 'store'
    clean_module = re.sub(r'[^a-z0-9]+', '-', module_name.lower()).strip('-')
    filename = f"{clean_module}-{clean_store}-{datetime.now().strftime('%Y-%m-%d')}.xlsx"

    from fastapi.responses import Response
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/products/export-excel")
def export_products_excel(q: str = "", category: str = "", sort: str = "name", archived: bool = False,
                          u=Depends(any_of("products")), db=Depends(get_db)):
    where = """p.store_id=%s and p.is_active=%s and (%s='' or p.name ilike %s or p.barcode=%s or p.sku ilike %s)
               and (%s='' or p.category=%s)"""
    args = (u["store_id"], not archived, q, f"%{q}%", q, f"%{q}%", category, category)
    rows = db.execute(f"""select p.*, i.qty, (i.qty * p.purchase_price) stock_value
                          from products p join inventory i on i.product_id=p.id where {where}
                          order by {SORTS.get(sort, 'p.name')}""", args).fetchall()
    cols = [
        {"header": "Product Name", "key": "name"},
        {"header": "Barcode", "key": "barcode"},
        {"header": "SKU", "key": "sku"},
        {"header": "Category", "key": "category"},
        {"header": "Brand", "key": "brand"},
        {"header": "Unit", "key": "unit"},
        {"header": "Stock Qty", "key": "qty", "format": "number"},
        {"header": "Purchase Price (₹)", "key": "purchase_price", "format": "currency"},
        {"header": "Selling Price (₹)", "key": "selling_price", "format": "currency"},
        {"header": "MRP (₹)", "key": "mrp", "format": "currency"},
        {"header": "GST %", "key": "gst", "format": "number"},
        {"header": "Stock Valuation (₹)", "key": "stock_value", "format": "currency"}
    ]
    totals = {"label_col": "name", "sum_cols": ["qty", "stock_value"]}
    return build_excel_response("products", u.get("store", "store"), cols, rows, totals)

@router.get("/sales/export-excel")
def export_sales_excel(q: str = "", u=Depends(any_of("sales", "pos")), db=Depends(get_db)):
    args = (u["store_id"], q, f"%{q}%", f"%{q}%")
    w = "store_id=%s and (%s='' or invoice_no ilike %s or customer_name ilike %s)"
    rows = db.execute(f"select * from sales where {w} order by created_at desc", args).fetchall()
    cols = [
        {"header": "Invoice No", "key": "invoice_no"},
        {"header": "Date & Time", "key": "created_at", "format": "date"},
        {"header": "Cashier", "key": "cashier"},
        {"header": "Customer", "key": "customer_name"},
        {"header": "Customer Mobile", "key": "customer_mobile"},
        {"header": "Subtotal (₹)", "key": "subtotal", "format": "currency"},
        {"header": "Discount (₹)", "key": "discount", "format": "currency"},
        {"header": "Taxable (₹)", "key": "taxable", "format": "currency"},
        {"header": "CGST (₹)", "key": "cgst", "format": "currency"},
        {"header": "SGST (₹)", "key": "sgst", "format": "currency"},
        {"header": "IGST (₹)", "key": "igst", "format": "currency"},
        {"header": "Round Off (₹)", "key": "round_off", "format": "currency"},
        {"header": "Net Total (₹)", "key": "total", "format": "currency"},
        {"header": "Status", "key": "status"}
    ]
    totals = {"label_col": "invoice_no", "sum_cols": ["taxable", "cgst", "sgst", "igst", "total"]}
    return build_excel_response("sales", u.get("store", "store"), cols, rows, totals)
