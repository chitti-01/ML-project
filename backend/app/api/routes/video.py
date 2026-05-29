from fastapi import APIRouter
from app.models.schemas import VideoAnalysis

router = APIRouter()

@router.get("/analysis", response_model=VideoAnalysis)
async def get_video_analysis():
    # Mock data for the video intelligence module demo
    return VideoAnalysis(
        worker_count=14,
        package_count=128,
        busy_zones=["Zone A", "Loading Dock 3"],
        idle_zones=["Storage Row 12"],
        safety_flags=0,
        movement_activity="High"
    )

@router.get("/demo")
async def get_video_demo_url():
    return {"url": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"}
