// Realistic Indian Departmental Store Seed Data for "Royal Mart" (Chennai, Tamil Nadu)

export const STORE_INFO = {
  name: "Royal Mart",
  tagline: "Your Neighbourhood Superstore",
  address: "42, Anna Salai, T. Nagar, Chennai - 600017, Tamil Nadu",
  phone: "+91 98401 23456",
  email: "contact@royalmart.chennai.in",
  gstin: "33AAAAA0000A1Z5",
  state: "Tamil Nadu",
  state_code: "33",
  currency: "INR",
  currency_symbol: "₹",
  invoice_prefix: "INV-",
  invoice_terms: "Thank you for shopping at Royal Mart! Goods once sold can be exchanged within 7 days with original invoice.",
};

export const DEMO_ACCOUNTS = [
  {
    email: "owner@royalmart.demo",
    password: "Demo@123",
    name: "Rajendran Sundaram",
    role: "owner",
    phone: "+91 98401 11001",
    store: "Royal Mart",
    permissions: ["*"],
    home: "/dashboard"
  },
  {
    email: "manager@royalmart.demo",
    password: "Demo@123",
    name: "Venkatesh Rao",
    role: "manager",
    phone: "+91 98401 11002",
    store: "Royal Mart",
    permissions: ["dashboard", "pos", "products", "inventory", "purchases", "suppliers", "sales", "customers", "insights", "reports"],
    home: "/dashboard"
  },
  {
    email: "cashier@royalmart.demo",
    password: "Demo@123",
    name: "Ananya Iyer",
    role: "cashier",
    phone: "+91 98401 11003",
    store: "Royal Mart",
    permissions: ["pos", "customers", "sales"],
    home: "/pos"
  },
  {
    email: "inventory@royalmart.demo",
    password: "Demo@123",
    name: "Murugan Pillai",
    role: "inventory",
    phone: "+91 98401 11004",
    store: "Royal Mart",
    permissions: ["inventory", "products", "purchases", "suppliers", "insights"],
    home: "/inventory"
  },
  {
    email: "accountant@royalmart.demo",
    password: "Demo@123",
    name: "Sowmya Krishnan",
    role: "accountant",
    phone: "+91 98401 11005",
    store: "Royal Mart",
    permissions: ["finance", "reports", "sales", "purchases", "insights"],
    home: "/finance"
  },
  // Backwards compatible aliases
  {
    email: "owner@merchant.demo",
    password: "Owner@123",
    name: "Anita Raman",
    role: "owner",
    phone: "+91 98401 11001",
    store: "Royal Mart",
    permissions: ["*"],
    home: "/dashboard"
  },
  {
    email: "manager@merchant.demo",
    password: "Manager@123",
    name: "Karthik Subbu",
    role: "manager",
    phone: "+91 98401 11002",
    store: "Royal Mart",
    permissions: ["dashboard", "pos", "products", "inventory", "purchases", "suppliers", "sales", "customers", "insights", "reports"],
    home: "/dashboard"
  },
  {
    email: "cashier@merchant.demo",
    password: "Cashier@123",
    name: "Priya Nair",
    role: "cashier",
    phone: "+91 98401 11003",
    store: "Royal Mart",
    permissions: ["pos", "customers", "sales"],
    home: "/pos"
  },
  {
    email: "stock@merchant.demo",
    password: "Stock@123",
    name: "Imran Sheikh",
    role: "inventory",
    phone: "+91 98401 11004",
    store: "Royal Mart",
    permissions: ["inventory", "products", "purchases", "suppliers", "insights"],
    home: "/inventory"
  },
  {
    email: "accounts@merchant.demo",
    password: "Accounts@123",
    name: "Meera Iyer",
    role: "accountant",
    phone: "+91 98401 11005",
    store: "Royal Mart",
    permissions: ["finance", "reports", "sales", "purchases", "insights"],
    home: "/finance"
  }
];

export const CATEGORIES = [
  "Groceries",
  "Beverages",
  "Dairy Products",
  "Snacks & Biscuits",
  "Personal Care",
  "Home Cleaning",
  "Household & Essentials",
  "Stationery",
  "Packaged Foods",
  "Fruits & Vegetables"
];

export const SUPPLIERS = [
  {
    id: "sup-001",
    name: "Chennai Mega Traders",
    contact_person: "S. Ramanathan",
    phone: "+91 98410 98765",
    email: "sales@chennaimega.com",
    gstin: "33AAACM1234F1Z1",
    address: "12, Koyambedu Wholesale Market, Chennai - 600092",
    category: "Groceries",
    balance: 14500.00,
    created_at: "2026-01-10T09:00:00Z"
  },
  {
    id: "sup-002",
    name: "Tamil Nadu Dairy Co-op",
    contact_person: "M. Saravanan",
    phone: "+91 98411 87654",
    email: "supply@tndairy.org",
    gstin: "33AAACT5678B1Z2",
    address: "Pasumai Illam, Nandanam, Chennai - 600035",
    category: "Dairy Products",
    balance: 8200.00,
    created_at: "2026-01-12T10:30:00Z"
  },
  {
    id: "sup-003",
    name: "ITC Distributors Chennai",
    contact_person: "K. Vijayakumar",
    phone: "+91 98412 76543",
    email: "itc.dist@chennaifmcg.in",
    gstin: "33AAACI9012K1Z3",
    address: "78, Mount Road, Guindy, Chennai - 600032",
    category: "Snacks & Biscuits",
    balance: 22400.00,
    created_at: "2026-01-15T11:00:00Z"
  },
  {
    id: "sup-004",
    name: "Hindustan FMCG Logistics",
    contact_person: "G. Venkatesh",
    phone: "+91 98413 65432",
    email: "logistics@hulfmcg.com",
    gstin: "33AAACH3456L1Z4",
    address: "Plot 45, Ambattur Industrial Estate, Chennai - 600058",
    category: "Home Cleaning",
    balance: 18900.00,
    created_at: "2026-01-18T14:00:00Z"
  },
  {
    id: "sup-005",
    name: "Madurai Grain Mills",
    contact_person: "A. Pandian",
    phone: "+91 98414 54321",
    email: "maduraigrains@agrilink.in",
    gstin: "33AAACM7890M1Z5",
    address: "5, Grain Market Road, Madurai - 625001",
    category: "Groceries",
    balance: 31000.00,
    created_at: "2026-01-20T08:30:00Z"
  },
  {
    id: "sup-006",
    name: "Southern Spices Ltd",
    contact_person: "R. Sundaram",
    phone: "+91 98415 43210",
    email: "orders@southernspices.com",
    gstin: "33AAACS1122N1Z6",
    address: "89, George Town, Broadway, Chennai - 600001",
    category: "Groceries",
    balance: 6750.00,
    created_at: "2026-01-22T09:45:00Z"
  },
  {
    id: "sup-007",
    name: "Coimbatore Agro Produce",
    contact_person: "C. Balakrishnan",
    phone: "+91 98416 32109",
    email: "agro@coimbatoreproduce.in",
    gstin: "33AAACC3344P1Z7",
    address: "24, Mettupalayam Road, Coimbatore - 641011",
    category: "Fruits & Vegetables",
    balance: 5200.00,
    created_at: "2026-01-25T11:15:00Z"
  },
  {
    id: "sup-008",
    name: "Coromandel Home Essentials",
    contact_person: "D. Jayakumar",
    phone: "+91 98417 21098",
    email: "sales@coromandelessentials.com",
    gstin: "33AAACC5566Q1Z8",
    address: "31, GST Road, Chromepet, Chennai - 600044",
    category: "Household & Essentials",
    balance: 12100.00,
    created_at: "2026-01-28T13:00:00Z"
  },
  {
    id: "sup-009",
    name: "Madras Stationery World",
    contact_person: "P. Muralidharan",
    phone: "+91 98418 10987",
    email: "trade@madrasstationery.in",
    gstin: "33AAACM7788R1Z9",
    address: "102, Triplicane High Road, Chennai - 600005",
    category: "Stationery",
    balance: 4300.00,
    created_at: "2026-02-01T10:00:00Z"
  },
  {
    id: "sup-010",
    name: "Kaveri Organics Wholesale",
    contact_person: "N. Selvaraj",
    phone: "+91 98419 09876",
    email: "info@kaveriorganics.in",
    gstin: "33AAACK9900S1Z0",
    address: "18, East Coast Road, Thiruvanmiyur, Chennai - 600041",
    category: "Beverages",
    balance: 9800.00,
    created_at: "2026-02-05T15:20:00Z"
  }
];

export const PRODUCTS = [
  // 1. Groceries (10 items)
  {
    id: "prod-001",
    name: "Fortune Sunlite Sunflower Oil 1L",
    barcode: "8906007281011",
    sku: "GRO-OIL-001",
    category: "Groceries",
    brand: "Fortune",
    unit: "litre",
    purchase_price: 132.00,
    selling_price: 155.00,
    mrp: 170.00,
    gst: 5,
    qty: 48,
    min_stock: 15,
    expiry_date: "2027-04-15",
    batch_no: "B-2601",
    supplier_id: "sup-001",
    is_active: true
  },
  {
    id: "prod-002",
    name: "India Gate Classic Basmati Rice 5kg",
    barcode: "8901112223012",
    sku: "GRO-RIC-002",
    category: "Groceries",
    brand: "India Gate",
    unit: "bag",
    purchase_price: 520.00,
    selling_price: 610.00,
    mrp: 660.00,
    gst: 0,
    qty: 24,
    min_stock: 8,
    expiry_date: "2027-08-20",
    batch_no: "B-2602",
    supplier_id: "sup-005",
    is_active: true
  },
  {
    id: "prod-003",
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    barcode: "8901030383023",
    sku: "GRO-ATT-003",
    category: "Groceries",
    brand: "Aashirvaad",
    unit: "bag",
    purchase_price: 235.00,
    selling_price: 275.00,
    mrp: 295.00,
    gst: 0,
    qty: 35,
    min_stock: 10,
    expiry_date: "2026-12-10",
    batch_no: "B-2603",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-004",
    name: "Tata Salt Vacuum Evaporated 1kg",
    barcode: "8901058852331",
    sku: "GRO-SLT-004",
    category: "Groceries",
    brand: "Tata",
    unit: "pack",
    purchase_price: 21.00,
    selling_price: 28.00,
    mrp: 30.00,
    gst: 0,
    qty: 85,
    min_stock: 20,
    expiry_date: "2028-01-01",
    batch_no: "B-2604",
    supplier_id: "sup-001",
    is_active: true
  },
  {
    id: "prod-005",
    name: "24 Mantra Organic Toor Dal 1kg",
    barcode: "8904083501254",
    sku: "GRO-DAL-005",
    category: "Groceries",
    brand: "24 Mantra",
    unit: "pack",
    purchase_price: 155.00,
    selling_price: 185.00,
    mrp: 199.00,
    gst: 0,
    qty: 3, // LOW STOCK
    min_stock: 12,
    expiry_date: "2027-03-30",
    batch_no: "B-2605",
    supplier_id: "sup-005",
    is_active: true
  },
  {
    id: "prod-006",
    name: "Madhur Pure & Hygienic Sugar 1kg",
    barcode: "8906014640061",
    sku: "GRO-SUG-006",
    category: "Groceries",
    brand: "Madhur",
    unit: "pack",
    purchase_price: 46.00,
    selling_price: 54.00,
    mrp: 60.00,
    gst: 0,
    qty: 60,
    min_stock: 15,
    expiry_date: "2027-06-15",
    batch_no: "B-2606",
    supplier_id: "sup-001",
    is_active: true
  },
  {
    id: "prod-007",
    name: "Everest Turmeric Powder 100g",
    barcode: "8901786111072",
    sku: "GRO-SPC-007",
    category: "Groceries",
    brand: "Everest",
    unit: "pack",
    purchase_price: 32.00,
    selling_price: 42.00,
    mrp: 46.00,
    gst: 5,
    qty: 42,
    min_stock: 10,
    expiry_date: "2027-09-01",
    batch_no: "B-2607",
    supplier_id: "sup-006",
    is_active: true
  },
  {
    id: "prod-008",
    name: "MDH Chana Masala 100g",
    barcode: "8902167000083",
    sku: "GRO-SPC-008",
    category: "Groceries",
    brand: "MDH",
    unit: "pack",
    purchase_price: 68.00,
    selling_price: 85.00,
    mrp: 92.00,
    gst: 5,
    qty: 0, // OUT OF STOCK
    min_stock: 8,
    expiry_date: "2026-11-20", // NEAR EXPIRY / EXPIRED
    batch_no: "B-2508",
    supplier_id: "sup-006",
    is_active: true
  },
  {
    id: "prod-009",
    name: "Tata Sampann Unpolished Moong Dal 500g",
    barcode: "8901058852092",
    sku: "GRO-DAL-009",
    category: "Groceries",
    brand: "Tata Sampann",
    unit: "pack",
    purchase_price: 78.00,
    selling_price: 95.00,
    mrp: 105.00,
    gst: 0,
    qty: 18,
    min_stock: 10,
    expiry_date: "2027-02-15",
    batch_no: "B-2609",
    supplier_id: "sup-005",
    is_active: true
  },
  {
    id: "prod-010",
    name: "Daawat Devaaya Basmati Rice 1kg",
    barcode: "8901537000104",
    sku: "GRO-RIC-010",
    category: "Groceries",
    brand: "Daawat",
    unit: "pack",
    purchase_price: 110.00,
    selling_price: 135.00,
    mrp: 150.00,
    gst: 0,
    qty: 30,
    min_stock: 10,
    expiry_date: "2027-05-10",
    batch_no: "B-2610",
    supplier_id: "sup-005",
    is_active: true
  },

  // 2. Beverages (6 items)
  {
    id: "prod-011",
    name: "Tata Tea Gold 500g",
    barcode: "8901052002113",
    sku: "BEV-TEA-011",
    category: "Beverages",
    brand: "Tata",
    unit: "pack",
    purchase_price: 260.00,
    selling_price: 310.00,
    mrp: 340.00,
    gst: 5,
    qty: 28,
    min_stock: 10,
    expiry_date: "2027-08-01",
    batch_no: "B-2611",
    supplier_id: "sup-010",
    is_active: true
  },
  {
    id: "prod-012",
    name: "Brooke Bond Red Label Tea 250g",
    barcode: "8901030012128",
    sku: "BEV-TEA-012",
    category: "Beverages",
    brand: "Red Label",
    unit: "pack",
    purchase_price: 125.00,
    selling_price: 150.00,
    mrp: 165.00,
    gst: 5,
    qty: 4, // LOW STOCK
    min_stock: 12,
    expiry_date: "2027-07-20",
    batch_no: "B-2612",
    supplier_id: "sup-010",
    is_active: true
  },
  {
    id: "prod-013",
    name: "Nescafe Classic Instant Coffee 100g Jar",
    barcode: "8901058000135",
    sku: "BEV-COF-013",
    category: "Beverages",
    brand: "Nescafe",
    unit: "jar",
    purchase_price: 245.00,
    selling_price: 295.00,
    mrp: 320.00,
    gst: 18,
    qty: 22,
    min_stock: 8,
    expiry_date: "2027-10-15",
    batch_no: "B-2613",
    supplier_id: "sup-010",
    is_active: true
  },
  {
    id: "prod-014",
    name: "Bru Instant Coffee Chicory Mix 200g",
    barcode: "8901030384143",
    sku: "BEV-COF-014",
    category: "Beverages",
    brand: "Bru",
    unit: "pack",
    purchase_price: 180.00,
    selling_price: 220.00,
    mrp: 240.00,
    gst: 18,
    qty: 34,
    min_stock: 10,
    expiry_date: "2027-09-10",
    batch_no: "B-2614",
    supplier_id: "sup-010",
    is_active: true
  },
  {
    id: "prod-015",
    name: "Tropicana 100% Orange Delight Juice 1L",
    barcode: "8902080000156",
    sku: "BEV-JUC-015",
    category: "Beverages",
    brand: "Tropicana",
    unit: "tetra",
    purchase_price: 110.00,
    selling_price: 135.00,
    mrp: 145.00,
    gst: 12,
    qty: 16,
    min_stock: 8,
    expiry_date: "2026-12-05", // NEAR EXPIRY (< 15 days)
    batch_no: "B-2615",
    supplier_id: "sup-010",
    is_active: true
  },
  {
    id: "prod-016",
    name: "Bournvita Pro-Health Nutrition Drink 500g Jar",
    barcode: "7622201124167",
    sku: "BEV-HLT-016",
    category: "Beverages",
    brand: "Cadbury",
    unit: "jar",
    purchase_price: 215.00,
    selling_price: 255.00,
    mrp: 280.00,
    gst: 18,
    qty: 19,
    min_stock: 6,
    expiry_date: "2027-06-25",
    batch_no: "B-2616",
    supplier_id: "sup-010",
    is_active: true
  },

  // 3. Dairy Products (6 items)
  {
    id: "prod-017",
    name: "Amul Butter Pasteurised 500g",
    barcode: "8901262010174",
    sku: "DAI-BUT-017",
    category: "Dairy Products",
    brand: "Amul",
    unit: "pack",
    purchase_price: 240.00,
    selling_price: 275.00,
    mrp: 285.00,
    gst: 12,
    qty: 32,
    min_stock: 10,
    expiry_date: "2027-03-10",
    batch_no: "B-2617",
    supplier_id: "sup-002",
    is_active: true
  },
  {
    id: "prod-018",
    name: "Nandini Pasteurised Toned Milk 1L",
    barcode: "8906036670181",
    sku: "DAI-MLK-018",
    category: "Dairy Products",
    brand: "Nandini",
    unit: "pouch",
    purchase_price: 42.00,
    selling_price: 46.00,
    mrp: 46.00,
    gst: 0,
    qty: 45,
    min_stock: 15,
    expiry_date: "2026-11-23", // VERY NEAR EXPIRY (dairy)
    batch_no: "B-2618",
    supplier_id: "sup-002",
    is_active: true
  },
  {
    id: "prod-019",
    name: "Milky Mist Fresh Paneer 200g",
    barcode: "8904082700191",
    sku: "DAI-PAN-019",
    category: "Dairy Products",
    brand: "Milky Mist",
    unit: "pack",
    purchase_price: 88.00,
    selling_price: 110.00,
    mrp: 120.00,
    gst: 5,
    qty: 25,
    min_stock: 8,
    expiry_date: "2026-12-08",
    batch_no: "B-2619",
    supplier_id: "sup-002",
    is_active: true
  },
  {
    id: "prod-020",
    name: "Amul Cheese Slices 200g (10 Slices)",
    barcode: "8901262020203",
    sku: "DAI-CHS-020",
    category: "Dairy Products",
    brand: "Amul",
    unit: "pack",
    purchase_price: 128.00,
    selling_price: 150.00,
    mrp: 160.00,
    gst: 12,
    qty: 2, // LOW STOCK
    min_stock: 10,
    expiry_date: "2027-02-14",
    batch_no: "B-2620",
    supplier_id: "sup-002",
    is_active: true
  },
  {
    id: "prod-021",
    name: "Mother Dairy Classic Dahi Curd 400g Cup",
    barcode: "8901648000214",
    sku: "DAI-DAH-021",
    category: "Dairy Products",
    brand: "Mother Dairy",
    unit: "cup",
    purchase_price: 36.00,
    selling_price: 45.00,
    mrp: 48.00,
    gst: 5,
    qty: 18,
    min_stock: 8,
    expiry_date: "2026-11-28", // NEAR EXPIRY
    batch_no: "B-2621",
    supplier_id: "sup-002",
    is_active: true
  },
  {
    id: "prod-022",
    name: "Gowardhan Pure Cow Ghee 500ml Pet Jar",
    barcode: "8906016620227",
    sku: "DAI-GHE-022",
    category: "Dairy Products",
    brand: "Gowardhan",
    unit: "jar",
    purchase_price: 345.00,
    selling_price: 410.00,
    mrp: 440.00,
    gst: 12,
    qty: 14,
    min_stock: 6,
    expiry_date: "2027-08-30",
    batch_no: "B-2622",
    supplier_id: "sup-002",
    is_active: true
  },

  // 4. Snacks & Biscuits (6 items)
  {
    id: "prod-023",
    name: "Lay's India's Magic Masala Chips 50g",
    barcode: "8901491100238",
    sku: "SNK-CHP-023",
    category: "Snacks & Biscuits",
    brand: "Lay's",
    unit: "pack",
    purchase_price: 16.00,
    selling_price: 20.00,
    mrp: 20.00,
    gst: 12,
    qty: 90,
    min_stock: 25,
    expiry_date: "2027-03-01",
    batch_no: "B-2623",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-024",
    name: "Parle-G Original Glucose Biscuits 250g",
    barcode: "8901719100249",
    sku: "SNK-BIS-024",
    category: "Snacks & Biscuits",
    brand: "Parle",
    unit: "pack",
    purchase_price: 24.00,
    selling_price: 30.00,
    mrp: 30.00,
    gst: 18,
    qty: 65,
    min_stock: 20,
    expiry_date: "2027-05-15",
    batch_no: "B-2624",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-025",
    name: "Haldiram's Nagpur Bhujia Sev 400g",
    barcode: "8904004400251",
    sku: "SNK-NAM-025",
    category: "Snacks & Biscuits",
    brand: "Haldiram's",
    unit: "pack",
    purchase_price: 115.00,
    selling_price: 140.00,
    mrp: 155.00,
    gst: 12,
    qty: 28,
    min_stock: 10,
    expiry_date: "2027-04-10",
    batch_no: "B-2625",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-026",
    name: "Britannia Good Day Butter Cookies 200g",
    barcode: "8901063000262",
    sku: "SNK-BIS-026",
    category: "Snacks & Biscuits",
    brand: "Britannia",
    unit: "pack",
    purchase_price: 42.00,
    selling_price: 50.00,
    mrp: 55.00,
    gst: 18,
    qty: 40,
    min_stock: 12,
    expiry_date: "2027-04-20",
    batch_no: "B-2626",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-027",
    name: "Kurkure Masala Munch Crisps 90g",
    barcode: "8901491500273",
    sku: "SNK-CHP-027",
    category: "Snacks & Biscuits",
    brand: "Kurkure",
    unit: "pack",
    purchase_price: 16.00,
    selling_price: 20.00,
    mrp: 20.00,
    gst: 12,
    qty: 70,
    min_stock: 20,
    expiry_date: "2027-03-25",
    batch_no: "B-2627",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-028",
    name: "Sunfeast Dark Fantasy Choco Fills 75g",
    barcode: "8901030500284",
    sku: "SNK-BIS-028",
    category: "Snacks & Biscuits",
    brand: "Sunfeast",
    unit: "pack",
    purchase_price: 33.00,
    selling_price: 40.00,
    mrp: 45.00,
    gst: 18,
    qty: 36,
    min_stock: 12,
    expiry_date: "2027-06-18",
    batch_no: "B-2628",
    supplier_id: "sup-003",
    is_active: true
  },

  // 5. Personal Care (6 items)
  {
    id: "prod-029",
    name: "Dettol Original Bathing Soap 125g (Pack of 3)",
    barcode: "8901396000295",
    sku: "PC-SOP-029",
    category: "Personal Care",
    brand: "Dettol",
    unit: "pack",
    purchase_price: 135.00,
    selling_price: 165.00,
    mrp: 180.00,
    gst: 18,
    qty: 30,
    min_stock: 10,
    expiry_date: "2028-02-10",
    batch_no: "B-2629",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-030",
    name: "Dove Intense Repair Shampoo 340ml",
    barcode: "8901030700306",
    sku: "PC-SHM-030",
    category: "Personal Care",
    brand: "Dove",
    unit: "bottle",
    purchase_price: 270.00,
    selling_price: 330.00,
    mrp: 370.00,
    gst: 18,
    qty: 20,
    min_stock: 8,
    expiry_date: "2028-04-12",
    batch_no: "B-2630",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-031",
    name: "Colgate MaxFresh Spicy Fresh Toothpaste 150g",
    barcode: "8901314000317",
    sku: "PC-PST-031",
    category: "Personal Care",
    brand: "Colgate",
    unit: "tube",
    purchase_price: 88.00,
    selling_price: 110.00,
    mrp: 125.00,
    gst: 18,
    qty: 45,
    min_stock: 12,
    expiry_date: "2027-11-20",
    batch_no: "B-2631",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-032",
    name: "Nivea Nourishing Body Milk Lotion 200ml",
    barcode: "4005808000328",
    sku: "PC-LOT-032",
    category: "Personal Care",
    brand: "Nivea",
    unit: "bottle",
    purchase_price: 195.00,
    selling_price: 245.00,
    mrp: 275.00,
    gst: 18,
    qty: 15,
    min_stock: 6,
    expiry_date: "2028-01-15",
    batch_no: "B-2632",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-033",
    name: "Parachute Pure Coconut Hair Oil 250ml Bottle",
    barcode: "8901088000339",
    sku: "PC-OIL-033",
    category: "Personal Care",
    brand: "Parachute",
    unit: "bottle",
    purchase_price: 98.00,
    selling_price: 120.00,
    mrp: 135.00,
    gst: 5,
    qty: 28,
    min_stock: 10,
    expiry_date: "2028-05-10",
    batch_no: "B-2633",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-034",
    name: "Whisper Ultra Clean Sanitary Pads (Pack of 15)",
    barcode: "4902430000340",
    sku: "PC-HYG-034",
    category: "Personal Care",
    brand: "Whisper",
    unit: "pack",
    purchase_price: 150.00,
    selling_price: 180.00,
    mrp: 199.00,
    gst: 12,
    qty: 32,
    min_stock: 10,
    expiry_date: "2028-06-01",
    batch_no: "B-2634",
    supplier_id: "sup-004",
    is_active: true
  },

  // 6. Home Cleaning (6 items)
  {
    id: "prod-035",
    name: "Vim Dishwash Liquid Gel Lemon 750ml",
    barcode: "8901030800351",
    sku: "CLN-DSH-035",
    category: "Home Cleaning",
    brand: "Vim",
    unit: "bottle",
    purchase_price: 145.00,
    selling_price: 175.00,
    mrp: 199.00,
    gst: 18,
    qty: 38,
    min_stock: 12,
    expiry_date: "2028-03-20",
    batch_no: "B-2635",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-036",
    name: "Surf Excel Matic Top Load Detergent Powder 2kg",
    barcode: "8901030900362",
    sku: "CLN-DET-036",
    category: "Home Cleaning",
    brand: "Surf Excel",
    unit: "box",
    purchase_price: 360.00,
    selling_price: 430.00,
    mrp: 480.00,
    gst: 18,
    qty: 22,
    min_stock: 8,
    expiry_date: "2028-07-15",
    batch_no: "B-2636",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-037",
    name: "Harpic Power Plus Disinfectant Toilet Cleaner 1L",
    barcode: "8901396100373",
    sku: "CLN-TOI-037",
    category: "Home Cleaning",
    brand: "Harpic",
    unit: "bottle",
    purchase_price: 165.00,
    selling_price: 205.00,
    mrp: 230.00,
    gst: 18,
    qty: 30,
    min_stock: 10,
    expiry_date: "2028-04-10",
    batch_no: "B-2637",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-038",
    name: "Colin Glass & Surface Cleaner Spray 500ml",
    barcode: "8901396200384",
    sku: "CLN-GLS-038",
    category: "Home Cleaning",
    brand: "Colin",
    unit: "spray",
    purchase_price: 88.00,
    selling_price: 108.00,
    mrp: 120.00,
    gst: 18,
    qty: 1, // LOW STOCK
    min_stock: 8,
    expiry_date: "2028-02-18",
    batch_no: "B-2638",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-039",
    name: "Comfort After Wash Morning Fresh Conditioner 860ml",
    barcode: "8901030100395",
    sku: "CLN-CND-039",
    category: "Home Cleaning",
    brand: "Comfort",
    unit: "bottle",
    purchase_price: 195.00,
    selling_price: 240.00,
    mrp: 265.00,
    gst: 18,
    qty: 14,
    min_stock: 6,
    expiry_date: "2028-01-25",
    batch_no: "B-2639",
    supplier_id: "sup-004",
    is_active: true
  },
  {
    id: "prod-040",
    name: "Lizol Disinfectant Floor Cleaner Citrus 1L",
    barcode: "8901396300406",
    sku: "CLN-FLR-040",
    category: "Home Cleaning",
    brand: "Lizol",
    unit: "bottle",
    purchase_price: 180.00,
    selling_price: 220.00,
    mrp: 245.00,
    gst: 18,
    qty: 26,
    min_stock: 8,
    expiry_date: "2028-05-12",
    batch_no: "B-2640",
    supplier_id: "sup-004",
    is_active: true
  },

  // 7. Household & Essentials (5 items)
  {
    id: "prod-041",
    name: "Odonil Room Air Freshener Lavender Block 50g",
    barcode: "8901207000417",
    sku: "HOU-AIR-041",
    category: "Household & Essentials",
    brand: "Odonil",
    unit: "pack",
    purchase_price: 52.00,
    selling_price: 65.00,
    mrp: 72.00,
    gst: 18,
    qty: 45,
    min_stock: 12,
    expiry_date: "2028-03-01",
    batch_no: "B-2641",
    supplier_id: "sup-008",
    is_active: true
  },
  {
    id: "prod-042",
    name: "Hit Rechargeable Mosquito Swatter Bat",
    barcode: "8901157000428",
    sku: "HOU-BAT-042",
    category: "Household & Essentials",
    brand: "Hit",
    unit: "piece",
    purchase_price: 360.00,
    selling_price: 450.00,
    mrp: 520.00,
    gst: 18,
    qty: 12,
    min_stock: 5,
    expiry_date: "2030-01-01",
    batch_no: "B-2642",
    supplier_id: "sup-008",
    is_active: true
  },
  {
    id: "prod-043",
    name: "EcoCare Oxo-Biodegradable Garbage Bags (30s)",
    barcode: "8906045000439",
    sku: "HOU-BAG-043",
    category: "Household & Essentials",
    brand: "EcoCare",
    unit: "roll",
    purchase_price: 85.00,
    selling_price: 110.00,
    mrp: 130.00,
    gst: 18,
    qty: 35,
    min_stock: 10,
    expiry_date: "2029-01-01",
    batch_no: "B-2643",
    supplier_id: "sup-008",
    is_active: true
  },
  {
    id: "prod-044",
    name: "Origami Super Absorbent Kitchen Towel (2 Rolls)",
    barcode: "8906001000440",
    sku: "HOU-TWL-044",
    category: "Household & Essentials",
    brand: "Origami",
    unit: "pack",
    purchase_price: 95.00,
    selling_price: 120.00,
    mrp: 140.00,
    gst: 12,
    qty: 24,
    min_stock: 8,
    expiry_date: "2029-01-01",
    batch_no: "B-2644",
    supplier_id: "sup-008",
    is_active: true
  },
  {
    id: "prod-045",
    name: "All Out Ultra Mosquito Vaporizer Refill 45ml",
    barcode: "8901234000451",
    sku: "HOU-VAP-045",
    category: "Household & Essentials",
    brand: "All Out",
    unit: "bottle",
    purchase_price: 68.00,
    selling_price: 85.00,
    mrp: 95.00,
    gst: 18,
    qty: 40,
    min_stock: 10,
    expiry_date: "2028-06-15",
    batch_no: "B-2645",
    supplier_id: "sup-008",
    is_active: true
  },

  // 8. Stationery (5 items)
  {
    id: "prod-046",
    name: "Classmate Long Notebook 160 Pages (Pack of 4)",
    barcode: "8901030200462",
    sku: "STA-NBK-046",
    category: "Stationery",
    brand: "Classmate",
    unit: "pack",
    purchase_price: 180.00,
    selling_price: 220.00,
    mrp: 240.00,
    gst: 12,
    qty: 25,
    min_stock: 8,
    expiry_date: "2030-01-01",
    batch_no: "B-2646",
    supplier_id: "sup-009",
    is_active: true
  },
  {
    id: "prod-047",
    name: "Reynolds 045 Fine Carbure Ball Pen Blue (Pack of 5)",
    barcode: "8901416000473",
    sku: "STA-PEN-047",
    category: "Stationery",
    brand: "Reynolds",
    unit: "pack",
    purchase_price: 38.00,
    selling_price: 50.00,
    mrp: 50.00,
    gst: 18,
    qty: 60,
    min_stock: 15,
    expiry_date: "2029-01-01",
    batch_no: "B-2647",
    supplier_id: "sup-009",
    is_active: true
  },
  {
    id: "prod-048",
    name: "Camlin White Synthetic Glue 100g Squeezy Bottle",
    barcode: "8901425000484",
    sku: "STA-GLU-048",
    category: "Stationery",
    brand: "Camlin",
    unit: "bottle",
    purchase_price: 28.00,
    selling_price: 35.00,
    mrp: 40.00,
    gst: 18,
    qty: 32,
    min_stock: 8,
    expiry_date: "2028-02-10",
    batch_no: "B-2648",
    supplier_id: "sup-009",
    is_active: true
  },
  {
    id: "prod-049",
    name: "Post-it 3x3 Self-Adhesive Sticky Notes Yellow",
    barcode: "8901238000495",
    sku: "STA-NOT-049",
    category: "Stationery",
    brand: "3M Post-it",
    unit: "pad",
    purchase_price: 60.00,
    selling_price: 78.00,
    mrp: 88.00,
    gst: 18,
    qty: 18,
    min_stock: 6,
    expiry_date: "2030-01-01",
    batch_no: "B-2649",
    supplier_id: "sup-009",
    is_active: true
  },
  {
    id: "prod-050",
    name: "Faber-Castell Triangular Drawing Pencils (10s)",
    barcode: "8901275000506",
    sku: "STA-PNC-050",
    category: "Stationery",
    brand: "Faber-Castell",
    unit: "box",
    purchase_price: 70.00,
    selling_price: 90.00,
    mrp: 100.00,
    gst: 12,
    qty: 20,
    min_stock: 6,
    expiry_date: "2030-01-01",
    batch_no: "B-2650",
    supplier_id: "sup-009",
    is_active: true
  },

  // 9. Packaged Foods (5 items)
  {
    id: "prod-051",
    name: "Maggi 2-Minute Masala Instant Noodles 280g (4pk)",
    barcode: "8901058850517",
    sku: "PKG-NOD-051",
    category: "Packaged Foods",
    brand: "Maggi",
    unit: "pack",
    purchase_price: 52.00,
    selling_price: 64.00,
    mrp: 68.00,
    gst: 12,
    qty: 55,
    min_stock: 15,
    expiry_date: "2027-04-10",
    batch_no: "B-2651",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-052",
    name: "Kissan Fresh Tomato Ketchup 950g Squeezy Bottle",
    barcode: "8901030400528",
    sku: "PKG-SAU-052",
    category: "Packaged Foods",
    brand: "Kissan",
    unit: "bottle",
    purchase_price: 110.00,
    selling_price: 135.00,
    mrp: 150.00,
    gst: 12,
    qty: 24,
    min_stock: 8,
    expiry_date: "2027-06-20",
    batch_no: "B-2652",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-053",
    name: "Kellogg's Corn Flakes Original 475g Box",
    barcode: "8901499000539",
    sku: "PKG-CRL-053",
    category: "Packaged Foods",
    brand: "Kellogg's",
    unit: "box",
    purchase_price: 175.00,
    selling_price: 215.00,
    mrp: 235.00,
    gst: 18,
    qty: 16,
    min_stock: 6,
    expiry_date: "2027-05-18",
    batch_no: "B-2653",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-054",
    name: "Chings Secret Schezwan Chutney 250g Jar",
    barcode: "8901595000540",
    sku: "PKG-SAU-054",
    category: "Packaged Foods",
    brand: "Chings Secret",
    unit: "jar",
    purchase_price: 68.00,
    selling_price: 85.00,
    mrp: 95.00,
    gst: 12,
    qty: 22,
    min_stock: 6,
    expiry_date: "2027-03-12",
    batch_no: "B-2654",
    supplier_id: "sup-003",
    is_active: true
  },
  {
    id: "prod-055",
    name: "Sundrop Creamy Peanut Butter 510g Jar",
    barcode: "8901512000551",
    sku: "PKG-JMS-055",
    category: "Packaged Foods",
    brand: "Sundrop",
    unit: "jar",
    purchase_price: 155.00,
    selling_price: 190.00,
    mrp: 210.00,
    gst: 12,
    qty: 11, // DEAD STOCK DEMO (high inventory, zero sales in last 30d)
    min_stock: 4,
    expiry_date: "2027-07-30",
    batch_no: "B-2655",
    supplier_id: "sup-003",
    is_active: true
  },

  // 10. Fruits & Vegetables (5 items)
  {
    id: "prod-056",
    name: "Shimla Royal Delicious Fresh Apples 1kg",
    barcode: "8902001000562",
    sku: "FRV-APL-056",
    category: "Fruits & Vegetables",
    brand: "Farm Fresh",
    unit: "kg",
    purchase_price: 140.00,
    selling_price: 180.00,
    mrp: 200.00,
    gst: 0,
    qty: 35,
    min_stock: 10,
    expiry_date: "2026-11-29",
    batch_no: "B-2656",
    supplier_id: "sup-007",
    is_active: true
  },
  {
    id: "prod-057",
    name: "Cavendish Fresh Table Bananas 1 Dozen",
    barcode: "8902001000573",
    sku: "FRV-BAN-057",
    category: "Fruits & Vegetables",
    brand: "Farm Fresh",
    unit: "dozen",
    purchase_price: 45.00,
    selling_price: 60.00,
    mrp: 65.00,
    gst: 0,
    qty: 20,
    min_stock: 8,
    expiry_date: "2026-11-24", // NEAR EXPIRY
    batch_no: "B-2657",
    supplier_id: "sup-007",
    is_active: true
  },
  {
    id: "prod-058",
    name: "Fresh Nashik Red Onions 2kg Bag",
    barcode: "8902001000584",
    sku: "FRV-ONI-058",
    category: "Fruits & Vegetables",
    brand: "Farm Fresh",
    unit: "bag",
    purchase_price: 55.00,
    selling_price: 70.00,
    mrp: 80.00,
    gst: 0,
    qty: 40,
    min_stock: 12,
    expiry_date: "2026-12-15",
    batch_no: "B-2658",
    supplier_id: "sup-007",
    is_active: true
  },
  {
    id: "prod-059",
    name: "Farm Fresh Potatoes 2kg Bag",
    barcode: "8902001000595",
    sku: "FRV-POT-059",
    category: "Fruits & Vegetables",
    brand: "Farm Fresh",
    unit: "bag",
    purchase_price: 50.00,
    selling_price: 65.00,
    mrp: 75.00,
    gst: 0,
    qty: 45,
    min_stock: 12,
    expiry_date: "2026-12-25",
    batch_no: "B-2659",
    supplier_id: "sup-007",
    is_active: true
  },
  {
    id: "prod-060",
    name: "Bengaluru Fresh Hybrid Tomatoes 1kg",
    barcode: "8902001000606",
    sku: "FRV-TOM-060",
    category: "Fruits & Vegetables",
    brand: "Farm Fresh",
    unit: "kg",
    purchase_price: 28.00,
    selling_price: 38.00,
    mrp: 45.00,
    gst: 0,
    qty: 30,
    min_stock: 10,
    expiry_date: "2026-11-26",
    batch_no: "B-2660",
    supplier_id: "sup-007",
    is_active: true
  }
];

export const CUSTOMERS = [
  { id: "cust-001", name: "Rajesh Kumar", mobile: "9840112341", email: "rajesh.k@gmail.com", loyalty_points: 240, total_spent: 8450.00, visits: 9 },
  { id: "cust-002", name: "Lakshmi Narayanan", mobile: "9840112342", email: "lakshmi.n@yahoo.com", loyalty_points: 510, total_spent: 16200.00, visits: 14 },
  { id: "cust-003", name: "Priya Sundaram", mobile: "9840112343", email: "priya.sundar@outlook.com", loyalty_points: 180, total_spent: 6150.00, visits: 6 },
  { id: "cust-004", name: "Anandhi Raman", mobile: "9840112344", email: "anandhi.raman@gmail.com", loyalty_points: 320, total_spent: 11300.00, visits: 11 },
  { id: "cust-005", name: "Senthil Nathan", mobile: "9840112345", email: "senthil.n@hotmail.com", loyalty_points: 95, total_spent: 3400.00, visits: 4 },
  { id: "cust-006", name: "Divya Balaji", mobile: "9840112346", email: "divya.balaji@gmail.com", loyalty_points: 440, total_spent: 14800.00, visits: 13 },
  { id: "cust-007", name: "Karthik Venkatesh", mobile: "9840112347", email: "karthik.v@gmail.com", loyalty_points: 290, total_spent: 9800.00, visits: 8 },
  { id: "cust-008", name: "Meenakshi Sundaram", mobile: "9840112348", email: "meena.s@gmail.com", loyalty_points: 620, total_spent: 21500.00, visits: 18 },
  { id: "cust-009", name: "Suresh Babu", mobile: "9840112349", email: "suresh.babu@gmail.com", loyalty_points: 110, total_spent: 4200.00, visits: 5 },
  { id: "cust-010", name: "Deepa Krishnan", mobile: "9840112350", email: "deepa.krish@yahoo.com", loyalty_points: 375, total_spent: 12900.00, visits: 12 },
  { id: "cust-011", name: "Vignesh Murthy", mobile: "9840112351", email: "vicky.murthy@gmail.com", loyalty_points: 85, total_spent: 3100.00, visits: 3 },
  { id: "cust-012", name: "Gayathri Devi", mobile: "9840112352", email: "gayu.devi@gmail.com", loyalty_points: 490, total_spent: 17400.00, visits: 15 },
  { id: "cust-013", name: "Arunachalam Chettiar", mobile: "9840112353", email: "arun.chettiar@gmail.com", loyalty_points: 710, total_spent: 25800.00, visits: 21 },
  { id: "cust-014", name: "Revathi Jayaram", mobile: "9840112354", email: "revathi.j@outlook.com", loyalty_points: 150, total_spent: 5300.00, visits: 5 },
  { id: "cust-015", name: "Subramanian Swamy", mobile: "9840112355", email: "subbu.swamy@gmail.com", loyalty_points: 215, total_spent: 7600.00, visits: 7 },
  { id: "cust-016", name: "Bhavani Shankar", mobile: "9840112356", email: "bhavani.s@gmail.com", loyalty_points: 380, total_spent: 13200.00, visits: 10 },
  { id: "cust-017", name: "Muthukumar P", mobile: "9840112357", email: "muthu.p@gmail.com", loyalty_points: 130, total_spent: 4600.00, visits: 4 },
  { id: "cust-018", name: "Radha Govind", mobile: "9840112358", email: "radha.govind@yahoo.com", loyalty_points: 460, total_spent: 15900.00, visits: 14 },
  { id: "cust-019", name: "Dinesh Chandran", mobile: "9840112359", email: "dinesh.c@gmail.com", loyalty_points: 265, total_spent: 9100.00, visits: 8 },
  { id: "cust-020", name: "Shanthi Mohan", mobile: "9840112360", email: "shanthi.m@outlook.com", loyalty_points: 540, total_spent: 18700.00, visits: 16 },
  { id: "cust-021", name: "Saravanan K", mobile: "9840112361", email: "saravanan.k@gmail.com", loyalty_points: 195, total_spent: 6800.00, visits: 6 },
  { id: "cust-022", name: "Uma Maheswari", mobile: "9840112362", email: "uma.mahes@gmail.com", loyalty_points: 330, total_spent: 11700.00, visits: 10 },
  { id: "cust-023", name: "Gopalakrishnan V", mobile: "9840112363", email: "gopal.v@gmail.com", loyalty_points: 420, total_spent: 14600.00, visits: 12 },
  { id: "cust-024", name: "Padma Srinivasan", mobile: "9840112364", email: "padma.srini@yahoo.com", loyalty_points: 680, total_spent: 23900.00, visits: 19 },
  { id: "cust-025", name: "Hariharan R", mobile: "9840112365", email: "hari.r@gmail.com", loyalty_points: 160, total_spent: 5600.00, visits: 5 },
  { id: "cust-026", name: "Kavitha Natarajan", mobile: "9840112366", email: "kavitha.n@gmail.com", loyalty_points: 285, total_spent: 9900.00, visits: 9 },
  { id: "cust-027", name: "Vijay Anand", mobile: "9840112367", email: "vijay.anand@hotmail.com", loyalty_points: 350, total_spent: 12400.00, visits: 11 },
  { id: "cust-028", name: "Nalini Parthasarathy", mobile: "9840112368", email: "nalini.p@gmail.com", loyalty_points: 495, total_spent: 17200.00, visits: 15 },
  { id: "cust-029", name: "Thangavelu M", mobile: "9840112369", email: "thangam.m@gmail.com", loyalty_points: 210, total_spent: 7400.00, visits: 7 },
  { id: "cust-030", name: "Chitra Ganesan", mobile: "9840112370", email: "chitra.g@yahoo.com", loyalty_points: 580, total_spent: 20100.00, visits: 17 },
  { id: "cust-031", name: "Balasubramaniam S", mobile: "9840112371", email: "bala.subbu@gmail.com", loyalty_points: 120, total_spent: 4300.00, visits: 4 },
  { id: "cust-032", name: "Padmini Rangarajan", mobile: "9840112372", email: "padmini.r@gmail.com", loyalty_points: 405, total_spent: 14100.00, visits: 12 }
];

// Generate 105 realistic transactions across the past 30 days
export function generateSeedSales() {
  const sales = [];
  const cashiers = ["Ananya Iyer", "Karthik Subbu", "Priya Nair"];
  const paymentMethods = ["cash", "upi", "card", "split"];
  const now = new Date();

  // Create transactions spread over the past 30 days
  for (let i = 1; i <= 105; i++) {
    const daysAgo = Math.floor((105 - i) / 3.5); // Spans 0 to ~30 days
    const date = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000 - ((i % 8) * 3600 * 1000 + (i % 60) * 60 * 1000));
    
    // Pick 1 to 5 random products
    const prodCount = (i % 4) + 1;
    const items = [];
    let grossTotal = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalCost = 0;

    for (let j = 0; j < prodCount; j++) {
      const pIndex = (i * 7 + j * 13) % PRODUCTS.length;
      const prod = PRODUCTS[pIndex];
      const qty = (j === 0 ? (i % 3) + 1 : 1);
      const unitPrice = prod.selling_price;
      const costPrice = prod.purchase_price;
      const lineSubtotal = unitPrice * qty;
      const discountPct = (i % 5 === 0 && j === 0) ? 5 : 0;
      const lineDiscount = Math.round((lineSubtotal * discountPct) / 100);
      const lineTotal = lineSubtotal - lineDiscount;
      
      const gstRate = prod.gst;
      const taxable = Math.round((lineTotal * 100) / (100 + gstRate) * 100) / 100;
      const tax = Math.round((lineTotal - taxable) * 100) / 100;
      const cgst = Math.round((tax / 2) * 100) / 100;
      const sgst = tax - cgst;

      grossTotal += lineSubtotal;
      totalTaxable += taxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalCost += costPrice * qty;

      items.push({
        id: `si-${i}-${j + 1}`,
        product_id: prod.id,
        name: prod.name,
        qty: qty,
        unit: prod.unit,
        unit_price: unitPrice,
        cost_price: costPrice,
        discount_pct: discountPct,
        discount: lineDiscount,
        taxable: taxable,
        cgst: cgst,
        sgst: sgst,
        igst: 0,
        total: lineTotal
      });
    }

    const billDiscount = (i % 10 === 0) ? 20 : 0;
    const itemsTotal = items.reduce((s, it) => s + it.total, 0);
    const finalAmount = Math.max(1, itemsTotal - billDiscount);
    const roundOff = Math.round(finalAmount) - finalAmount;
    const payable = Math.round(finalAmount);

    const cust = CUSTOMERS[i % CUSTOMERS.length];
    const cashier = cashiers[i % cashiers.length];
    const methodChoice = paymentMethods[i % paymentMethods.length];

    let payments = [];
    if (methodChoice === "split") {
      const half = Math.floor(payable / 2);
      payments = [
        { method: "cash", amount: half },
        { method: "upi", amount: payable - half }
      ];
    } else {
      payments = [{ method: methodChoice, amount: payable }];
    }

    sales.push({
      id: `sale-${i.toString().padStart(4, "0")}`,
      invoice_no: `INV-${(1000 + i).toString()}`,
      created_at: date.toISOString(),
      cashier: cashier,
      customer_id: cust.id,
      customer_name: cust.name,
      customer_mobile: cust.mobile,
      subtotal: grossTotal,
      discount: (grossTotal - itemsTotal) + billDiscount,
      taxable: Math.round(totalTaxable * 100) / 100,
      cgst: Math.round(totalCgst * 100) / 100,
      sgst: Math.round(totalSgst * 100) / 100,
      igst: 0,
      round_off: Math.round(roundOff * 100) / 100,
      total: payable,
      cost_total: Math.round(totalCost * 100) / 100,
      status: "completed",
      items: items,
      payments: payments
    });
  }
  return sales;
}

export const PURCHASES = [
  {
    id: "po-001",
    po_no: "PO-2026-001",
    supplier_id: "sup-001",
    supplier_name: "Chennai Mega Traders",
    date: "2026-10-25T10:00:00Z",
    status: "received",
    payment_status: "paid",
    total: 18500.00,
    items: [
      { product_id: "prod-001", name: "Fortune Sunlite Sunflower Oil 1L", qty: 50, price: 132.00, total: 6600.00 },
      { product_id: "prod-004", name: "Tata Salt Vacuum Evaporated 1kg", qty: 100, price: 21.00, total: 2100.00 },
      { product_id: "prod-006", name: "Madhur Pure & Hygienic Sugar 1kg", qty: 213, price: 46.00, total: 9800.00 }
    ],
    grn_no: "GRN-2026-001",
    received_at: "2026-10-26T14:30:00Z"
  },
  {
    id: "po-002",
    po_no: "PO-2026-002",
    supplier_id: "sup-002",
    supplier_name: "Tamil Nadu Dairy Co-op",
    date: "2026-10-28T09:00:00Z",
    status: "received",
    payment_status: "paid",
    total: 12400.00,
    items: [
      { product_id: "prod-017", name: "Amul Butter Pasteurised 500g", qty: 40, price: 240.00, total: 9600.00 },
      { product_id: "prod-019", name: "Milky Mist Fresh Paneer 200g", qty: 32, price: 88.00, total: 2800.00 }
    ],
    grn_no: "GRN-2026-002",
    received_at: "2026-10-28T16:00:00Z"
  },
  {
    id: "po-003",
    po_no: "PO-2026-003",
    supplier_id: "sup-003",
    supplier_name: "ITC Distributors Chennai",
    date: "2026-11-01T11:30:00Z",
    status: "received",
    payment_status: "paid",
    total: 15600.00,
    items: [
      { product_id: "prod-003", name: "Aashirvaad Shudh Chakki Atta 5kg", qty: 40, price: 235.00, total: 9400.00 },
      { product_id: "prod-026", name: "Britannia Good Day Butter Cookies 200g", qty: 60, price: 42.00, total: 2520.00 },
      { product_id: "prod-051", name: "Maggi 2-Minute Masala Instant Noodles 280g (4pk)", qty: 70, price: 52.00, total: 3640.00 }
    ],
    grn_no: "GRN-2026-003",
    received_at: "2026-11-02T12:00:00Z"
  },
  {
    id: "po-004",
    po_no: "PO-2026-004",
    supplier_id: "sup-004",
    supplier_name: "Hindustan FMCG Logistics",
    date: "2026-11-04T14:15:00Z",
    status: "received",
    payment_status: "partial",
    total: 21800.00,
    items: [
      { product_id: "prod-029", name: "Dettol Original Bathing Soap 125g (Pack of 3)", qty: 40, price: 135.00, total: 5400.00 },
      { product_id: "prod-035", name: "Vim Dishwash Liquid Gel Lemon 750ml", qty: 50, price: 145.00, total: 7250.00 },
      { product_id: "prod-036", name: "Surf Excel Matic Top Load Detergent Powder 2kg", qty: 25, price: 360.00, total: 9000.00 }
    ],
    grn_no: "GRN-2026-004",
    received_at: "2026-11-05T15:00:00Z"
  },
  {
    id: "po-005",
    po_no: "PO-2026-005",
    supplier_id: "sup-005",
    supplier_name: "Madurai Grain Mills",
    date: "2026-11-08T10:00:00Z",
    status: "received",
    payment_status: "paid",
    total: 26000.00,
    items: [
      { product_id: "prod-002", name: "India Gate Classic Basmati Rice 5kg", qty: 30, price: 520.00, total: 15600.00 },
      { product_id: "prod-005", name: "24 Mantra Organic Toor Dal 1kg", qty: 40, price: 155.00, total: 6200.00 },
      { product_id: "prod-010", name: "Daawat Devaaya Basmati Rice 1kg", qty: 38, price: 110.00, total: 4200.00 }
    ],
    grn_no: "GRN-2026-005",
    received_at: "2026-11-09T11:00:00Z"
  },
  {
    id: "po-006",
    po_no: "PO-2026-006",
    supplier_id: "sup-006",
    supplier_name: "Southern Spices Ltd",
    date: "2026-11-10T11:00:00Z",
    status: "received",
    payment_status: "paid",
    total: 8200.00,
    items: [
      { product_id: "prod-007", name: "Everest Turmeric Powder 100g", qty: 100, price: 32.00, total: 3200.00 },
      { product_id: "prod-008", name: "MDH Chana Masala 100g", qty: 50, price: 68.00, total: 3400.00 }
    ],
    grn_no: "GRN-2026-006",
    received_at: "2026-11-11T13:00:00Z"
  },
  {
    id: "po-007",
    po_no: "PO-2026-007",
    supplier_id: "sup-007",
    supplier_name: "Coimbatore Agro Produce",
    date: "2026-11-12T08:30:00Z",
    status: "received",
    payment_status: "paid",
    total: 9400.00,
    items: [
      { product_id: "prod-056", name: "Shimla Royal Delicious Fresh Apples 1kg", qty: 40, price: 140.00, total: 5600.00 },
      { product_id: "prod-058", name: "Fresh Nashik Red Onions 2kg Bag", qty: 40, price: 55.00, total: 2200.00 },
      { product_id: "prod-060", name: "Bengaluru Fresh Hybrid Tomatoes 1kg", qty: 57, price: 28.00, total: 1600.00 }
    ],
    grn_no: "GRN-2026-007",
    received_at: "2026-11-12T15:00:00Z"
  },
  {
    id: "po-008",
    po_no: "PO-2026-008",
    supplier_id: "sup-008",
    supplier_name: "Coromandel Home Essentials",
    date: "2026-11-14T13:45:00Z",
    status: "received",
    payment_status: "paid",
    total: 11200.00,
    items: [
      { product_id: "prod-041", name: "Odonil Room Air Freshener Lavender Block 50g", qty: 60, price: 52.00, total: 3120.00 },
      { product_id: "prod-042", name: "Hit Rechargeable Mosquito Swatter Bat", qty: 15, price: 360.00, total: 5400.00 },
      { product_id: "prod-043", name: "EcoCare Oxo-Biodegradable Garbage Bags (30s)", qty: 32, price: 85.00, total: 2700.00 }
    ],
    grn_no: "GRN-2026-008",
    received_at: "2026-11-15T11:00:00Z"
  },
  {
    id: "po-009",
    po_no: "PO-2026-009",
    supplier_id: "sup-009",
    supplier_name: "Madras Stationery World",
    date: "2026-11-16T15:00:00Z",
    status: "received",
    payment_status: "paid",
    total: 7500.00,
    items: [
      { product_id: "prod-046", name: "Classmate Long Notebook 160 Pages (Pack of 4)", qty: 30, price: 180.00, total: 5400.00 },
      { product_id: "prod-047", name: "Reynolds 045 Fine Carbure Ball Pen Blue (Pack of 5)", qty: 55, price: 38.00, total: 2100.00 }
    ],
    grn_no: "GRN-2026-009",
    received_at: "2026-11-17T12:00:00Z"
  },
  {
    id: "po-010",
    po_no: "PO-2026-010",
    supplier_id: "sup-010",
    supplier_name: "Kaveri Organics Wholesale",
    date: "2026-11-17T10:15:00Z",
    status: "received",
    payment_status: "paid",
    total: 13800.00,
    items: [
      { product_id: "prod-011", name: "Tata Tea Gold 500g", qty: 30, price: 260.00, total: 7800.00 },
      { product_id: "prod-013", name: "Nescafe Classic Instant Coffee 100g Jar", qty: 24, price: 245.00, total: 6000.00 }
    ],
    grn_no: "GRN-2026-010",
    received_at: "2026-11-18T10:30:00Z"
  },
  {
    id: "po-011",
    po_no: "PO-2026-011",
    supplier_id: "sup-001",
    supplier_name: "Chennai Mega Traders",
    date: "2026-11-18T14:00:00Z",
    status: "pending",
    payment_status: "unpaid",
    total: 14500.00,
    items: [
      { product_id: "prod-001", name: "Fortune Sunlite Sunflower Oil 1L", qty: 60, price: 132.00, total: 7920.00 },
      { product_id: "prod-006", name: "Madhur Pure & Hygienic Sugar 1kg", qty: 143, price: 46.00, total: 6580.00 }
    ]
  },
  {
    id: "po-012",
    po_no: "PO-2026-012",
    supplier_id: "sup-005",
    supplier_name: "Madurai Grain Mills",
    date: "2026-11-19T09:30:00Z",
    status: "pending",
    payment_status: "unpaid",
    total: 31000.00,
    items: [
      { product_id: "prod-002", name: "India Gate Classic Basmati Rice 5kg", qty: 40, price: 520.00, total: 20800.00 },
      { product_id: "prod-005", name: "24 Mantra Organic Toor Dal 1kg", qty: 50, price: 155.00, total: 7750.00 },
      { product_id: "prod-009", name: "Tata Sampann Unpolished Moong Dal 500g", qty: 31, price: 78.00, total: 2450.00 }
    ]
  },
  {
    id: "po-013",
    po_no: "PO-2026-013",
    supplier_id: "sup-003",
    supplier_name: "ITC Distributors Chennai",
    date: "2026-11-19T16:00:00Z",
    status: "partial",
    payment_status: "partial",
    total: 22400.00,
    items: [
      { product_id: "prod-003", name: "Aashirvaad Shudh Chakki Atta 5kg", qty: 50, price: 235.00, total: 11750.00 },
      { product_id: "prod-023", name: "Lay's India's Magic Masala Chips 50g", qty: 200, price: 16.00, total: 3200.00 },
      { product_id: "prod-051", name: "Maggi 2-Minute Masala Instant Noodles 280g (4pk)", qty: 143, price: 52.00, total: 7450.00 }
    ],
    grn_no: "GRN-2026-011",
    received_at: "2026-11-20T10:00:00Z"
  },
  {
    id: "po-014",
    po_no: "PO-2026-014",
    supplier_id: "sup-004",
    supplier_name: "Hindustan FMCG Logistics",
    date: "2026-11-20T11:30:00Z",
    status: "pending",
    payment_status: "unpaid",
    total: 18900.00,
    items: [
      { product_id: "prod-030", name: "Dove Intense Repair Shampoo 340ml", qty: 30, price: 270.00, total: 8100.00 },
      { product_id: "prod-037", name: "Harpic Power Plus Disinfectant Toilet Cleaner 1L", qty: 40, price: 165.00, total: 6600.00 },
      { product_id: "prod-040", name: "Lizol Disinfectant Floor Cleaner Citrus 1L", qty: 23, price: 180.00, total: 4200.00 }
    ]
  }
];

export const STOCK_MOVEMENTS = [
  { id: "mov-001", product_id: "prod-001", product: "Fortune Sunlite Sunflower Oil 1L", type: "opening", qty_before: 0, qty_change: 50, qty_after: 50, reason: "Store Opening Stock", date: "2026-10-01T08:00:00Z", user: "Rajendran Sundaram" },
  { id: "mov-002", product_id: "prod-002", product: "India Gate Classic Basmati Rice 5kg", type: "opening", qty_before: 0, qty_change: 30, qty_after: 30, reason: "Store Opening Stock", date: "2026-10-01T08:00:00Z", user: "Rajendran Sundaram" },
  { id: "mov-003", product_id: "prod-005", product: "24 Mantra Organic Toor Dal 1kg", type: "adjustment", qty_before: 15, qty_change: -2, qty_after: 13, reason: "Packaging Bag Leakage", date: "2026-10-14T11:20:00Z", user: "Murugan Pillai" },
  { id: "mov-004", product_id: "prod-008", product: "MDH Chana Masala 100g", type: "damage", qty_before: 5, qty_change: -5, qty_after: 0, reason: "Expired Batch Removed", date: "2026-11-18T16:00:00Z", user: "Murugan Pillai" },
  { id: "mov-005", product_id: "prod-038", product: "Colin Glass & Surface Cleaner Spray 500ml", type: "adjustment", qty_before: 4, qty_change: -3, qty_after: 1, reason: "Floor display breakage", date: "2026-11-19T10:10:00Z", user: "Murugan Pillai" },
  { id: "mov-006", product_id: "prod-018", product: "Nandini Pasteurised Toned Milk 1L", type: "purchase", qty_before: 10, qty_change: 40, qty_after: 50, reason: "Morning Dairy Delivery GRN-002", date: "2026-11-20T06:30:00Z", user: "Murugan Pillai" }
];

export const EXPENSES = [
  { id: "exp-001", date: "2026-11-01", category: "Store Rent", description: "Monthly commercial building rent - T. Nagar premises", amount: 45000.00, payment_mode: "bank_transfer", reference: "NEFT-RENT-NOV", approved_by: "Rajendran Sundaram" },
  { id: "exp-002", date: "2026-11-03", category: "Electricity", description: "TNEB commercial electricity bill for Oct-Nov", amount: 12450.00, payment_mode: "online", reference: "TNEB-TXN-8841", approved_by: "Rajendran Sundaram" },
  { id: "exp-003", date: "2026-11-05", category: "Staff Salaries", description: "Staff payroll for October (5 store employees)", amount: 78000.00, payment_mode: "bank_transfer", reference: "SAL-OCT-2026", approved_by: "Rajendran Sundaram" },
  { id: "exp-004", date: "2026-11-08", category: "Logistics & Freight", description: "Koyambedu market tempo transport freight charges", amount: 2800.00, payment_mode: "cash", reference: "VOUCHER-084", approved_by: "Venkatesh Rao" },
  { id: "exp-005", date: "2026-11-11", category: "Packaging & Bags", description: "Royal Mart branded biodegradable carry bags & rolls (5000 units)", amount: 6500.00, payment_mode: "upi", reference: "UPI-BAGS-441", approved_by: "Venkatesh Rao" },
  { id: "exp-006", date: "2026-11-14", category: "Store Sanitation", description: "Bi-weekly professional pest control & sanitation service", amount: 3200.00, payment_mode: "cash", reference: "VOUCHER-098", approved_by: "Venkatesh Rao" },
  { id: "exp-007", date: "2026-11-16", category: "Internet & IT", description: "Airtel Xstream high-speed broadband & POS cloud sync", amount: 1499.00, payment_mode: "card", reference: "AIRTEL-NOV26", approved_by: "Venkatesh Rao" },
  { id: "exp-008", date: "2026-11-18", category: "Equipment Maintenance", description: "Walk-in dairy chiller servicing & refrigerant top-up", amount: 4800.00, payment_mode: "upi", reference: "CHILLER-SRV-102", approved_by: "Rajendran Sundaram" },
  { id: "exp-009", date: "2026-11-20", category: "Printing & Rolls", description: "Thermal receipt paper rolls (100 rolls) & barcode sticker labels", amount: 1850.00, payment_mode: "cash", reference: "VOUCHER-115", approved_by: "Ananya Iyer" }
];

export const CASH_REGISTER_CLOSINGS = [
  { id: "close-001", date: "2026-11-18", cashier: "Ananya Iyer", opening_cash: 2000.00, cash_sales: 11450.00, cash_expenses: 1850.00, expected_cash: 11600.00, counted_cash: 11600.00, difference: 0.00, status: "balanced", notes: "Shift balanced perfectly." },
  { id: "close-002", date: "2026-11-19", cashier: "Karthik Subbu", opening_cash: 2000.00, cash_sales: 14200.00, cash_expenses: 500.00, expected_cash: 15700.00, counted_cash: 15720.00, difference: 20.00, status: "surplus", notes: "Rs. 20 customer left coin change." },
  { id: "close-003", date: "2026-11-20", cashier: "Ananya Iyer", opening_cash: 2500.00, cash_sales: 16850.00, cash_expenses: 1200.00, expected_cash: 18150.00, counted_cash: 18150.00, difference: 0.00, status: "balanced", notes: "Evening shift closed cleanly." }
];

export const SETTINGS_DEFAULT = {
  store_name: "Royal Mart",
  tagline: "Your Neighbourhood Superstore",
  address: "42, Anna Salai, T. Nagar, Chennai - 600017, Tamil Nadu",
  phone: "+91 98401 23456",
  email: "contact@royalmart.chennai.in",
  gstin: "33AAAAA0000A1Z5",
  state_code: "33",
  currency: "INR",
  currency_symbol: "₹",
  enable_split_payments: true,
  enable_loyalty_points: true,
  loyalty_conversion_rate: 1, // 1 point per 100 spent
  low_stock_threshold: 10,
  expiry_warning_days: 30,
  enable_negative_stock: false,
  invoice_prefix: "INV-",
  invoice_footer: "Thank you for shopping at Royal Mart! Please visit again.",
  tax_scheme: "regular", // regular or composition
  hsn_required: true,
  auto_print_invoice: true
};
