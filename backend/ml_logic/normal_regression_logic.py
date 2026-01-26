from typing import Dict
import numpy as np
from services.model_loader import normal_regression_assets


def build_features(raw_turb, raw_ph, raw_cond, dose, feature_names):
    features = {
        "Raw_Water_Turbidity": raw_turb,
        "Turb_roll37": raw_turb,
        "Turb_sq": raw_turb ** 2,
        "Raw_Water_PH": raw_ph,
        "Raw_Water_Conductivity": raw_cond,
        "pH_Cond": raw_ph * raw_cond,
        "Alum_Dosage_ppm": dose,
        "Dose_Turb": dose * raw_turb
    }
    return np.array([[features[col] for col in feature_names]], dtype=float)


def select_optimal_dose(pred_9, pred_10):
    if pred_9 <= pred_10:
        return 9, pred_9
    else:
        return 10, pred_10


def predict_turbidity(features: Dict) -> Dict:

    model = normal_regression_assets["model"]
    explainer = normal_regression_assets["explainer"]
    conformal = normal_regression_assets["conformal"]

    # FIX HERE
    feature_info = normal_regression_assets["feature_names"]
    feature_names = feature_info["feature_names"]

    try:
        raw_turb = float(features["turbidity"])
        raw_ph = float(features["ph"])
        raw_cond = float(features["conductivity"])
    except Exception:
        raise ValueError("Inputs must contain numeric turbidity, ph, conductivity")

    print(f"INPUT: Turbidity={raw_turb} NTU, pH={raw_ph}, Conductivity={raw_cond}")

    X9 = build_features(raw_turb, raw_ph, raw_cond, 9, feature_names)
    pred_9 = float(model.predict(X9)[0])

    X10 = build_features(raw_turb, raw_ph, raw_cond, 10, feature_names)
    pred_10 = float(model.predict(X10)[0])

    dose, turb = select_optimal_dose(pred_9, pred_10)

    if "q_hat_pre" in conformal:
        q_hat = conformal["q_hat_pre"]      # 95% interval
    elif "q_hat_narrow" in conformal:
        q_hat = conformal["q_hat_narrow"]   # 80% interval
    else:
        raise KeyError(f"No q_hat found. Keys = {list(conformal.keys())}")

    interval = {
        "lower": turb - q_hat,
        "upper": turb + q_hat
    }

    X_best = build_features(raw_turb, raw_ph, raw_cond, dose, feature_names)
    shap_values = explainer.shap_values(X_best)

    return {
        "inputs": {
            "turbidity": raw_turb,
            "ph": raw_ph,
            "conductivity": raw_cond
        },
        "predictions": {
            "dose_9_turbidity": round(pred_9, 3),
            "dose_10_turbidity": round(pred_10, 3)
        },
        "recommended_dose_ppm": dose,
        "predicted_settled_turbidity": round(turb, 3),
        "confidence_interval": {
            "lower": round(interval["lower"], 3),
            "upper": round(interval["upper"], 3)
        },
        "shap_explanation": {
            "features": feature_names,
            "values": X_best[0].tolist(),
            "shap_values": shap_values[0].tolist()
        }
    }
