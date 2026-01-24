from flask import Blueprint, request
from services.classification_service import run_classification
from utils.validators import validate_required_fields, validate_numeric
from utils.response_builder import success_response, error_response

classification_bp = Blueprint("classification", __name__)


@classification_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        result = run_classification(
            ph=data["ph"],
            turbidity=data["turbidity"],
            conductivity=data["conductivity"]
        )

        return success_response(data=result, message="Classification successful")

    except Exception as e:
        return error_response(str(e), 400)

