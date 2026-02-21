from datetime import datetime
from database.mongo import get_database
import config


def get_recent_unpredicted_sensor_records(limit_window=8000, batch_size=200):
    """
    Get recent sensor records and return those not predicted yet.
    """

    sensor_db = get_database(config.SENSOR_DATABASE_NAME)
    prediction_db = get_database(config.SENSOR_DATABASE_NAME)

    sensor_collection = sensor_db[config.SENSOR_COLLECTION_NAME]
    prediction_collection = prediction_db[config.SENSOR_PREDICTION_COLLECTION]

    recent_records = list(
        sensor_collection
        .find({})
        .sort("createdAt", -1)
        .limit(limit_window)
    )

    unpredicted = []

    for doc in recent_records:
        exists = prediction_collection.find_one(
            {"sensor_record_id": doc["_id"]},
            {"_id": 1}
        )

        if not exists:
            unpredicted.append(doc)

        if len(unpredicted) >= batch_size:
            break

    return unpredicted


def save_sensor_prediction(sensor_doc: dict, prediction_result: dict):
    """
    Save prediction into sensor DB (same database).
    """

    prediction_db = get_database(config.SENSOR_DATABASE_NAME)
    prediction_collection = prediction_db[config.SENSOR_PREDICTION_COLLECTION]

    record = {
        "sensor_record_id": sensor_doc["_id"],
        "sensor_created_at": sensor_doc.get("createdAt"),
        "raw_inputs": {
            "raw_ph": sensor_doc.get("ph"),
            "raw_turbidity": sensor_doc.get("turbidity"),
            "raw_conductivity": sensor_doc.get("conductivity")
        },
        "prediction": prediction_result,
        "predicted_at": datetime.utcnow()
    }

    prediction_collection.insert_one(record)