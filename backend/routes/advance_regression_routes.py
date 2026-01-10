from flask import Blueprint, request
from services.advance_regression_service import run_advance_regression
from utils.response_builder import success_response, error_response

advance_regression_bp = Blueprint("advance_regression", __name__)


@advance_regression_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        result = run_advance_regression(data)

        return success_response(
            data=result,
            message="Advance regression successful"
        )

    except Exception as e:
        return error_response(str(e), 400)
