# Recipe Book Backend

A Flask API backend for a Recipe Book application with MongoDB database.

## Features

- **User Authentication**
  - Registration with username, email, and securely hashed password
  - JWT-based authentication
  - Protected routes

- **Recipe Management**
  - Create, read, update, and delete recipes
  - Each recipe includes title, description, ingredients, steps, and image key

- **Favorites**
  - Add/remove recipes to/from a user's favorites
  - Get all favorite recipes for a user

## Setup

### Prerequisites

- Python 3.8+
- MongoDB running locally (or accessible MongoDB instance)
- Pip (Python package manager)

### Installation

1. Clone this repository
2. Set up a virtual environment (recommended):
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Create a `.env` file with the following contents:
   ```
   MONGO_URI=
   JWT_SECRET_KEY=
   ```
6. Install additional test dependencies:
   ```
   pip install requests
   ```

### Running the Application

Start the Flask server:
```
python run.py
```

The API will be available at `http://localhost:5000/api/`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user information (protected)

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe (protected)
- `PUT /api/recipes/:id` - Update a recipe (protected, only by owner)
- `DELETE /api/recipes/:id` - Delete a recipe (protected, only by owner)

### Favorites

- `GET /api/favorites` - Get user's favorite recipes (protected)
- `POST /api/favorites/:id` - Toggle a recipe as favorite (protected)

## Testing

Run the Python test script to test all endpoints:
```
python test_api.py
```

This will attempt to register a user, login, create a recipe, and test all available endpoints. The test script will output detailed information about each API call and provide a summary of results at the end.

## Connecting to Frontend

This API is designed to work with a React frontend. The frontend should handle:

1. User authentication flow
2. Storing the JWT token
3. Including the JWT token in the Authorization header for protected routes
4. Image handling (the backend only stores an image key)

## Security Notes

- All passwords are hashed using Werkzeug's secure hashing
- JWT tokens expire after 1 day
- Protected routes validate token ownership
- Recipe modifications are restricted to the recipe's creator 