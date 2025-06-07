from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime
from app import mongo
from app.models.recipe import create_recipe_document, recipe_to_json

recipe_bp = Blueprint('recipes', __name__, url_prefix='/api/recipes')


@recipe_bp.route('', methods=['GET'])
def get_all_recipes():
    recipes = list(mongo.db.recipes.find())
    return jsonify([recipe_to_json(recipe) for recipe in recipes]), 200


@recipe_bp.route('/<recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        recipe = mongo.db.recipes.find_one({"_id": ObjectId(recipe_id)})
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404
        return jsonify(recipe_to_json(recipe)), 200
    except Exception:
        return jsonify({"error": "Invalid recipe ID format"}), 400


@recipe_bp.route('', methods=['POST'])
@jwt_required()
def create_recipe():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate input
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['title', 'description', 'ingredients', 'steps']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    title = data.get('title')
    description = data.get('description')
    ingredients = data.get('ingredients', [])
    steps = data.get('steps', [])
    image_key = data.get('image_key', '')

    cooking_time = data.get('cooking_time')
    if cooking_time is not None:
        try:
            cooking_time = int(cooking_time)
        except ValueError:
            return jsonify({"error": "Cooking time must be an integer"}), 400


    servings = data.get('servings')
    difficulty = data.get('difficulty')

    # Create and save the recipe
    recipe_data = create_recipe_document(
        title, description, ingredients, steps, image_key,
        current_user_id, cooking_time, servings, difficulty
    )

    result = mongo.db.recipes.insert_one(recipe_data)

    if result.inserted_id:
        recipe = mongo.db.recipes.find_one({"_id": result.inserted_id})
        return jsonify(recipe_to_json(recipe)), 201

    return jsonify({"error": "Failed to create recipe"}), 500


@recipe_bp.route('/<recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    try:
        # Find recipe and verify ownership
        recipe = mongo.db.recipes.find_one({"_id": ObjectId(recipe_id)})
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        if str(recipe['created_by']) != current_user_id:
            return jsonify({"error": "Unauthorized to modify this recipe"}), 403

        # Update fields (including new ones)
        update_data = {}
        for field in [
            'title', 'description', 'ingredients', 'steps',
            'image_key', 'cooking_time', 'servings', 'difficulty'
        ]:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        update_data['updated_at'] = datetime.utcnow()

        # Perform update
        result = mongo.db.recipes.update_one(
            {"_id": ObjectId(recipe_id)},
            {"$set": update_data}
        )

        if result.modified_count:
            updated_recipe = mongo.db.recipes.find_one({"_id": ObjectId(recipe_id)})
            return jsonify(recipe_to_json(updated_recipe)), 200

        return jsonify({"message": "No changes made"}), 200

    except Exception as e:
        return jsonify({"error": f"Error updating recipe: {str(e)}"}), 400


@recipe_bp.route('/<recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    current_user_id = get_jwt_identity()

    try:
        # Find recipe and verify ownership
        recipe = mongo.db.recipes.find_one({"_id": ObjectId(recipe_id)})
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        if str(recipe['created_by']) != current_user_id:
            return jsonify({"error": "Unauthorized to delete this recipe"}), 403

        # Delete recipe
        result = mongo.db.recipes.delete_one({"_id": ObjectId(recipe_id)})

        if result.deleted_count:
            return jsonify({"message": "Recipe deleted successfully"}), 200

        return jsonify({"error": "Failed to delete recipe"}), 500

    except Exception as e:
        return jsonify({"error": f"Error deleting recipe: {str(e)}"}), 400
