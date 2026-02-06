import numpy as np
from typing import Dict, List

from services.model_loader import pre_lime_assets

# =========================
# CONSTANTS
# =========================

SAFE_PH_LOWER = 6.0
SAFE_PH_UPPER = 6.6


# =========================
# CORE FUNCTION
# =========================

def get_optimal_pre_lime_dose_with_shap(
    raw_ph: float,
    raw_turbidity: float,
    raw_conductivity: float
) -> Dict:
    """
    Simulate pre-lime doses, predict settled pH, select optimal dose,
    compute SHAP explanation and conformal interval.

    Returns a structured Python dict.
    """

    model = pre_lime_assets["model"]
    scaler = pre_lime_assets["scaler"]
    explainer = pre_lime_assets["explainer"]
    conformal_data = pre_lime_assets["conformal"]
    q_hat = conformal_data["q_hat"]

    # -------------------------------------------------
    # 1. Candidate dose simulation
    # -------------------------------------------------
    # Dataset contains only 0 ppm historically
    candidate_doses = [0.0]

    predictions = []

    for dose in candidate_doses:
        features = np.array([
            raw_ph,
            raw_turbidity,
            raw_conductivity,
            dose
        ]).reshape(1, -1)

        scaled_features = scaler.transform(features)

        predicted_ph = float(model.predict(scaled_features)[0])

        predictions.append({
            "dose": dose,
            "predicted_ph": predicted_ph
        })

    # -------------------------------------------------
    # 2. Select best dose based on safe band
    # -------------------------------------------------
    inside_band = [
        p for p in predictions
        if SAFE_PH_LOWER <= p["predicted_ph"] <= SAFE_PH_UPPER
    ]

    if inside_band:
        best_result = inside_band[0]
    else:
        best_result = min(
            predictions,
            key=lambda x: min(
                abs(x["predicted_ph"] - SAFE_PH_LOWER),
                abs(x["predicted_ph"] - SAFE_PH_UPPER)
            )
        )

    best_dose = best_result["dose"]
    best_ph = best_result["predicted_ph"]

    # -------------------------------------------------
    # 3. SHAP explanation
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
            "pre_lime_dose_ppm"
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
    # 4. Conformal prediction interval (95%)
    # -------------------------------------------------
    conformal_interval = {
        "lower_pH": best_ph - q_hat,
        "upper_pH": best_ph + q_hat
    }

   # -------------------------------------------------
# 5. Build human explanation
# -------------------------------------------------
    explanation_text = build_prelime_explanation(
        best_dose,
        best_ph,
        shap_explanation
    )

# -------------------------------------------------
# 6. Final structured response
# -------------------------------------------------
    return {
        "recommended_dose_ppm": best_dose,
        "predicted_settled_pH": best_ph,
        "safe_band": {
            "lower": SAFE_PH_LOWER,
            "upper": SAFE_PH_UPPER
        },
        "conformal_interval": conformal_interval,
        "shap_explanation": shap_explanation,
        "ambatale_explanation_pre": explanation_text
    }


# =========================================================
# PRE-LIME HUMAN EXPLANATION BUILDER
# =========================================================

def build_prelime_explanation(
    best_dose: float,
    best_ph: float,
    shap_data: dict
) -> str:

    raw_ph = shap_data["feature_values"][0]
    turb = shap_data["feature_values"][1]
    cond = shap_data["feature_values"][2]

    shap_vals = shap_data["shap_values"]

    ph_sv = shap_vals[0]
    turb_sv = shap_vals[1]
    cond_sv = shap_vals[2]

    def direction(val):
        return "increases" if val > 0 else "decreases"

    def abs_fmt(val):
        return f"{abs(val):.3f}"

    # Safe band message
    if SAFE_PH_LOWER <= best_ph <= SAFE_PH_UPPER:
        band_text = (
            f"This predicted value lies within the operational settled-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )
    elif best_ph < SAFE_PH_LOWER:
        band_text = (
            f"This predicted value is below the operational settled-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )
    else:
        band_text = (
            f"This predicted value is above the operational settled-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )

    paragraph = (
        f"The AI model recommends a pre-lime dosage of {best_dose:.0f} ppm "
        f"based on the current raw water conditions. "
        f"The raw water has a turbidity of {turb:.1f} NTU, "
        f"a raw pH of {raw_ph:.2f}, and conductivity of {cond:.1f} µS/cm. "
        f"With this dosage, the predicted settled water pH at CF2 is {best_ph:.3f}. "
        f"{band_text} "
        f"The prediction is mainly influenced by three key factors. "
        f"Raw_Water_PH {direction(ph_sv)} the predicted pH by {abs_fmt(ph_sv)} units. "
        f"Raw_Water_Turbidity {direction(turb_sv)} the predicted pH by {abs_fmt(turb_sv)} units. "
        f"Raw_Water_Conductivity {direction(cond_sv)} the predicted pH by {abs_fmt(cond_sv)} units. "
        f"These combined effects justify the recommended dosage."
    )

    return paragraph