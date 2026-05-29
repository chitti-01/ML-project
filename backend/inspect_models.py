import pickle
import os
import sys

def inspect_pickle(filepath):
    print(f"\n=========================================\nInspecting: {filepath}")
    if not os.path.exists(filepath):
        print("File not found!")
        return
    
    try:
        with open(filepath, 'rb') as f:
            obj = pickle.load(f)
        
        print(f"Type: {type(obj)}")
        
        # If it's a scikit-learn estimator
        if hasattr(obj, 'classes_'):
            print(f"Classes (len={len(obj.classes_)}): {obj.classes_[:10]}...")
        if hasattr(obj, 'get_params'):
            print("Params:")
            for k, v in obj.get_params().items():
                print(f"  {k}: {v}")
        if hasattr(obj, 'feature_names_in_'):
            print(f"Feature Names In: {obj.feature_names_in_}")
        elif hasattr(obj, 'n_features_in_'):
            print(f"Number of Features In: {obj.n_features_in_}")
            
        # Try to print some general properties
        if isinstance(obj, dict):
            print(f"Keys: {list(obj.keys())}")
        elif isinstance(obj, list):
            print(f"List length: {len(obj)}")
            if len(obj) > 0:
                print(f"Sample element: {obj[0]}")
        else:
            # Check other useful attributes
            for attr in ['categories_', 'classes_', 'mean_', 'scale_']:
                if hasattr(obj, attr):
                    val = getattr(obj, attr)
                    print(f"{attr}: {val[:5] if hasattr(val, '__len__') else val}")
                    
    except Exception as e:
        print(f"Error loading/inspecting: {e}")

if __name__ == "__main__":
    models_dir = os.path.join("backend", "models")
    if not os.path.exists(models_dir):
        models_dir = "models"
        
    inspect_pickle(os.path.join(models_dir, "item_encoder (1).pkl"))
    inspect_pickle(os.path.join(models_dir, "store_encoder (1).pkl"))
    inspect_pickle(os.path.join(models_dir, "warehouse_forecasting_model.pkl"))
