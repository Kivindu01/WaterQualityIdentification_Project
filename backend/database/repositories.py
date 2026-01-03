from datetime import datetime
from database.mongo import get_database

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
    Save a pre-lime prediction record.
    """
    db = get_database()
    collection = db[PRE_LIME_COLLECTION]

    record["created_at"] = datetime.utcnow()

    result = collection.insert_one(record)
    return str(result.inserted_id)


def save_post_lime_prediction(record: dict) -> str:
    """
    Save a post-lime prediction record.
    """
    db = get_database()
    collection = db[POST_LIME_COLLECTION]

    record["created_at"] = datetime.utcnow()

    result = collection.insert_one(record)
    return str(result.inserted_id)


# =========================
# FETCH FUNCTIONS
# =========================

def fetch_pre_lime_history(limit: int = 100):
    """
    Fetch recent pre-lime prediction history.
    """
    db = get_database()
    collection = db[PRE_LIME_COLLECTION]

    records = (
        collection
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )

    return list(records)


def fetch_post_lime_history(limit: int = 100):
    """
    Fetch recent post-lime prediction history.
    """
    db = get_database()
    collection = db[POST_LIME_COLLECTION]

    records = (
        collection
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )

    return list(records)
