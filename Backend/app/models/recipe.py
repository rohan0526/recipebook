from bson import ObjectId
from datetime import datetime

def create_recipe_document(title, description, ingredients, steps, image_key, user_id):
    """Create a new recipe document for MongoDB."""
    return {
        "title": title,
        "description": description,
        "ingredients": ingredients,
        "steps": steps,
        "image_key": image_key,
        "created_by": ObjectId(user_id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

def recipe_to_json(recipe):
    """Convert a recipe document to JSON response format."""
    if not recipe:
        return None
        
    return {
        "id": str(recipe["_id"]),
        "title": recipe["title"],
        "description": recipe["description"],
        "ingredients": recipe["ingredients"],
        "steps": recipe["steps"],
        "image_key": recipe.get("image_key", ""),
        "created_by": str(recipe["created_by"]),
        "created_at": recipe.get("created_at", ""),
        "updated_at": recipe.get("updated_at", "")
    }
