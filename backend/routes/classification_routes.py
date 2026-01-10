from flask import Blueprint, request
from services.classification_service import run_classification
from utils.validators import validate_required_fields, validate_numeric
from utils.response_builder import success_response, error_response

classification_bp = Blueprint("classification", __name__)


@classification_bp.route("/predict", methods=["POST"])
def classify():
    try:
        data = request.get_json(force=True)

        validate_required_fields(
            data, ["ph", "turbidity", "conductivity"]
        )

        ph = validate_numeric(data["ph"], "ph")
        turbidity = validate_numeric(data["turbidity"], "turbidity")
        conductivity = validate_numeric(data["conductivity"], "conductivity")

        result = run_classification(ph, turbidity, conductivity)

        return success_response(
            data=result,
            message="Classification completed"
        )

    except Exception as e:
        return error_response(str(e), 400)
