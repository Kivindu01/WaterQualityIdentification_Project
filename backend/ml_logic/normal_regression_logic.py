from typing import Dict
import numpy as np
from services.model_loader import normal_regression_assets


def predict_turbidity(features: Dict) -> Dict:

    model = normal_regression_assets["model"]
    pipeline = normal_regression_assets["pipeline"]
    q_hat = pipeline["q_hat"]

    # ---- Validate inputs ----
    try:
        turbidity = float(features["turbidity"])
        ph = float(features["ph"])
        conductivity = float(features["conductivity"])
    except Exception:
        raise ValueError("Inputs must contain numeric turbidity, ph, conductivity")

    # ---- Build 8-feature vector exactly as trained ----
    X_list = [
        turbidity,                 # Raw_Water_Turbidity
        turbidity,                 # Turb_roll37 (fallback = current)
        turbidity ** 2,            # Turb_sq
        ph,                         # Raw_Water_PH
        conductivity,              # Raw_Water_Conductivity
        ph * conductivity,         # pH_Cond
        0.0,                       # Alum_Dosage_ppm (unknown at this stage)
        0.0                        # Dose_Turb (unknown)
    ]

    X = np.array(X_list, dtype=float).reshape(1, -1)

    # ---- Predict ----
    prediction = float(model.predict(X)[0])

    interval = {
        "lower": prediction - q_hat,
        "upper": prediction + q_hat
    }

    return {
        "predicted_turbidity": prediction,
        "confidence_interval": interval,
        "inputs": {
            "turbidity": turbidity,
            "ph": ph,
            "conductivity": conductivity
        },
        "engineered_features": {
            "Raw_Water_Turbidity": X_list[0],
            "Turb_roll37": X_list[1],
            "Turb_sq": X_list[2],
            "Raw_Water_PH": X_list[3],
            "Raw_Water_Conductivity": X_list[4],
            "pH_Cond": X_list[5],
            "Alum_Dosage_ppm": X_list[6],
            "Dose_Turb": X_list[7],
        }
    }
