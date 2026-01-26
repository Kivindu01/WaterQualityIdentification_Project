from flask import Blueprint, request
from services.normal_regression_service import run_normal_regression
from utils.response_builder import success_response, error_response
from flask_jwt_extended import jwt_required

normal_regression_bp = Blueprint("normal_regression", __name__)

@normal_regression_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    try:
        data = request.get_json(force=True)
        result = run_normal_regression(data)

        return success_response(
            data=result,
            message="Normal regression successful"
        )

    except Exception as e:
        return error_response(str(e), 400)
