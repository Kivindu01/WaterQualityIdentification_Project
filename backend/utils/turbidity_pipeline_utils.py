import pandas as pd
import numpy as np

def prepare_features(raw_turbidity, raw_ph, raw_conductivity, alum_dose):
    """
    MUST match training signature exactly
    """
    features = pd.DataFrame({
        'Raw_Water_Turbidity': [raw_turbidity],
        'Turb_roll37': [raw_turbidity * 1.05],
        'Turb_sq': [raw_turbidity ** 2],
        'Raw_Water_PH': [raw_ph],
        'Raw_Water_Conductivity': [raw_conductivity],
        'pH_Cond': [raw_ph * raw_conductivity],
        'Alum_Dosage_ppm': [alum_dose],
        'Dose_Turb': [alum_dose * raw_turbidity]
    })

    return features


# =========================
# Conformal interval (PRE)
# =========================

def get_conformal_interval_pre(point_pred, q_hat):
    lower = point_pred - q_hat
    upper = point_pred + q_hat
    return lower, upper

# =========================
# Polished explanation text
# =========================

def build_turbidity_explanation_polished(
    best_dose,
    best_turb,
    turb_9,
    turb_10
):
    """
    Builds a natural-language explanation for the alum decision.
    """
    target_ntu = 5.0

    if best_dose == 9 and turb_9 < target_ntu:
        text = (
            f"Based on the current raw water quality assessment, the model predicts "
            f"that a 9 ppm alum dose will reduce the settled water turbidity to approximately "
            f"{best_turb:.2f} NTU. This value lies below the operational target of {target_ntu} NTU, "
            f"indicating that the 9 ppm dosage is sufficient to achieve the required water quality. "
            f"While a 10 ppm dose would yield a slightly lower turbidity of {turb_10:.2f} NTU, "
            f"the 9 ppm dose already meets the drinking water standard. Therefore, to minimize "
            f"chemical usage and operational costs while maintaining water safety, the system "
            f"recommends applying 9 ppm alum at the coagulation stage. This represents the "
            f"minimum effective dosage under the present water quality conditions."
        )
    elif best_dose == 10 and turb_10 < target_ntu:
        text = (
            f"Based on the current raw water quality assessment, the model predicts "
            f"that a 9 ppm alum dose would yield a settled water turbidity of {turb_9:.2f} NTU, "
            f"which exceeds the operational target of {target_ntu} NTU. In contrast, a 10 ppm "
            f"alum dose is projected to reduce the turbidity to {best_turb:.2f} NTU, successfully "
            f"achieving the drinking water standard. Given that the 9 ppm dosage is insufficient "
            f"to meet the quality requirements, the system recommends applying 10 ppm alum at "
            f"the coagulation stage. This represents the minimum effective dosage capable of "
            f"delivering safe drinking water under the present water quality conditions, "
            f"balancing treatment efficacy with chemical economy."
        )
    else:
        text = (
            f"Based on the current raw water quality assessment, the model predicts "
            f"that neither 9 ppm nor 10 ppm alum doses achieve the operational target "
            f"of {target_ntu} NTU. A 9 ppm dose would yield {turb_9:.2f} NTU, while "
            f"10 ppm would produce {turb_10:.2f} NTU. Since {best_dose} ppm results in "
            f"the lower turbidity of {best_turb:.2f} NTU, the system recommends applying "
            f"{best_dose} ppm alum as the best available option. Operators should consider "
            f"additional treatment measures such as pH adjustment, increased coagulant "
            f"dosage, or the use of coagulant aids to achieve the required water quality."
        )

    return text


# =========================
# Optimization + explanation
# =========================

def simple_optimize_with_explanation(raw_turb, raw_ph, raw_cond):
    """
    Backend-safe version of notebook optimizer.
    Prints removed; returns structured output.
    """

    # Predict for both doses
    pred_9 = best_pre_model.predict(
        prepare_features(raw_turb, raw_ph, raw_cond, 9)
    )[0]

    pred_10 = best_pre_model.predict(
        prepare_features(raw_turb, raw_ph, raw_cond, 10)
    )[0]

    # Decide dose
    if pred_9 < 5:
        dose = 9
        turb = pred_9
    elif pred_10 < 5:
        dose = 10
        turb = pred_10
    else:
        dose = 9 if pred_9 <= pred_10 else 10
        turb = pred_9 if dose == 9 else pred_10

    # Conformal interval (80%)
    lower, upper = get_conformal_interval(turb, coverage="80%")

    # Explanation text
    explanation = build_turbidity_explanation_polished(
        dose, turb, pred_9, pred_10
    )

    return {
        "recommended_dose": dose,
        "predicted_turbidity": turb,
        "prediction_9ppm": pred_9,
        "prediction_10ppm": pred_10,
        "interval_80": [lower, upper],
        "explanation": explanation,
    }
