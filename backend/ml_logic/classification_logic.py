import numpy as np
from typing import Dict
from services.model_loader import classification_assets


def classify_water_safety(
    ph: float,
    turbidity: float,
    conductivity: float
) -> Dict:

    model = classification_assets["model"]
    threshold = classification_assets["threshold"]
    feature_order = classification_assets["feature_order"]

    input_map = {
        "ph": ph,
        "turbidity": turbidity,
        "conductivity": conductivity
    }

    ordered_features = np.array(
        [input_map[f] for f in feature_order]
    ).reshape(1, -1)

    probability = float(model.predict_proba(ordered_features)[0][1])

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
