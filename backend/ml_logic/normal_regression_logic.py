from typing import Dict
import numpy as np
from services.model_loader import normal_regression_assets


def predict_turbidity(features: Dict) -> Dict:

    pipeline = normal_regression_assets["pipeline"]

    X = np.array(list(features.values())).reshape(1, -1)

    result = pipeline.predict_with_explanation(X)

    return result
