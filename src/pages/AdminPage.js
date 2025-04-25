import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from '../components/Admin/AdminPanel';

const AdminPage = () => {
  const { currentUser, isAdmin } = useAuth();
  
  // Redirect if not authenticated or not admin
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container app-container">
      <h1 className="mb-4">Admin Panel</h1>
      <AdminPanel />
    </div>
  );
};

export default AdminPage; 