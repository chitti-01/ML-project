from fastapi import APIRouter
from app.models.schemas import AnalyticsSummary, PerformanceData
from typing import List, Dict

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary():
    # In a real app, this would aggregate data from the DB
    return AnalyticsSummary(
        total_products=1240,
        low_stock_items=45,
        avg_fulfillment_days=1.2,
        space_utilization_pct=87
    )

@router.get("/charts", response_model=List[PerformanceData])
async def get_analytics_charts():
    # Mock chart data for performance by warehouse
    return [
        {"name": "Warehouse A", "processing": 94, "shipping": 88},
        {"name": "Warehouse B", "processing": 72, "shipping": 65},
        {"name": "Warehouse C", "processing": 85, "shipping": 92},
        {"name": "Warehouse D", "processing": 99, "shipping": 97},
    ]

@router.get("/distribution")
async def get_distribution():
    return [
        {"name": "Electronics", "value": 400, "color": "#3b82f6"},
        {"name": "Apparel", "value": 300, "color": "#8b5cf6"},
        {"name": "Home Goods", "value": 300, "color": "#10b981"},
        {"name": "Furniture", "value": 200, "color": "#f59e0b"},
    ]
