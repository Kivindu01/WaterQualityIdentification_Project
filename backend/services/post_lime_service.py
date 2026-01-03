from typing import Dict

from ml_logic.post_lime_logic import get_optimal_post_lime_dose_with_shap
from database.repositories import save_post_lime_prediction


def run_post_lime_prediction(
    raw_ph: float,
    raw_turbidity: float,
    raw_conductivity: float
) -> Dict:
    """
    Service layer for post-lime prediction.
    - Calls ML logic
    - Saves prediction to MongoDB
    - Returns final result
    """

    try:
        # -----------------------------
        # 1. Run ML logic
        # -----------------------------
        result = get_optimal_post_lime_dose_with_shap(
            raw_ph=raw_ph,
            raw_turbidity=raw_turbidity,
            raw_conductivity=raw_conductivity
        )

        # -----------------------------
        # 2. Prepare DB record
        # -----------------------------
        db_record = {
            "raw_inputs": {
                "raw_ph": raw_ph,
                "raw_turbidity": raw_turbidity,
                "raw_conductivity": raw_conductivity
            },
            "prediction": result
        }

        # -----------------------------
        # 3. Save to MongoDB
        # -----------------------------
        record_id = save_post_lime_prediction(db_record)

        # -----------------------------
        # 4. Attach record ID
        # -----------------------------
        result["record_id"] = record_id

        return result

    except Exception as e:
        # Normalize error for route layer
        raise RuntimeError(f"Post-lime prediction failed: {str(e)}")
