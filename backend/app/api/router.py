from fastapi import APIRouter
from app.api.routes import auth, inventory, forecast, analytics, recommendations, video, websockets, chatbot, orders, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
