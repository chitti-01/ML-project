from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderReceived(BaseModel):
    id: Optional[str] = None
    customer: str
    product: str
    quantity: int
    date: str
    status: str
    priority: str
    delivery: str

class OrderPlaced(BaseModel):
    id: Optional[str] = None
    supplier: str
    product: str
    quantity: int
    date: str
    status: str
    arrival: str
