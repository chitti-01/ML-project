from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.schemas import ForecastRecord, PredictRequest, PredictResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.get("/", response_model=List[ForecastRecord])
async def get_forecast():
    """
    Returns the multi-month forecasting sequence.
    This sequence is pre-computed and backed by our real XGBoost ML model
    for July, August, September, and October.
    """
    try:
        return ml_service.predict_forecast()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch forecast sequence: {e}"
        )

@router.post("/predict", response_model=PredictResponse)
async def predict_demand(req: PredictRequest):
    """
    Exposes an online prediction endpoint that accepts high-dimensional feature vectors,
    preprocesses them, maps categories using label encoders, and predicts using the XGBoost model.
    """
    try:
        prediction = ml_service.predict_demand(req)
        
        # List of the input columns in order
        features_used = [
            'store_id', 'item_id', 'price', 'promo', 'weekday', 'month', 'year', 'day', 'dayofweek',
            'lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_mean_30'
        ]
        
        return PredictResponse(
            store_id=req.store_id,
            item_id=req.item_id,
            predicted_demand=prediction,
            features_used=features_used,
            status="success"
        )
    except ValueError as ve:
        # Custom bad-request handling for invalid categories, bad date parsing, etc.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        # Generic error handling for server/model engine failures
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting Engine Error: {e}"
        )
