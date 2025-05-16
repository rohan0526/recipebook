from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo
from bson.objectid import ObjectId

def hash_password(password):
    """Hash a password for storing."""
    return generate_password_hash(password)

def verify_password(stored_password, provided_password):
    """Verify a stored password against a provided password."""
    return check_password_hash(stored_password, provided_password)

def get_user_by_email(email):
    """Find a user by their email."""
    return mongo.db.users.find_one({"email": email})

def get_user_by_id(user_id):
    """Find a user by their ObjectId."""
    return mongo.db.users.find_one({"_id": ObjectId(user_id)})

def get_user_by_username(username):
    """Find a user by their username."""
    return mongo.db.users.find_one({"username": username})
