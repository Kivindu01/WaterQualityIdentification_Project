from database.mongo import get_database

USERS_COLLECTION = "users"

def create_user(user: dict):
    db = get_database()
    return db[USERS_COLLECTION].insert_one(user)

def find_user_by_email(email: str):
    db = get_database()
    return db[USERS_COLLECTION].find_one({"email": email})
