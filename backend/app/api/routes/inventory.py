from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import InventoryItem
from app.utils.db import db

router = APIRouter()

@router.get("/", response_model=List[InventoryItem])
async def get_inventory():
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    cursor = db.inventory.find({})
    items = await cursor.to_list(length=100)
    return items

@router.get("/{sku}", response_model=InventoryItem)
async def get_inventory_item(sku: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    item = await db.inventory.find_one({"_id": sku})
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")

@router.post("/", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItem):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    existing = await db.inventory.find_one({"_id": item.sku})
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    item_dict = item.model_dump(by_alias=True)
    await db.inventory.insert_one(item_dict)
    return item

@router.put("/{sku}", response_model=InventoryItem)
async def update_inventory_item(sku: str, item: InventoryItem):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    existing = await db.inventory.find_one({"_id": sku})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
        
    item_dict = item.model_dump(by_alias=True)
    # Ensure ID matches SKU
    item_dict["_id"] = sku
    await db.inventory.update_one({"_id": sku}, {"$set": item_dict})
    return item

@router.delete("/{sku}")
async def delete_inventory_item(sku: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    existing = await db.inventory.find_one({"_id": sku})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
        
    await db.inventory.delete_one({"_id": sku})
    return {"message": "Item deleted successfully"}

