from database.mongo import get_database
import config

COLLECTION_NAME = "post_lime_auto_predictions"

def get_collection():
    db = get_database(config.SENSOR_DATABASE_NAME)
    return db[COLLECTION_NAME]

def save_post_lime_auto_prediction(data: dict):
    collection = get_collection()
    return collection.insert_one(data).inserted_id

def is_post_lime_predicted(sensor_record_id):
    collection = get_collection()
    return collection.find_one(
        {"sensor_record_id": sensor_record_id}
    ) is not None