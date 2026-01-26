from passlib.hash import argon2
from flask_jwt_extended import create_access_token
from database.user_repository import create_user, find_user_by_email

def register_user(email: str, password: str):
    existing = find_user_by_email(email)
    if existing:
        raise ValueError("User already exists")

    hashed_password = argon2.hash(password)

    user = {
        "email": email,
        "password": hashed_password
    }

    create_user(user)
    return {"message": "User registered successfully"}

def login_user(email: str, password: str):
    user = find_user_by_email(email)
    if not user:
        raise ValueError("Invalid credentials")

    if not argon2.verify(password, user["password"]):
        raise ValueError("Invalid credentials")

    token = create_access_token(identity=str(user["_id"]))

    return {
        "access_token": token,
        "email": user["email"]
    }


