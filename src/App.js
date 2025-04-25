import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import ProblemsPage from './pages/ProblemsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { exportToCSV } from './utils/csvUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const AppContent = () => {
  const { isAdmin } = useAuth();
  
  // Handle CSV import - only for admins
  const handleImportCSV = (csvData) => {
    if (!isAdmin) return; 
    console.log('Import request received in App.js');
  };
  
  // Handle CSV export - only for admins
  const handleExportCSV = () => {
    if (!isAdmin) return;
    // Get data from localStorage for export
    const data = JSON.parse(localStorage.getItem('dsaTrackerData') || '[]');
    exportToCSV(data);
  };
  
  return (
    <>
      <Navbar onImport={handleImportCSV} onExport={handleExportCSV} />
      
      <div className="container app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
        </Routes>
      </div>
      
      <footer className="bg-light text-center py-3 mt-5">
        <div className="container">
          <p className="mb-0">
            Made with <FontAwesomeIcon icon={faHeart} className="text-danger mx-1" /> by{' '}
            <a 
              href="https://www.linkedin.com/in/sourabhsah/" 
              target="_blank"
              rel="noopener noreferrer" 
              className="text-decoration-none fw-bold"
            >
              Sourabh Sah
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 