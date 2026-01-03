import numpy as np
from typing import Dict

from services.model_loader import post_lime_assets

# =========================
# CONSTANTS
# =========================

SAFE_PH_LOWER = 6.8
SAFE_PH_UPPER = 7.2

# Candidate doses used at SPH2
CANDIDATE_POST_LIME_DOSES = [4.0, 5.0]


# =========================
# CORE FUNCTION
# =========================

def get_optimal_post_lime_dose_with_shap(
    raw_ph: float,
    raw_turbidity: float,
    raw_conductivity: float
) -> Dict:
    """
    Simulate post-lime doses, predict ΔpH_post, compute final treated pH,
    select optimal dose, compute SHAP explanation and conformal interval.

    Returns a structured Python dict.
    """

    model = post_lime_assets["model"]
    scaler = post_lime_assets["scaler"]
    explainer = post_lime_assets["explainer"]
    conformal_data = post_lime_assets["conformal"]
    q_hat = conformal_data["q_hat"]


    predictions = []

    # -------------------------------------------------
    # 1. Dose simulation & prediction
    # -------------------------------------------------
    for dose in CANDIDATE_POST_LIME_DOSES:
        features = np.array([
            raw_ph,
            raw_turbidity,
            raw_conductivity,
            dose
        ]).reshape(1, -1)

        scaled_features = scaler.transform(features)

        delta_ph = float(model.predict(scaled_features)[0])
        final_ph = raw_ph + delta_ph

        predictions.append({
            "dose": dose,
            "delta_ph": delta_ph,
            "final_ph": final_ph
        })

    # -------------------------------------------------
    # 2. Select best dose based on safe band
    # -------------------------------------------------
    inside_band = [
        p for p in predictions
        if SAFE_PH_LOWER <= p["final_ph"] <= SAFE_PH_UPPER
    ]

    if inside_band:
        # Prefer lowest dose inside band
        best_result = min(inside_band, key=lambda x: x["dose"])
    else:
        # Choose closest to safe band, prefer lower dose on tie
        best_result = min(
            predictions,
            key=lambda x: (
                min(
                    abs(x["final_ph"] - SAFE_PH_LOWER),
                    abs(x["final_ph"] - SAFE_PH_UPPER)
                ),
                x["dose"]
            )
        )

    best_dose = best_result["dose"]
    best_final_ph = best_result["final_ph"]
    best_delta_ph = best_result["delta_ph"]

    # -------------------------------------------------
    # 3. SHAP explanation (on ΔpH_post)
    # -------------------------------------------------
    shap_features = np.array([
        raw_ph,
        raw_turbidity,
        raw_conductivity,
        best_dose
    ]).reshape(1, -1)

    shap_scaled = scaler.transform(shap_features)
    shap_values = explainer.shap_values(shap_scaled)

    shap_explanation = {
        "feature_names": [
            "raw_water_ph",
            "raw_water_turbidity",
            "raw_water_conductivity",
            "post_lime_dose_ppm"
        ],
        "feature_values": [
            raw_ph,
            raw_turbidity,
            raw_conductivity,
            best_dose
        ],
        "shap_values": shap_values[0].tolist(),
        "base_value": float(explainer.expected_value)
    }

    # -------------------------------------------------
    # 4. Conformal prediction interval (95%) on final pH
    # -------------------------------------------------
    conformal_interval = {
        "lower_pH": best_final_ph - q_hat,
        "upper_pH": best_final_ph + q_hat
    }

    # -------------------------------------------------
    # 5. Final structured response
    # -------------------------------------------------
    return {
        "recommended_post_lime_dose_ppm": best_dose,
        "predicted_delta_pH": best_delta_ph,
        "predicted_final_pH_sph2": best_final_ph,
        "safe_band": {
            "lower": SAFE_PH_LOWER,
            "upper": SAFE_PH_UPPER
        },
        "conformal_interval": conformal_interval,
        "shap_explanation": shap_explanation
    }
