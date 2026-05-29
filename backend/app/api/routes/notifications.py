from fastapi import APIRouter, Depends
from typing import List
from app.utils.db import get_db
from app.models.notifications import Notification

router = APIRouter()

@router.get("/")
async def get_notifications(db = Depends(get_db), limit: int = 50):
    cursor = db.notifications.find({}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item['id'] = str(item.pop('_id', item.get('id')))
    return items

@router.post("/read")
async def mark_notifications_read(db = Depends(get_db)):
    await db.notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"status": "success"}
