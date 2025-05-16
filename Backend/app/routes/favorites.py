from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from app import mongo
from app.models.recipe import recipe_to_json

fav_bp = Blueprint('favorites', __name__, url_prefix='/api/favorites')

@fav_bp.route('', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user_id = get_jwt_identity()
    
    try:
        # Get user with favorites list
        user = mongo.db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        favorite_ids = user.get('favorites', [])
        
        # Get all favorite recipes
        favorite_recipes = []
        if favorite_ids:
            recipes = mongo.db.recipes.find({"_id": {"$in": favorite_ids}})
            favorite_recipes = [recipe_to_json(recipe) for recipe in recipes]
        
        return jsonify(favorite_recipes), 200
    
    except Exception as e:
        return jsonify({"error": f"Error fetching favorites: {str(e)}"}), 400

@fav_bp.route('/<recipe_id>', methods=['POST'])
@jwt_required()
def toggle_favorite(recipe_id):
    current_user_id = get_jwt_identity()
    
    try:
        # Verify recipe exists
        recipe = mongo.db.recipes.find_one({"_id": ObjectId(recipe_id)})
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404
        
        # Get user
        user = mongo.db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        recipe_obj_id = ObjectId(recipe_id)
        favorites = user.get('favorites', [])
        
        # Check if recipe is already in favorites
        is_favorite = any(str(fav) == recipe_id for fav in favorites)
        
        if is_favorite:
            # Remove from favorites
            result = mongo.db.users.update_one(
                {"_id": ObjectId(current_user_id)},
                {"$pull": {"favorites": recipe_obj_id}}
            )
            action = "removed from"
        else:
            # Add to favorites
            result = mongo.db.users.update_one(
                {"_id": ObjectId(current_user_id)},
                {"$addToSet": {"favorites": recipe_obj_id}}
            )
            action = "added to"
        
        if result.modified_count:
            return jsonify({
                "message": f"Recipe {action} favorites successfully",
                "is_favorite": not is_favorite
            }), 200
        
        return jsonify({"message": "No changes made"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Error toggling favorite: {str(e)}"}), 400
