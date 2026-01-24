from flask import Blueprint, request
from services.auth_service import register_user, login_user
from utils.response_builder import success_response, error_response
from utils.validators import validate_required_fields, validate_password

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True)
        validate_required_fields(data, ["email", "password"])

        email = data["email"]
        password = data["password"]

        # ✅ validate password HERE
        validate_password(password)

        result = register_user(email, password)
        return success_response(result, "Registration successful")

    except ValueError as ve:
        return error_response(str(ve), 400)

    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        validate_required_fields(data, ["email", "password"])

        email = data["email"]
        password = data["password"]

        result = login_user(email, password)
        return success_response(result, "Login successful")

    except ValueError as ve:
        return error_response(str(ve), 400)

    except Exception as e:
        return error_response(str(e), 500)
