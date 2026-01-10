from datetime import datetime
from database.mongo import get_database
from typing import Optional

# =========================
# COLLECTION NAMES
# =========================

PRE_LIME_COLLECTION = "pre_lime_predictions"
POST_LIME_COLLECTION = "post_lime_predictions"


# =========================
# SAVE FUNCTIONS
# =========================

def save_pre_lime_prediction(record: dict) -> str:
    """
    Save a pre-lime prediction record to MongoDB.
    """
    db = get_database()
    collection = db[PRE_LIME_COLLECTION]

    record["created_at"] = datetime.utcnow()

    result = collection.insert_one(record)
    return str(result.inserted_id)


def save_post_lime_prediction(record: dict) -> str:
    """
    Save a post-lime prediction record to MongoDB.
    """
    db = get_database()
    collection = db[POST_LIME_COLLECTION]

    record["created_at"] = datetime.utcnow()

    result = collection.insert_one(record)
    return str(result.inserted_id)


# =========================
# FETCH FUNCTIONS (WITH DATE RANGE SUPPORT)
# =========================

def fetch_pre_lime_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    """
    Fetch pre-lime prediction history.

    Optional filters:
    - start_date (datetime)
    - end_date (datetime)
    """
    db = get_database()
    collection = db[PRE_LIME_COLLECTION]

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


def fetch_post_lime_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    """
    Fetch post-lime prediction history.

    Optional filters:
    - start_date (datetime)
    - end_date (datetime)
    """
    db = get_database()
    collection = db[POST_LIME_COLLECTION]

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
