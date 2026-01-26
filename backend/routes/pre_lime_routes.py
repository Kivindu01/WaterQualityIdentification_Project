from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.pre_lime_service import run_pre_lime_prediction
from utils.validators import (
    validate_required_fields,
    validate_numeric,
    validate_ranges
)
from utils.response_builder import success_response, error_response

pre_lime_bp = Blueprint("pre_lime", __name__)


@pre_lime_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict_pre_lime():
    try:
        data = request.get_json(force=True)

        # -----------------------------
        # 1. Validate input presence
        # -----------------------------
        validate_required_fields(
            data,
            ["raw_ph", "raw_turbidity", "raw_conductivity"]
        )

        # -----------------------------
        # 2. Validate numeric values
        # -----------------------------
        raw_ph = validate_numeric(data["raw_ph"], "raw_ph")
        raw_turbidity = validate_numeric(data["raw_turbidity"], "raw_turbidity")
        raw_conductivity = validate_numeric(data["raw_conductivity"], "raw_conductivity")

        # -----------------------------
        # 3. Validate ranges
        # -----------------------------
        validate_ranges(raw_ph, raw_turbidity, raw_conductivity)

        # -----------------------------
        # 4. Run service layer
        # -----------------------------
        result = run_pre_lime_prediction(
            raw_ph=raw_ph,
            raw_turbidity=raw_turbidity,
            raw_conductivity=raw_conductivity
        )

        return success_response(
            data=result,
            message="Pre-lime prediction successful"
        )

    except ValueError as ve:
        return error_response(str(ve), 400)

    except Exception as e:
        return error_response(
            message=str(e),
            status_code=500
        )
