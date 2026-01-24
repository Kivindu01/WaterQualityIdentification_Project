from flask import Blueprint, request
from datetime import datetime
from database.repositories import (
    fetch_pre_lime_history,
    fetch_post_lime_history
)
from utils.response_builder import success_response, error_response
from flask_jwt_extended import jwt_required

history_bp = Blueprint("history", __name__)


# =========================
# HELPERS
# =========================

def parse_date(date_str: str) -> datetime:
    """
    Parse date from YYYY-MM-DD format.
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")


# =========================
# PRE-LIME HISTORY
# =========================

@history_bp.route("/pre-lime", methods=["GET"])
@jwt_required()
def get_pre_lime_history():
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        limit = int(request.args.get("limit", 50))

        start_dt = parse_date(start_date) if start_date else None
        end_dt = parse_date(end_date) if end_date else None

        records = fetch_pre_lime_history(
            start_date=start_dt,
            end_date=end_dt,
            limit=limit
        )

        return success_response(records, "Pre-lime history fetched")

    except ValueError as ve:
        return error_response(str(ve), 400)

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# POST-LIME HISTORY
# =========================

@history_bp.route("/post-lime", methods=["GET"])
def get_post_lime_history():
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        limit = int(request.args.get("limit", 50))

        start_dt = parse_date(start_date) if start_date else None
        end_dt = parse_date(end_date) if end_date else None

        records = fetch_post_lime_history(
            start_date=start_dt,
            end_date=end_dt,
            limit=limit
        )

        return success_response(records, "Post-lime history fetched")

    except ValueError as ve:
        return error_response(str(ve), 400)

    except Exception as e:
        return error_response(str(e), 500)
