import pandas as pd
from typing import Dict
from services.model_loader import advance_regression_assets


def predict_alum_dosage(features: Dict) -> Dict:

    model = advance_regression_assets["model"]
    explainer = advance_regression_assets["explainer"]
    conformal = advance_regression_assets["conformal"]

    # ---- Validate & build DataFrame in correct order ----
    try:
        X = pd.DataFrame([{
            "Raw_Water_Turbidity": float(features["turbidity"]),
            "Raw_Water_PH": float(features["ph"]),
            "Raw_Water_Conductivity": float(features["conductivity"]),
            "Raw_Water_Flow_m3/h": float(features["raw_water_flow"]),
            "D_Chamber_Flow_rate_l/m": float(features["d_chamber_flow"]),
            "Aerator_Flow_Rate_L/m": float(features["aerator_flow"])
        }])
    except Exception:
        raise ValueError("Inputs must contain: turbidity, ph, conductivity, raw_water_flow, d_chamber_flow, aerator_flow")

    # ---- Predict alum dose ----
    prediction = float(model.predict(X)[0])

    # ---- SHAP explanation ----
    shap_values = explainer.shap_values(X)

    # ---- Confidence interval ----
    interval = {
        "lower": prediction - conformal["q_hat"],
        "upper": prediction + conformal["q_hat"]
    }

    return {
        "predicted_alum_dosage_ppm": round(prediction, 0),
        "dose_range_ppm": {
            "min": round(interval["lower"], 2),
            "max": round(interval["upper"], 2)
        },
        "inputs": X.to_dict(orient="records")[0],
        "shap_explanation": {
            "features": list(X.columns),
            "values": X.iloc[0].tolist(),
            "shap_values": shap_values[0].tolist()
        }
    }
