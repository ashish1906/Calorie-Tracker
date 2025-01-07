import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../../frontend/src/components/Auth/Login';
import Register from '../../frontend/src/components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';

const App = () => {
  const [isAuthenticated,setIsAuthenticated]=useState(!!localStorage.getItem('calorie'))

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/login" />}
        />

        {/* Redirect to Login */} 
        <Route path="*" element={<Navigate to="/login"/>} />
      </Routes>
    </Router>
  );
};

export default App;
