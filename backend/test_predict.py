import pickle
import os
import pandas as pd
import numpy as np

def test_prediction():
    models_dir = os.path.join("backend", "models")
    if not os.path.exists(models_dir):
        models_dir = "models"
        
    store_enc_path = os.path.join(models_dir, "store_encoder (1).pkl")
    item_enc_path = os.path.join(models_dir, "item_encoder (1).pkl")
    model_path = os.path.join(models_dir, "warehouse_forecasting_model.pkl")
    
    print("Loading objects...")
    with open(store_enc_path, 'rb') as f:
        store_encoder = pickle.load(f)
    with open(item_enc_path, 'rb') as f:
        item_encoder = pickle.load(f)
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    print("Objects loaded successfully!")
    
    # Create test input
    test_input = {
        'store_id': 'store_1',
        'item_id': 'item_1',
        'price': 15.99,
        'promo': 1,
        'weekday': 1,
        'month': 5,
        'year': 2026,
        'day': 12,
        'dayofweek': 1,
        'lag_1': 150.0,
        'lag_7': 140.0,
        'lag_30': 130.0,
        'rolling_mean_7': 145.0,
        'rolling_mean_30': 135.0
    }
    
    # Preprocess
    encoded_store = store_encoder.transform([test_input['store_id']])[0]
    encoded_item = item_encoder.transform([test_input['item_id']])[0]
    
    print(f"Encoded store_id 'store_1' -> {encoded_store}")
    print(f"Encoded item_id 'item_1' -> {encoded_item}")
    
    # Feature columns in correct order
    feature_cols = ['store_id', 'item_id', 'price', 'promo', 'weekday', 'month', 'year', 'day', 'dayofweek', 'lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_mean_30']
    
    row = [
        encoded_store,
        encoded_item,
        test_input['price'],
        test_input['promo'],
        test_input['weekday'],
        test_input['month'],
        test_input['year'],
        test_input['day'],
        test_input['dayofweek'],
        test_input['lag_1'],
        test_input['lag_7'],
        test_input['lag_30'],
        test_input['rolling_mean_7'],
        test_input['rolling_mean_30']
    ]
    
    df = pd.DataFrame([row], columns=feature_cols)
    print("\nDataFrame created:")
    print(df)
    
    # Predict
    pred = model.predict(df)
    print(f"\nPrediction: {pred[0]}")

if __name__ == "__main__":
    try:
        test_prediction()
    except Exception as e:
        print(f"Error: {e}")
