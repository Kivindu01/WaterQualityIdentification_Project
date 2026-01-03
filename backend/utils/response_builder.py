from flask import jsonify
from typing import Any, Optional


def success_response(
    data: Any,
    message: str = "Success",
    status_code: int = 200
):
    """
    Standard success API response.
    """
    return jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), status_code


def error_response(
    message: str,
    status_code: int = 400,
    error_code: Optional[str] = None
):
    """
    Standard error API response.
    """
    response = {
        "status": "error",
        "message": message
    }

    if error_code:
        response["error_code"] = error_code

    return jsonify(response), status_code
