from fastapi import APIRouter, Depends
from typing import List
from app.utils.db import get_db

router = APIRouter()

@router.get("/")
async def get_all_orders(db = Depends(get_db)):
    received_cursor = db.orders_received.find({})
    received = await received_cursor.to_list(length=100)
    for r in received:
        r['id'] = str(r.pop('_id', r.get('id')))

    placed_cursor = db.orders_placed.find({})
    placed = await placed_cursor.to_list(length=100)
    for p in placed:
        p['id'] = str(p.pop('_id', p.get('id')))

    return {"received": received, "placed": placed}

@router.get("/received")
async def get_orders_received(db = Depends(get_db)):
    cursor = db.orders_received.find({})
    items = await cursor.to_list(length=100)
    for item in items:
        item['id'] = str(item.pop('_id', item.get('id')))
    return items

@router.get("/placed")
async def get_orders_placed(db = Depends(get_db)):
    cursor = db.orders_placed.find({})
    items = await cursor.to_list(length=100)
    for item in items:
        item['id'] = str(item.pop('_id', item.get('id')))
    return items

@router.post("/sync")
async def sync_orders():
    # In a real app this might trigger email_processor manually or ERP sync
    return {"message": "Sync complete"}
