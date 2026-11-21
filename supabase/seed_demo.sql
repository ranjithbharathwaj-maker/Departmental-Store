-- SAMPLE DATA for the demo store only. Not real business data.
insert into stores(id,name,store_type,address) values
 ('11111111-1111-1111-1111-111111111111','Sunrise Departmental Store','Departmental store','12 Gandhi Road, Chennai'),
 ('22222222-2222-2222-2222-222222222222','Lakshmi Supermart','Supermarket','4 Market Street, Madurai') on conflict do nothing;
create temp table seed(name text,barcode text,category text,unit text,pp numeric,sp numeric,gst numeric,mn numeric,qty numeric);
insert into seed values
 ('Premium Rice 5 kg','8901000100245','Grocery','packet',360,420,5,10,40),('Whole Milk 1 L','8901000100381','Dairy','piece',54,64,0,20,120),
 ('Orange Juice 1 L','8901000100482','Beverages','piece',88,110,12,10,30),('Dish Wash Liquid 500 ml','8901000100517','Household','piece',110,145,18,8,25),
 ('Cooking Oil 1 L','8901000100263','Grocery','piece',140,165,5,15,60),('Toor Dal 1 kg','8901000100271','Grocery','packet',128,155,5,15,45);
with p as (insert into products(store_id,name,barcode,category,unit,purchase_price,selling_price,mrp,gst,min_stock)
  select '11111111-1111-1111-1111-111111111111',name,barcode,category,unit,pp,sp,sp,gst,mn from seed returning id,name),
i as (insert into inventory(product_id,store_id,qty) select p.id,'11111111-1111-1111-1111-111111111111',s.qty from p join seed s using(name) returning product_id,qty)
insert into stock_movements(store_id,product_id,movement_type,qty_before,qty_change,qty_after,reason,user_name)
 select '11111111-1111-1111-1111-111111111111',product_id,'opening',0,qty,qty,'Sample opening stock','seed' from i;
