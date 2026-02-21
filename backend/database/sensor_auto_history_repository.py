from database.mongo import get_database
import config


def serialize_mongo_document(doc):
    """
    Convert MongoDB ObjectId and datetime to JSON serializable format
    """
    doc["_id"] = str(doc["_id"])

    if "sensor_record_id" in doc:
        doc["sensor_record_id"] = str(doc["sensor_record_id"])

    if "sensor_created_at" in doc:
        doc["sensor_created_at"] = doc["sensor_created_at"].isoformat()

    if "predicted_at" in doc:
        doc["predicted_at"] = doc["predicted_at"].isoformat()

    return doc


# ======================================
# PRE-LIME HISTORY
# ======================================
def fetch_pre_lime_auto_history(start_date=None, end_date=None, limit=500):

    db = get_database(config.SENSOR_DATABASE_NAME)
    collection = db["pre_lime_auto_predictions"]

    query = {}

    if start_date and end_date:
        query["predicted_at"] = {
            "$gte": start_date,
            "$lte": end_date
        }

    records = (
        collection
        .find(query)
        .sort("predicted_at", -1)
        .limit(limit)
    )

    return [serialize_mongo_document(r) for r in records]


# ======================================
# POST-LIME HISTORY
# ======================================
def fetch_post_lime_auto_history(start_date=None, end_date=None, limit=500):

    db = get_database(config.SENSOR_DATABASE_NAME)
    collection = db["post_lime_auto_predictions"]

    query = {}

    if start_date and end_date:
        query["predicted_at"] = {
            "$gte": start_date,
            "$lte": end_date
        }

    records = (
        collection
        .find(query)
        .sort("predicted_at", -1)
        .limit(limit)
    )

    return [serialize_mongo_document(r) for r in records]