from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

mongo = PyMongo()
jwt = JWTManager()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    mongo.init_app(app)
    jwt.init_app(app)

    from .routes.auth import auth_bp
    from .routes.recipes import recipe_bp
    from .routes.favorites import fav_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(recipe_bp)
    app.register_blueprint(fav_bp)

    return app
