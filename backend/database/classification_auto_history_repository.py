from database.mongo import get_database
import config


COLLECTION_NAME = "classification_auto_predictions"


def fetch_classification_auto_history(start_date=None, end_date=None):
    db = get_database(config.SENSOR_DATABASE_NAME)
    collection = db[COLLECTION_NAME]

    query = {}

    if start_date and end_date:
        query["sensor_created_at"] = {
            "$gte": start_date,
            "$lte": end_date
        }

    data = list(
        collection.find(query)
        .sort("sensor_created_at", -1)
    )

    for d in data:
        d["_id"] = str(d["_id"])
        d["sensor_record_id"] = str(d["sensor_record_id"])

    return data