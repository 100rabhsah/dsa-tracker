import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Auth/Login';

const LoginPage = () => {
  const { currentUser } = useAuth();
  
  // Redirect to home if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container app-container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 