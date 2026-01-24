from typing import Dict
from ml_logic.normal_regression_logic import predict_turbidity
from database.repositories import save_normal_regression_prediction


def run_normal_regression(features: Dict) -> Dict:

    result = predict_turbidity(features)

    record_id = save_normal_regression_prediction({
        "inputs": features,
        "result": result
    })

    result["record_id"] = record_id
    return result


