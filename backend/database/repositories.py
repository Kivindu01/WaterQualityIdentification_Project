from datetime import datetime
from typing import Optional
from database.mongo import get_database


# =========================
# COLLECTION NAMES
# =========================

PRE_LIME_COLLECTION = "pre_lime_predictions"
POST_LIME_COLLECTION = "post_lime_predictions"

CLASSIFICATION_COLLECTION = "classification_predictions"
ADVANCE_REGRESSION_COLLECTION = "advance_regression_predictions"
NORMAL_REGRESSION_COLLECTION = "normal_regression_predictions"


# =========================
# GENERIC SAVE HELPER
# =========================

def _save_record(collection_name: str, record: dict) -> str:
    db = get_database()
    collection = db[collection_name]

    record["created_at"] = datetime.utcnow()

    result = collection.insert_one(record)
    return str(result.inserted_id)


# =========================
# SAVE FUNCTIONS
# =========================

def save_pre_lime_prediction(record: dict) -> str:
    return _save_record(PRE_LIME_COLLECTION, record)


def save_post_lime_prediction(record: dict) -> str:
    return _save_record(POST_LIME_COLLECTION, record)


def save_classification_prediction(record: dict) -> str:
    return _save_record(CLASSIFICATION_COLLECTION, record)


def save_advance_regression_prediction(record: dict) -> str:
    return _save_record(ADVANCE_REGRESSION_COLLECTION, record)


def save_normal_regression_prediction(record: dict) -> str:
    return _save_record(NORMAL_REGRESSION_COLLECTION, record)


# =========================
# GENERIC FETCH HELPER
# =========================

def _fetch_history(
    collection_name: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    db = get_database()
    collection = db[collection_name]

    query = {}

    if start_date and end_date:
        query["created_at"] = {
            "$gte": start_date,
            "$lte": end_date
        }

    records = (
        collection
        .find(query, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )

    return list(records)


# =========================
# FETCH HISTORY FUNCTIONS
# =========================

def fetch_pre_lime_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    return _fetch_history(
        PRE_LIME_COLLECTION, start_date, end_date, limit
    )


def fetch_post_lime_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    return _fetch_history(
        POST_LIME_COLLECTION, start_date, end_date, limit
    )


def fetch_classification_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    return _fetch_history(
        CLASSIFICATION_COLLECTION, start_date, end_date, limit
    )


def fetch_advance_regression_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    return _fetch_history(
        ADVANCE_REGRESSION_COLLECTION, start_date, end_date, limit
    )


def fetch_normal_regression_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    return _fetch_history(
        NORMAL_REGRESSION_COLLECTION, start_date, end_date, limit
    )
