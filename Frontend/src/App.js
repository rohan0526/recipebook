import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RecipeDetailsPage from './pages/recipes/RecipeDetailsPage';
import AddRecipePage from './pages/recipes/AddRecipePage';
import EditRecipePage from './pages/recipes/EditRecipePage';
import FavoritesPage from './pages/recipes/FavoritesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
        <Route 
          path="/add-recipe" 
          element={
            <ProtectedRoute>
              <AddRecipePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-recipe/:id" 
          element={
            <ProtectedRoute>
              <EditRecipePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <LoginPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <RegisterPage />
          } 
        />
      </Routes>
    </Layout>
  );
}

export default App;
