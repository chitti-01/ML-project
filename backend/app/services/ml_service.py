import pickle
import os
import pandas as pd
from typing import List, Dict, Any, Optional
from app.models.schemas import ForecastRecord, PredictRequest

class MLService:
    def __init__(self):
        # Loaded model and encoders
        self.model = None
        self.store_encoder = None
        self.item_encoder = None
        
        # Fallback/default forecast schema to keep frontend responsive
        self.mock_forecast = [
            {"month": "Jan", "actual": 1200, "predicted": None},
            {"month": "Feb", "actual": 1900, "predicted": None},
            {"month": "Mar", "actual": 3000, "predicted": None},
            {"month": "Apr", "actual": 2800, "predicted": None},
            {"month": "May", "actual": 4200, "predicted": None},
            {"month": "Jun", "actual": 4800, "predicted": None},
            {"month": "Jul", "actual": None, "predicted": 5100},
            {"month": "Aug", "actual": None, "predicted": 6200},
            {"month": "Sep", "actual": None, "predicted": 7500},
            {"month": "Oct", "actual": None, "predicted": 8100},
        ]

    def load_model(self, path: Optional[str] = None):
        """
        Loads the XGBoost forecasting model and both categorical encoders.
        Derives paths dynamically relative to this file to prevent directory mismatch errors.
        """
        # Resolve backend root directory (e:\Ml Project\backend)
        services_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(services_dir)
        backend_dir = os.path.dirname(app_dir)
        models_dir = os.path.join(backend_dir, "models")
        
        # Construct paths to picklegroups
        store_encoder_path = os.path.join(models_dir, "store_encoder (1).pkl")
        item_encoder_path = os.path.join(models_dir, "item_encoder (1).pkl")
        model_path = os.path.join(models_dir, "warehouse_forecasting_model.pkl")
        
        print(f"Loading ML models from: {models_dir}")
        
        loaded_all = True
        
        # 1. Load Store Encoder (.pkl)
        if os.path.exists(store_encoder_path):
            try:
                with open(store_encoder_path, 'rb') as f:
                    self.store_encoder = pickle.load(f)
                print("Store encoder loaded successfully")
            except Exception as e:
                print(f"Failed to load store encoder: {e}")
                loaded_all = False
        else:
            print(f"Store encoder file not found at: {store_encoder_path}")
            loaded_all = False
            
        # 2. Load Item Encoder (.pkl)
        if os.path.exists(item_encoder_path):
            try:
                with open(item_encoder_path, 'rb') as f:
                    self.item_encoder = pickle.load(f)
                print("Item encoder loaded successfully")
            except Exception as e:
                print(f"Failed to load item encoder: {e}")
                loaded_all = False
        else:
            print(f"Item encoder file not found at: {item_encoder_path}")
            loaded_all = False
            
        # 3. Load XGBoost Prediction Model (.pkl)
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("Prediction model loaded successfully")
            except Exception as e:
                print(f"Failed to load prediction model: {e}")
                loaded_all = False
        else:
            print(f"Prediction model file not found at: {model_path}")
            loaded_all = False
            
        if loaded_all:
            print("All forecasting pipeline models loaded successfully")
            # Update the dashboard metrics dynamically using the real model
            try:
                self._generate_model_backed_forecast()
            except Exception as e:
                print(f"Failed to pre-compute model-backed forecast: {e}. Falling back to defaults.")
        else:
            print("One or more pickle files failed to load. Falling back to default mock data.")

    def _generate_model_backed_forecast(self):
        """
        Private helper to populate mock_forecast using actual model predictions for the future months.
        This provides real ML-backed predictions directly to the main charts.
        """
        if not (self.model and self.store_encoder and self.item_encoder):
            return
            
        # July to October 2026 forecast parameters
        future_months = [
            {"month": "Jul", "m_num": 7, "day": 15, "dayofweek": 2, "weekday": 2},
            {"month": "Aug", "m_num": 8, "day": 15, "dayofweek": 5, "weekday": 5},
            {"month": "Sep", "m_num": 9, "day": 15, "dayofweek": 1, "weekday": 1},
            {"month": "Oct", "m_num": 10, "day": 15, "dayofweek": 4, "weekday": 4}
        ]
        
        # Use store_1 and item_1 as baseline
        encoded_store = self.store_encoder.transform(["store_1"])[0]
        encoded_item = self.item_encoder.transform(["item_1"])[0]
        
        feature_cols = ['store_id', 'item_id', 'price', 'promo', 'weekday', 'month', 'year', 'day', 'dayofweek', 'lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_mean_30']
        
        new_forecast = []
        new_forecast.extend(self.mock_forecast[:6]) # Add historical actuals (Jan - Jun)
        
        last_lag_1 = 150.0  # Daily demand baseline
        for idx, m_info in enumerate(future_months):
            row = [
                encoded_store,
                encoded_item,
                24.99, # assumed item price
                0,     # promo off
                m_info["weekday"],
                m_info["m_num"],
                2026,
                m_info["day"],
                m_info["dayofweek"],
                last_lag_1,
                last_lag_1 * 0.95,
                last_lag_1 * 0.90,
                last_lag_1 * 0.96,
                last_lag_1 * 0.92
            ]
            
            df = pd.DataFrame([row], columns=feature_cols)
            pred_val = float(self.model.predict(df)[0])
            
            # Scale daily demand prediction (~150 units) to monthly demand (~4500 units)
            scaled_pred = round(pred_val * 30.5)
            
            new_forecast.append({
                "month": m_info["month"],
                "actual": None,
                "predicted": scaled_pred
            })
            last_lag_1 = pred_val # Carry forward predicted demand as lag
            
        self.mock_forecast = new_forecast
        print("Pre-computed model-backed forecast complete.")

    def predict_demand(self, req: PredictRequest) -> float:
        """
        Executes prediction using the loaded pipeline models and inputs.
        """
        if not self.model or not self.store_encoder or not self.item_encoder:
            raise ValueError("ML model or encoders are not loaded on startup.")
            
        # Map realistic names back to model IDs
        store_map = {
            "Bangalore Central Hub": "store_1",
            "Mumbai Distribution Center": "store_2",
            "Hyderabad Smart Storage": "store_3",
            "Chennai Logistics Park": "store_4",
            "Delhi North Fulfillment Hub": "store_5"
        }
        item_map = {
            "Wireless Earbuds": "item_1",
            "Winter Hoodies": "item_2",
            "Protein Powder": "item_3",
            "Gaming Keyboard": "item_4",
            "Office Chair Pro": "item_5",
            "Running Shoes": "item_6",
            "Travel Backpack": "item_7",
            "Yoga Mat Premium": "item_8"
        }
        
        model_store_id = store_map.get(req.store_id, req.store_id if req.store_id.startswith("store_") else "store_1")
        model_item_id = item_map.get(req.item_id, req.item_id if req.item_id.startswith("item_") else "item_1")
        
        # 1. Validate and encode store_id
        try:
            encoded_store = self.store_encoder.transform([model_store_id])[0]
        except ValueError:
            valid_stores = list(self.store_encoder.classes_[:5])
            raise ValueError(f"Invalid store_id '{model_store_id}'. Expected one of {valid_stores}... up to store_50.")
            
        # 2. Validate and encode item_id
        try:
            encoded_item = self.item_encoder.transform([model_item_id])[0]
        except ValueError:
            valid_items = list(self.item_encoder.classes_[:5])
            raise ValueError(f"Invalid item_id '{model_item_id}'. Expected one of {valid_items}... up to item_50.")
            
        # 3. Handle dates and sub-features
        weekday = req.weekday
        month = req.month
        year = req.year
        day = req.day
        dayofweek = req.dayofweek
        
        if req.date:
            try:
                dt = pd.to_datetime(req.date)
                if weekday is None: weekday = int(dt.weekday())
                if month is None: month = int(dt.month)
                if year is None: year = int(dt.year)
                if day is None: day = int(dt.day)
                if dayofweek is None: dayofweek = int(dt.weekday())
            except Exception as e:
                raise ValueError(f"Failed to parse date '{req.date}': {e}. Use YYYY-MM-DD format.")
                
        # Fill defaults if values are still missing
        if weekday is None: weekday = 1
        if month is None: month = 5
        if year is None: year = 2026
        if day is None: day = 15
        if dayofweek is None: dayofweek = 1
        
        # Build DataFrame with features in correct training order
        feature_cols = ['store_id', 'item_id', 'price', 'promo', 'weekday', 'month', 'year', 'day', 'dayofweek', 'lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_mean_30']
        
        row = [
            encoded_store,
            encoded_item,
            req.price,
            1 if req.promo else 0,
            weekday,
            month,
            year,
            day,
            dayofweek,
            req.lag_1,
            req.lag_7,
            req.lag_30,
            req.rolling_mean_7,
            req.rolling_mean_30
        ]
        
        df = pd.DataFrame([row], columns=feature_cols)
        
        try:
            prediction = self.model.predict(df)[0]
            # Ensure prediction is non-negative
            return float(max(0.0, prediction))
        except Exception as e:
            raise RuntimeError(f"Prediction failed inside XGBoost engine: {e}")

    def predict_forecast(self) -> List[Dict[str, Any]]:
        """
        Returns the multi-month forecast timeline.
        """
        return self.mock_forecast

ml_service = MLService()
