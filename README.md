# 🥘 Recipe Book Web App

A full-stack recipe management web application where users can create, view, favorite, and manage recipes with user authentication. Built with **React** (frontend), **Flask** (backend), and **MongoDB** (database).  

---

## 🔧 Tech Stack

- **Frontend**: React.js
- **Backend**: Python Flask + Flask-JWT + Flask-Bcrypt
- **Database**: MongoDB (via MongoDB Compass locally)
- **Authentication**: JWT-based Auth
- **State Management**: React Context / Local Storage (for token)

---

## ✨ Features

### 👥 User Auth
- Register with email, username, and password
- Login to receive JWT token
- View current logged-in user info

### 🍽️ Recipe Management
- Create new recipe (title, description, ingredients, instructions, optional image URL)
- View all recipes
- View single recipe
- Update and delete own recipes

### ❤️ Favorite Recipes
- Toggle favorite for any recipe
- View list of user's
