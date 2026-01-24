from typing import Dict
from ml_logic.classification_logic import classify_water_safety
from database.repositories import save_classification_prediction


def run_classification(
    ph: float,
    turbidity: float,
    conductivity: float
) -> Dict:

    print("RUN_CLASSIFICATION INPUTS:", ph, turbidity, conductivity)

    result = classify_water_safety(ph, turbidity, conductivity)
    print(" Classifications model results: ", result)
    record_id = save_classification_prediction({
        "inputs": {
            "ph": ph,
            "turbidity": turbidity,
            "conductivity": conductivity
        },
        "result": result
    })

    result["record_id"] = record_id
    return result
