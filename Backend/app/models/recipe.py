from bson import ObjectId
from datetime import datetime

def create_recipe_document(title, description, ingredients, steps, image_key, user_id, cooking_time=None, servings=None, difficulty=None):
    return {
        "title": title,
        "description": description,
        "ingredients": ingredients,
        "steps": steps,
        "image_key": image_key,
        "created_by": ObjectId(user_id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "cooking_time": cooking_time,
        "servings": servings,
        "difficulty": difficulty
    }


def recipe_to_json(recipe):
    if not recipe:
        return None

    cooking_time = recipe.get("cooking_time")
    cooking_time_str = f"{cooking_time} " if cooking_time is not None else ""

    return {
        "id": str(recipe["_id"]),
        "title": recipe["title"],
        "description": recipe["description"],
        "ingredients": recipe["ingredients"],
        "steps": recipe["steps"],
        "image_key": recipe.get("image_key", ""),
        "cooking_time": cooking_time_str,
        "servings": recipe.get("servings", ""),
        "difficulty": recipe.get("difficulty", ""),
        "created_by": str(recipe["created_by"]),
        "created_at": recipe.get("created_at", ""),
        "updated_at": recipe.get("updated_at", "")
    }
