from flask import jsonify


def handle_validation_error(error: Exception):
    return jsonify({
        "status": "error",
        "message": str(error)
    }), 400


def handle_not_found_error(error: Exception):
    return jsonify({
        "status": "error",
        "message": "Resource not found"
    }), 404


def handle_internal_error(error: Exception):
    return jsonify({
        "status": "error",
        "message": "Internal server error"
    }), 500
