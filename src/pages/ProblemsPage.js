import React from 'react';
import ProblemList from '../components/ProblemList';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProblemsPage = () => {
  const { currentUser } = useAuth();

  // Redirect non-logged-in users to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container app-container">
      <h1 className="mb-4">DSA Problem List</h1>
      <p className="lead mb-4">
        Browse all available problems, filter by difficulty, and track your progress.
      </p>
      <ProblemList />
    </div>
  );
};

export default ProblemsPage; 