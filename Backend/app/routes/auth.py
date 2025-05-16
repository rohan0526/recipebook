from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app import mongo
from app.utils.auth_utils import get_user_by_email, get_user_by_username, verify_password
from app.models.user import create_user_document, user_to_json
from datetime import timedelta
from bson.objectid import ObjectId

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # Check if user already exists
    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409
    
    if get_user_by_username(username):
        return jsonify({"error": "Username already taken"}), 409
    
    # Create new user
    user_data = create_user_document(username, email, password)
    result = mongo.db.users.insert_one(user_data)
    
    if result.inserted_id:
        # Create token for the new user
        access_token = create_access_token(
            identity=str(result.inserted_id),
            expires_delta=timedelta(days=1)
        )
        
        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": {
                "id": str(result.inserted_id),
                "username": username,
                "email": email
            }
        }), 201
    
    return jsonify({"error": "Registration failed"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    # Find user by email
    user = get_user_by_email(email)
    
    if not user or not verify_password(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Create token
    access_token = create_access_token(
        identity=str(user['_id']), 
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user_to_json(user)
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(current_user_id)})
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user_to_json(user)), 200
