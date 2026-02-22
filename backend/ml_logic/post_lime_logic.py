import numpy as np
from typing import Dict
import pandas as pd
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
        input_df = pd.DataFrame([{
    "Raw_Water_PH": raw_ph,
    "Raw_Water_Turbidity": raw_turbidity,
    "Raw_Water_Conductivity": raw_conductivity,
    "Post_Lime_Dosage_SPH02_ppm": dose
        }])

        scaled_features = scaler.transform(input_df)

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
    shap_df = pd.DataFrame([{
    "Raw_Water_PH": raw_ph,
    "Raw_Water_Turbidity": raw_turbidity,
    "Raw_Water_Conductivity": raw_conductivity,
    "Post_Lime_Dosage_SPH02_ppm": best_dose
}])

    shap_scaled = scaler.transform(shap_df)
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
    # 5. Build human explanation
    # -------------------------------------------------
    explanation_text = build_postlime_explanation(
        best_dose,
        best_final_ph,
        best_delta_ph,
        shap_explanation
    )

        # -------------------------------------------------
        # 6. Final structured response
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
        "shap_explanation": shap_explanation,
        "ambatale_explanation_post": explanation_text
    }



# =========================================================
# POST-LIME HUMAN EXPLANATION BUILDER
# =========================================================

def build_postlime_explanation(
    best_dose: float,
    best_final_ph: float,
    best_delta_ph: float,
    shap_data: dict
) -> str:

    raw_ph = shap_data["feature_values"][0]
    turb = shap_data["feature_values"][1]
    cond = shap_data["feature_values"][2]

    shap_vals = shap_data["shap_values"]

    ph_sv = shap_vals[0]
    turb_sv = shap_vals[1]
    cond_sv = shap_vals[2]
    dose_sv = shap_vals[3]

    def direction(val):
        return "increases" if val > 0 else "decreases"

    def abs_fmt(val):
        return f"{abs(val):.3f}"

    # Safe band message
    if SAFE_PH_LOWER <= best_final_ph <= SAFE_PH_UPPER:
        band_text = (
            f"This predicted final pH lies within the operational treated-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )
    elif best_final_ph < SAFE_PH_LOWER:
        band_text = (
            f"This predicted final pH is below the operational treated-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )
    else:
        band_text = (
            f"This predicted final pH is above the operational treated-water pH band "
            f"of {SAFE_PH_LOWER:.1f}–{SAFE_PH_UPPER:.1f}."
        )

    paragraph = (
        f"The AI model recommends a post-lime dosage of {best_dose:.0f} ppm "
        f"based on the current settled water conditions. "
        f"The incoming pH before post-lime is {raw_ph:.2f}, "
        f"with turbidity {turb:.1f} NTU and conductivity {cond:.1f} µS/cm. "
        f"The model predicts a pH increase (ΔpH) of {best_delta_ph:.3f}, "
        f"resulting in a final treated water pH of {best_final_ph:.3f}. "
        f"{band_text} "
        f"The prediction is primarily influenced by key process factors. "
        f"Raw_Water_PH {direction(ph_sv)} the predicted ΔpH by {abs_fmt(ph_sv)} units. "
        f"Raw_Water_Turbidity {direction(turb_sv)} the predicted ΔpH by {abs_fmt(turb_sv)} units. "
        f"Raw_Water_Conductivity {direction(cond_sv)} the predicted ΔpH by {abs_fmt(cond_sv)} units. "
        f"The selected post-lime dose {direction(dose_sv)} the predicted ΔpH by {abs_fmt(dose_sv)} units. "
        f"These combined effects justify the recommended post-lime dosage."
    )

    return paragraph