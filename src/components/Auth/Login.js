import React, { useState } from 'react';
import { signInWithGoogle } from '../../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faChartLine, faCode, faTrophy, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white py-3">
          <h2 className="text-center mb-0">Sign In to DSA Tracker</h2>
        </div>
        <div className="card-body p-5">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <p className="text-center mb-4">
            Track your Data Structures and Algorithms learning journey with ease.
            Sign in to access all features and save your progress.
          </p>
          
          <div className="d-grid gap-2 mt-4">
            <button 
              className="btn btn-lg btn-primary" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faGoogle} className="me-2" />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-muted">
              We only use Google Sign-In for authentication.
              No password is stored and your data is secure.
            </p>
          </div>
        </div>
      </div>
      
      <div className="card shadow">
        <div className="card-header bg-light">
          <h3 className="mb-0">Benefits of Signing In</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-start">
                <div className="text-primary me-3">
                  <FontAwesomeIcon icon={faChartLine} size="2x" />
                </div>
                <div>
                  <h5>Track Your Progress</h5>
                  <p className="text-muted">Keep track of completed problems and monitor your improvement over time.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-start">
                <div className="text-primary me-3">
                  <FontAwesomeIcon icon={faStickyNote} size="2x" />
                </div>
                <div>
                  <h5>Save Your Notes</h5>
                  <p className="text-muted">Write and save your approach, solutions, and reminders for each problem.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-start">
                <div className="text-primary me-3">
                  <FontAwesomeIcon icon={faCode} size="2x" />
                </div>
                <div>
                  <h5>Filter Problems</h5>
                  <p className="text-muted">Find problems by difficulty, category, or status to optimize your study time.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-start">
                <div className="text-primary me-3">
                  <FontAwesomeIcon icon={faTrophy} size="2x" />
                </div>
                <div>
                  <h5>Join the Leaderboard</h5>
                  <p className="text-muted">Compete with others and see your rank based on problems solved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-center">
          <p className="mb-2">Not ready to sign in yet?</p>
          <Link to="/leaderboard" className="btn btn-outline-primary me-2">View Leaderboard</Link>
          <Link to="/" className="btn btn-outline-secondary">Return to Home</Link>
        </div>
      </div>
    </>
  );
};

export default Login; 