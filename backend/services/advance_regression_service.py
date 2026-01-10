from typing import Dict
from ml_logic.advance_regression_logic import predict_alum_dosage
from database.repositories import save_advance_regression_prediction


def run_advance_regression(features: Dict) -> Dict:

    result = predict_alum_dosage(features)

    record_id = save_advance_regression_prediction({
        "inputs": features,
        "result": result
    })

    result["record_id"] = record_id
    return result
