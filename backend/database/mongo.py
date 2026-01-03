from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import config

_client = None
_db = None


def get_mongo_client():
    """
    Create and return a singleton MongoDB client.
    """
    global _client

    if _client is None:
        try:
            _client = MongoClient(
                config.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            # Force connection test
            _client.admin.command("ping")
            print("✅ MongoDB connection established")
        except ConnectionFailure as e:
            print("❌ MongoDB connection failed")
            raise e

    return _client


def get_database():
    """
    Return the MongoDB database instance.
    """
    global _db

    if _db is None:
        client = get_mongo_client()
        _db = client[config.MONGODB_DATABASE_NAME]

    return _db
