from typing import Dict

from ml_logic.pre_lime_logic import get_optimal_pre_lime_dose_with_shap
from database.repositories import save_pre_lime_prediction


def run_pre_lime_prediction(
    raw_ph: float,
    raw_turbidity: float,
    raw_conductivity: float
) -> Dict:
    """
    Service layer for pre-lime prediction.
    - Calls ML logic
    - Saves prediction to MongoDB
    - Returns final result
    """

    try:
        # -----------------------------
        # 1. Run ML logic
        # -----------------------------
        result = get_optimal_pre_lime_dose_with_shap(
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
        record_id = save_pre_lime_prediction(db_record)

        # -----------------------------
        # 4. Attach record ID
        # -----------------------------
        result["record_id"] = record_id

        return result

    except Exception as e:
        # Normalize error for route layer
        raise RuntimeError(f"Pre-lime prediction failed: {str(e)}")
