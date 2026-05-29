import asyncio

async def seed_db(db):
    # Inventory
    inventory_items = [
        {"_id": "SKU-1029", "sku": "SKU-1029", "name": "Wireless Noise-Canceling Headphones", "category": "Electronics", "stock": 450, "status": "In Stock", "price": 299.99},
        {"_id": "SKU-2093", "sku": "SKU-2093", "name": "Ergonomic Office Chair", "category": "Furniture", "stock": 12, "status": "Low Stock", "price": 199.50},
        {"_id": "SKU-8842", "sku": "SKU-8842", "name": "Mechanical Keyboard Pro", "category": "Electronics", "stock": 0, "status": "Out of Stock", "price": 129.00},
        {"_id": "SKU-3321", "sku": "SKU-3321", "name": "Smart Home Security Hub", "category": "Smart Home", "stock": 89, "status": "In Stock", "price": 149.99},
        {"_id": "SKU-5541", "sku": "SKU-5541", "name": "4K Ultra HD Monitor", "category": "Electronics", "stock": 34, "status": "Low Stock", "price": 399.00},
        {"_id": "SKU-1190", "sku": "SKU-1190", "name": "Bluetooth Mesh Router", "category": "Networking", "stock": 210, "status": "In Stock", "price": 89.99},
    ]
    await db.inventory.insert_many(inventory_items)

    # Recommendations
    recommendations = [
        {
            "_id": "rec_1",
            "title": "Optimize Warehouse B Electronics Section",
            "description": "AI detected a 15% increase in processing time for electronics in Warehouse B. Reorganizing shelves 12-A through 15-B could improve picking speed by 22%.",
            "type": "efficiency",
            "priority": "High",
            "impact": "+22% Speed",
            "confidence": 94
        },
        {
            "_id": "rec_2",
            "title": "Liquidate Surplus Winter Gear",
            "description": "Current stock of winter apparel exceeds predicted demand by 40%. We recommend an immediate 20% discount campaign.",
            "type": "inventory",
            "priority": "High",
            "impact": "$14k Savings",
            "confidence": 89
        }
    ]
    await db.recommendations.insert_many(recommendations)
    print("Database seeded successfully.")
