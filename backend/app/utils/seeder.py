import logging
import uuid
from app.utils.db import get_db

logger = logging.getLogger(__name__)

DUMMY_ORDERS_RECEIVED = [
  { "id": "ORD-1001", "customer": "Acme Corp", "product": "Wireless Earbuds", "quantity": 50, "date": "2026-05-28", "status": "Pending", "priority": "High", "delivery": "2026-06-02" },
  { "id": "ORD-1002", "customer": "Global Tech", "product": "Office Chair Pro", "quantity": 12, "date": "2026-05-28", "status": "Processing", "priority": "Medium", "delivery": "2026-06-05" },
  { "id": "ORD-1003", "customer": "Jane Doe", "product": "Gaming Keyboard", "quantity": 1, "date": "2026-05-27", "status": "Packed", "priority": "Low", "delivery": "2026-05-30" },
  { "id": "ORD-1004", "customer": "Smith Ltd", "product": "Travel Backpack", "quantity": 5, "date": "2026-05-27", "status": "Shipped", "priority": "Medium", "delivery": "2026-05-29" },
  { "id": "ORD-1005", "customer": "John Smith", "product": "Running Shoes", "quantity": 2, "date": "2026-05-26", "status": "Delivered", "priority": "Low", "delivery": "2026-05-28" },
  { "id": "ORD-1006", "customer": "Tech Haven", "product": "Wireless Earbuds", "quantity": 100, "date": "2026-05-26", "status": "Pending", "priority": "High", "delivery": "2026-06-01" },
  { "id": "ORD-1007", "customer": "Fitness Co", "product": "Yoga Mat Premium", "quantity": 30, "date": "2026-05-25", "status": "Processing", "priority": "Medium", "delivery": "2026-05-30" },
  { "id": "ORD-1008", "customer": "Retail Giant", "product": "Winter Hoodies", "quantity": 200, "date": "2026-05-25", "status": "Shipped", "priority": "High", "delivery": "2026-05-28" },
  { "id": "ORD-1009", "customer": "Alice Brown", "product": "Protein Powder", "quantity": 3, "date": "2026-05-24", "status": "Delivered", "priority": "Low", "delivery": "2026-05-26" },
  { "id": "ORD-1010", "customer": "Mike Johnson", "product": "Gaming Keyboard", "quantity": 2, "date": "2026-05-24", "status": "Pending", "priority": "Medium", "delivery": "2026-05-29" },
  { "id": "ORD-1011", "customer": "StartUp Inc", "product": "Office Chair Pro", "quantity": 8, "date": "2026-05-23", "status": "Packed", "priority": "High", "delivery": "2026-05-27" },
  { "id": "ORD-1012", "customer": "Gym Bros", "product": "Protein Powder", "quantity": 50, "date": "2026-05-23", "status": "Shipped", "priority": "Medium", "delivery": "2026-05-26" },
  { "id": "ORD-1013", "customer": "Sarah Connor", "product": "Travel Backpack", "quantity": 1, "date": "2026-05-22", "status": "Delivered", "priority": "Low", "delivery": "2026-05-25" },
  { "id": "ORD-1014", "customer": "MegaStore", "product": "Wireless Earbuds", "quantity": 500, "date": "2026-05-22", "status": "Processing", "priority": "High", "delivery": "2026-06-05" },
  { "id": "ORD-1015", "customer": "Bob Wilson", "product": "Running Shoes", "quantity": 1, "date": "2026-05-21", "status": "Delivered", "priority": "Low", "delivery": "2026-05-24" },
]

DUMMY_ORDERS_PLACED = [
  { "id": "PO-9001", "supplier": "AudioTech Supplies", "product": "Wireless Earbuds", "quantity": 1000, "date": "2026-05-28", "status": "Requested", "arrival": "2026-06-15" },
  { "id": "PO-9002", "supplier": "Ergo Furnishings", "product": "Office Chair Pro", "quantity": 50, "date": "2026-05-27", "status": "Confirmed", "arrival": "2026-06-10" },
  { "id": "PO-9003", "supplier": "KeyTronix", "product": "Gaming Keyboard", "quantity": 200, "date": "2026-05-25", "status": "In Transit", "arrival": "2026-06-01" },
  { "id": "PO-9004", "supplier": "ActiveWear Inc", "product": "Winter Hoodies", "quantity": 500, "date": "2026-05-20", "status": "Received", "arrival": "2026-05-25" },
  { "id": "PO-9005", "supplier": "FitGear Co", "product": "Yoga Mat Premium", "quantity": 100, "date": "2026-05-28", "status": "Requested", "arrival": "2026-06-12" },
  { "id": "PO-9006", "supplier": "NutriLife", "product": "Protein Powder", "quantity": 300, "date": "2026-05-24", "status": "Confirmed", "arrival": "2026-06-05" },
  { "id": "PO-9007", "supplier": "BagMakers Ltd", "product": "Travel Backpack", "quantity": 150, "date": "2026-05-22", "status": "In Transit", "arrival": "2026-05-30" },
  { "id": "PO-9008", "supplier": "ShoeFactory", "product": "Running Shoes", "quantity": 250, "date": "2026-05-18", "status": "Received", "arrival": "2026-05-22" },
  { "id": "PO-9009", "supplier": "AudioTech Supplies", "product": "Wireless Earbuds", "quantity": 500, "date": "2026-05-15", "status": "Received", "arrival": "2026-05-20" },
  { "id": "PO-9010", "supplier": "Ergo Furnishings", "product": "Office Chair Pro", "quantity": 20, "date": "2026-05-28", "status": "Requested", "arrival": "2026-06-20" },
]

async def seed_db():
    db = await get_db()
    
    # Check if orders_received has documents
    count_received = await db.orders_received.count_documents({})
    if count_received == 0:
        logger.info("Seeding orders_received...")
        for order in DUMMY_ORDERS_RECEIVED:
            order['_id'] = str(uuid.uuid4())
        await db.orders_received.insert_many(DUMMY_ORDERS_RECEIVED)

    # Check if orders_placed has documents
    count_placed = await db.orders_placed.count_documents({})
    if count_placed == 0:
        logger.info("Seeding orders_placed...")
        for order in DUMMY_ORDERS_PLACED:
            order['_id'] = str(uuid.uuid4())
        await db.orders_placed.insert_many(DUMMY_ORDERS_PLACED)

    logger.info("Database seeding complete.")
