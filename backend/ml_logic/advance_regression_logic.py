import numpy as np
from typing import Dict
from services.model_loader import advance_regression_assets


def predict_alum_dosage(features: Dict) -> Dict:

    model = advance_regression_assets["model"]
    explainer = advance_regression_assets["explainer"]
    conformal = advance_regression_assets["conformal"]

    X = np.array(list(features.values())).reshape(1, -1)

    prediction = float(model.predict(X)[0])

    shap_values = explainer.shap_values(X)

    interval = {
        "lower": prediction - conformal["q_hat"],
        "upper": prediction + conformal["q_hat"]
    }

    return {
        "predicted_alum_dosage_ppm": prediction,
        "confidence_interval": interval,
        "shap_explanation": {
            "features": list(features.keys()),
            "values": list(features.values()),
            "shap_values": shap_values[0].tolist()
        }
    }
