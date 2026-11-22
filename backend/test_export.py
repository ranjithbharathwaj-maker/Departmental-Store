import io
import openpyxl
import main  # Ensure main initializes shop.router first
from shop import build_excel_response

def test_build_excel_response():
    columns = [
        {"header": "Item Name", "key": "name"},
        {"header": "Quantity", "key": "qty", "format": "number"},
        {"header": "Rate", "key": "rate", "format": "currency"}
    ]
    rows = [
        {"name": "Ponni Boiled Rice 5kg", "qty": 15, "rate": 340.00},
        {"name": "Aashirvaad Atta 5kg", "qty": 10, "rate": 275.50}
    ]
    totals = {"label_col": "name", "sum_cols": ["qty", "rate"]}

    response = build_excel_response("products", "Royal Mart", columns, rows, totals)
    assert response.media_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "Content-Disposition" in response.headers
    assert "products-royal-mart-" in response.headers["Content-Disposition"]
    assert response.headers["Content-Disposition"].endswith('.xlsx"')

    # Read response body and parse with openpyxl
    content = response.body
    wb = openpyxl.load_workbook(io.BytesIO(content))
    assert "Products" in wb.sheetnames
    ws = wb["Products"]

    # Verify headers
    headers = [cell.value for cell in ws[1]]
    assert headers == ["Item Name", "Quantity", "Rate"]

    # Verify theme green fill on header
    assert ws["A1"].fill.start_color.rgb == "00294638" or ws["A1"].fill.start_color.rgb == "294638"

    # Verify row count (1 header + 2 data + 1 totals = 4 rows)
    assert ws.max_row == 4
    assert ws.cell(row=2, column=1).value == "Ponni Boiled Rice 5kg"
    assert ws.cell(row=4, column=1).value == "TOTAL"
    assert ws.cell(row=4, column=2).value == 25.0
    assert ws.cell(row=4, column=3).value == 615.5
