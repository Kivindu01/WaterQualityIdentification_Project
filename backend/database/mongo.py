from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import config

_client = None
_db_cache = {}


def get_mongo_client():
    global _client

    if _client is None:
        try:
            _client = MongoClient(
                config.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            _client.admin.command("ping")
            print("✅ MongoDB connection established")
        except ConnectionFailure as e:
            print("❌ MongoDB connection failed")
            raise e

    return _client


def get_database(db_name=None):
    """
    Returns requested database.
    Default = water_quality_db
    """

    client = get_mongo_client()

    if db_name is None:
        db_name = config.MONGODB_DATABASE_NAME

    if db_name not in _db_cache:
        _db_cache[db_name] = client[db_name]

    return _db_cache[db_name]