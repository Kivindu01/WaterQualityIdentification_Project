import numpy as np
from services.model_loader import classification_assets


def classify_water_safety(ph, turbidity, conductivity):

    # ---- Validate inputs ----
    ph = float(ph)
    turbidity = float(turbidity)
    conductivity = float(conductivity)

    model = classification_assets["model"]
    threshold = float(classification_assets["threshold"])
    feature_order = classification_assets["feature_order"]

    FEATURE_MAP = {
        "Raw_Water_PH": ph,
        "Raw_Water_Turbidity": turbidity,
        "Raw_Water_Conductivity": conductivity
    }

    # ---- Use feature order from pickle ----
    X = np.array(
        [FEATURE_MAP[f] for f in feature_order],
        dtype=float
    ).reshape(1, -1)

    probability = float(model.predict_proba(X)[0][1])

    status = "ABNORMAL" if probability >= threshold else "NORMAL"

    return {
        "classification": status,
        "abnormal_probability": probability,
        "threshold": threshold,
        "next_action": (
            "ADVANCE_REGRESSION" if status == "ABNORMAL"
            else "NORMAL_REGRESSION"
        )
    }
