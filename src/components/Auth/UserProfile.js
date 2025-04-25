import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faMedal } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser, isAdmin } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="dropdown">
      <button 
        className="btn btn-outline-light dropdown-toggle" 
        type="button" 
        id="userDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName} 
            className="rounded-circle me-2" 
            style={{ width: '24px', height: '24px' }} 
          />
        ) : (
          <FontAwesomeIcon icon={faUser} className="me-2" />
        )}
        {currentUser.displayName || currentUser.email}
      </button>
      
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li>
          <Link to="/leaderboard" className="dropdown-item">
            <FontAwesomeIcon icon={faMedal} className="me-2" />
            Leaderboard
          </Link>
        </li>
        
        {isAdmin && (
          <li>
            <Link to="/admin" className="dropdown-item">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Admin Panel
            </Link>
          </li>
        )}
        
        <li><hr className="dropdown-divider" /></li>
        
        <li>
          <button className="dropdown-item" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserProfile; 