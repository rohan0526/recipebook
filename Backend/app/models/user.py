from bson import ObjectId
from datetime import datetime
from app.utils.auth_utils import hash_password

def create_user_document(username, email, password):
    """Create a new user document for MongoDB."""
    return {
        "username": username,
        "email": email,
        "password": hash_password(password),
        "favorites": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

def user_to_json(user):
    """Convert a user document to JSON response format."""
    if not user:
        return None
        
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "favorites": [str(fav) for fav in user.get("favorites", [])],
        "created_at": user.get("created_at", ""),
        "updated_at": user.get("updated_at", "")
    }
