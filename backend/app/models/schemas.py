from pydantic import BaseModel, Field
from typing import List, Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class InventoryItem(BaseModel):
    sku: str = Field(..., alias="_id")
    name: str
    category: str
    stock: int
    status: str
    price: float

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "sku": "SKU-1029",
                "name": "Wireless Noise-Canceling Headphones",
                "category": "Electronics",
                "stock": 450,
                "status": "In Stock",
                "price": 299.99
            }
        }
    }

class ForecastRecord(BaseModel):
    month: str
    actual: Optional[float] = None
    predicted: Optional[float] = None

class Recommendation(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: str
    type: str
    priority: str
    impact: str
    confidence: float

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "title": "Optimize Warehouse B Electronics",
                "description": "Reorganizing shelves 12-A through 15-B could improve speed by 22%.",
                "type": "efficiency",
                "priority": "High",
                "impact": "+22% Speed",
                "confidence": 94.0
            }
        }
    }

class AnalyticsSummary(BaseModel):
    total_products: int
    low_stock_items: int
    avg_fulfillment_days: float
    space_utilization_pct: float

class PerformanceData(BaseModel):
    name: str
    processing: float
    shipping: float

class VideoAnalysis(BaseModel):
    worker_count: int
    package_count: int
    busy_zones: List[str]
    idle_zones: List[str]
    safety_flags: int
    movement_activity: str

class PredictRequest(BaseModel):
    store_id: str = Field(..., description="Store ID (e.g., 'store_1')")
    item_id: str = Field(..., description="Item ID (e.g., 'item_1')")
    price: float = Field(..., description="Current price")
    promo: bool = Field(False, description="Is promo active")
    date: Optional[str] = Field(None, description="Prediction date in YYYY-MM-DD format (used to parse year/month/day/weekday/dayofweek)")
    
    # Optional manual features, in case user wants to override computed date properties
    weekday: Optional[int] = Field(None, description="0=Monday, 6=Sunday")
    month: Optional[int] = Field(None, description="1=January, 12=December")
    year: Optional[int] = Field(None, description="E.g. 2026")
    day: Optional[int] = Field(None, description="1-31")
    dayofweek: Optional[int] = Field(None, description="0=Monday, 6=Sunday")
    
    # Lag and rolling features (defaults set to typical base levels)
    lag_1: float = Field(150.0, description="Lag demand 1 day ago")
    lag_7: float = Field(150.0, description="Lag demand 7 days ago")
    lag_30: float = Field(150.0, description="Lag demand 30 days ago")
    rolling_mean_7: float = Field(150.0, description="7-day rolling mean")
    rolling_mean_30: float = Field(150.0, description="30-day rolling mean")

class PredictResponse(BaseModel):
    store_id: str
    item_id: str
    predicted_demand: float
    features_used: List[str]
    status: str = "success"

