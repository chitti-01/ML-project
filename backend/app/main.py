from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.router import api_router
from app.utils.db import connect_to_mongo, close_mongo_connection
from app.services.ml_service import ml_service
from app.services.chatbot_service import initialize_knowledge_base
from app.services.scheduler_service import start_scheduler, stop_scheduler
from app.utils.seeder import seed_db
from app.services.cctv_service import cctv_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await connect_to_mongo()
    await seed_db()
    ml_service.load_model(settings.MODEL_PATH)
    cctv_service.load_model("models/best_box_detector.pt")
    initialize_knowledge_base()
    start_scheduler()
    yield
    # Shutdown logic
    stop_scheduler()
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
