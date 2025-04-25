import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faFileExport, 
  faFileImport, 
  faSignInAlt, 
  faTrophy, 
  faList,
  faHome,
  faUsersCog
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './Auth/UserProfile';

const Navbar = ({ onImport, onExport }) => {
  const { currentUser, isAdmin } = useAuth();
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        onImport(csvData);
      };
      reader.readAsText(file);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <FontAwesomeIcon icon={faCode} className="me-2" />
          DSA Tracker
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className={({isActive}) => 
                isActive ? "nav-link active" : "nav-link"}>
                <FontAwesomeIcon icon={faHome} className="me-1" />
                Home
              </NavLink>
            </li>
            
            {currentUser && (
              <>
                <li className="nav-item">
                  <NavLink to="/problems" className={({isActive}) => 
                    isActive ? "nav-link active" : "nav-link"}>
                    <FontAwesomeIcon icon={faList} className="me-1" />
                    Problems
                  </NavLink>
                </li>
                
                <li className="nav-item">
                  <NavLink to="/leaderboard" className={({isActive}) => 
                    isActive ? "nav-link active" : "nav-link"}>
                    <FontAwesomeIcon icon={faTrophy} className="me-1" />
                    Leaderboard
                  </NavLink>
                </li>
              </>
            )}
            
            {currentUser && isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"}>
                  <FontAwesomeIcon icon={faUsersCog} className="me-1" />
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center">
            {currentUser && isAdmin && (
              <div className="btn-group me-3">
                <label htmlFor="csv-upload" className="btn btn-outline-light">
                  <FontAwesomeIcon icon={faFileImport} className="me-1" />
                  Import CSV
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                
                <button 
                  className="btn btn-outline-light"
                  onClick={onExport}
                >
                  <FontAwesomeIcon icon={faFileExport} className="me-1" />
                  Export CSV
                </button>
              </div>
            )}
            
            {currentUser ? (
              <UserProfile />
            ) : (
              <Link to="/login" className="btn btn-light">
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 