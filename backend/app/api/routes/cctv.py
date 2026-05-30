from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cctv_service import cctv_service

router = APIRouter()

@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    try:
        result = await cctv_service.analyze_image(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")
    try:
        result = await cctv_service.analyze_video(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
