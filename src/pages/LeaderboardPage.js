import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LeaderboardTable from '../components/Leaderboard/LeaderboardTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSignInAlt, faTrophy, faLock } from '@fortawesome/free-solid-svg-icons';

const LeaderboardPage = () => {
  const { currentUser } = useAuth();

  // Show access restricted message if user is not authenticated
  if (!currentUser) {
    return (
      <div className="access-restricted">
        <div className="card">
          <div className="card-header">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Access Restricted
          </div>
          <div className="card-body">
            <div className="icon-container">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h3>Leaderboard Access Restricted</h3>
            <p>You need to be signed in to view the leaderboard and see how you rank among other DSA problem solvers.</p>
            <p>Sign in to track your progress, compete with others, and earn your spot on the leaderboard!</p>
            <Link to="/login" className="btn btn-primary btn-lg mt-3">
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Sign In to Access
            </Link>
            <div className="mt-4">
              <Link to="/" className="btn btn-outline-secondary">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container app-container">
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
        DSA Problem Solvers Leaderboard
      </h1>
      <p className="lead mb-4">
        Compare your progress with other developers and see where you stand in solving DSA problems.
      </p>
      <div className="row">
        <div className="col-md-12">
          <LeaderboardTable />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 