from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import config

def test_mongo_connection():
    print("🔍 Testing MongoDB connection...")
    print(f"URI: {config.MONGODB_URI}")

    try:
        client = MongoClient(
            config.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )

        # Force a connection
        client.admin.command("ping")
        print("✅ MongoDB ping successful")

        # Test DB access
        db = client[config.MONGODB_DATABASE_NAME]
        print(f"✅ Connected to database: {db.name}")

        # Test write
        test_collection = db["__connection_test__"]
        result = test_collection.insert_one({"test": "ok"})
        print(f"✅ Write successful, inserted_id={result.inserted_id}")

        # Test read
        doc = test_collection.find_one({"_id": result.inserted_id})
        print(f"✅ Read successful: {doc}")

        # Cleanup
        test_collection.delete_one({"_id": result.inserted_id})
        print("🧹 Cleanup successful")

        print("🎉 MongoDB connection fully verified!")

    except ServerSelectionTimeoutError as e:
        print("❌ MongoDB connection failed (timeout)")
        print(e)

    except Exception as e:
        print("❌ Unexpected MongoDB error")
        print(e)


if __name__ == "__main__":
    test_mongo_connection()
