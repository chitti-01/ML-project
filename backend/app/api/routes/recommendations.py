from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.schemas import Recommendation
from app.utils.db import db, get_db
import uuid
from datetime import datetime
from app.services.email_processor import email_processor

router = APIRouter()

@router.get("/", response_model=List[Recommendation])
async def get_recommendations():
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    cursor = db.recommendations.find({})
    items = await cursor.to_list(length=50)
    return items

@router.post("/apply")
async def apply_recommendation(payload: Dict[str, Any], database = Depends(get_db)):
    rec_id = payload.get("id")
    if not rec_id:
        raise HTTPException(status_code=400, detail="Missing recommendation ID")

    # In a real system, you would lookup the recommendation details by ID
    # For now, we simulate processing a recommendation like "Pre-order Wireless Earbuds"
    title = payload.get("title", "Recommendation Applied")

    # 1. Update database (Simulate marking as applied)
    # database.recommendations.update_one({"_id": rec_id}, {"$set": {"applied": True}})
    
    # 2. Generate a purchase order
    purchase_order = {
        "supplier": "Auto-Generated Supplier",
        "product": "System Recommended Item",
        "quantity": 100,
        "date": datetime.utcnow().strftime('%Y-%m-%d'),
        "status": "Requested",
        "arrival": "TBD"
    }
    
    if "earbuds" in title.lower():
        purchase_order["product"] = "Wireless Earbuds"
        purchase_order["supplier"] = "AudioTech Supplies"
    elif "hoodies" in title.lower():
        purchase_order["product"] = "Winter Hoodies"
        purchase_order["supplier"] = "ActiveWear Inc"

    po_result = await database.orders_placed.insert_one(purchase_order)

    # 3. Send automated email to supplier (Background/Silent)
    # Using the configured email_address for demo/testing purposes
    email_processor.send_automated_email(
        to_email=email_processor.email_address,
        subject=f"Purchase Order: {purchase_order['product']}",
        body_html=f"<h2>Purchase Order</h2><p>Please supply {purchase_order['quantity']} units of {purchase_order['product']}.</p>"
    )

    # 4. Create Notification
    notification = {
        "type": "recommendation_executed",
        "message": f"Applied '{title}'. Created PO for {purchase_order['product']}.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await database.notifications.insert_one(notification)

    # 5. Log Activity
    await database.report_logs.insert_one({
        "report_type": "recommendation_execution",
        "sent_at": datetime.utcnow(),
        "status": "success",
        "details": f"Applied {rec_id}"
    })

    return {"message": "Recommendation applied successfully", "po_id": str(po_result.inserted_id)}
