import pandas as pd
from typing import Dict
from services.model_loader import advance_regression_assets


def predict_alum_dosage(features: Dict) -> Dict:

    model = advance_regression_assets["model"]
    explainer = advance_regression_assets["explainer"]
    conformal = advance_regression_assets["conformal"]

    # ---- Build DataFrame (removes sklearn warning) ----
    try:
        X = pd.DataFrame([features]).astype(float)
    except Exception:
        raise ValueError("Invalid input values for advance regression")

    # ---- Prediction ----
    prediction = float(model.predict(X)[0])

    # ---- SHAP ----
    shap_values = explainer.shap_values(X)

    interval = {
        "lower": prediction - conformal["q_hat"],
        "upper": prediction + conformal["q_hat"]
    }

    return {
        "predicted_alum_dosage_ppm": prediction,
        "confidence_interval": interval,
        "shap_explanation": {
            "features": list(X.columns),
            "values": X.iloc[0].tolist(),
            "shap_values": shap_values[0].tolist()
        }
    }
