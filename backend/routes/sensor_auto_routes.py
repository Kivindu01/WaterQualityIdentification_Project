from flask import Blueprint, request, jsonify
from datetime import datetime

from database.sensor_auto_history_repository import (
    fetch_pre_lime_auto_history,
    fetch_post_lime_auto_history
)

sensor_auto_bp = Blueprint("sensor_auto", __name__)


# =========================================
# PRE-LIME AUTO HISTORY
# =========================================
@sensor_auto_bp.route("/pre-lime", methods=["GET"])
def get_pre_lime_auto_history():

    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    start_date = None
    end_date = None

    if start_date_str and end_date_str:
        start_date = datetime.fromisoformat(start_date_str)
        end_date = datetime.fromisoformat(end_date_str)

    data = fetch_pre_lime_auto_history(start_date, end_date)

    return jsonify({
        "count": len(data),
        "data": data
    }), 200


# =========================================
# POST-LIME AUTO HISTORY
# =========================================
@sensor_auto_bp.route("/post-lime", methods=["GET"])
def get_post_lime_auto_history():

    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    start_date = None
    end_date = None

    if start_date_str and end_date_str:
        start_date = datetime.fromisoformat(start_date_str)
        end_date = datetime.fromisoformat(end_date_str)

    data = fetch_post_lime_auto_history(start_date, end_date)

    return jsonify({
        "count": len(data),
        "data": data
    }), 200