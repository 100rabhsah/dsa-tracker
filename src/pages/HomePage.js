import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Stats from '../components/Stats';
import ProblemTable from '../components/ProblemTable';
import { parseCSVData } from '../utils/csvUtils';
import { saveUserProblemProgress, getUserProblemProgress, getProblems } from '../utils/firebase';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faChartLine, 
  faCode, 
  faTrophy, 
  faUsersCog, 
  faLaptopCode, 
  faClipboardCheck, 
  faFilter,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const { currentUser, isAdmin } = useAuth();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const fetchProblems = async () => {
    // Only fetch problems if user is logged in
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Always get the master list of problems from Firebase first
      const firebaseProblems = await getProblems();
      
      // If there are no problems in the database, show empty state
      if (!firebaseProblems || firebaseProblems.length === 0) {
        setProblems([]);
        setIsLoading(false);
        return;
      }
      
      // Update timestamp tracking
      if (firebaseProblems.some(p => p.lastUpdated)) {
        const latestTimestamp = firebaseProblems
          .filter(p => p.lastUpdated)
          .map(p => new Date(p.lastUpdated))
          .reduce((latest, current) => current > latest ? current : latest, new Date(0));
        
        setLastUpdated(latestTimestamp.toISOString());
      }
      
      // If the user is logged in, merge their progress with the master list
      if (currentUser) {
        const userProgress = await getUserProblemProgress(currentUser.uid);
        
        if (userProgress && userProgress.length > 0) {
          // Create a new merged list that takes problem details from the master list
          // but preserves user-specific status and notes
          const mergedProblems = firebaseProblems.map(masterProblem => {
            // Look for matching problem in user progress
            const userProblem = userProgress.find(p => p.id === masterProblem.id);
            
            if (userProblem) {
              // Keep master problem properties but use user's status and notes
              return {
                ...masterProblem, // First take all properties from master problem (including difficulty)
                status: userProblem.status || 'Not Started',
                notes: userProblem.notes || ''
              };
            }
            
            // If user doesn't have this problem yet, use the master problem with default status
            return {
              ...masterProblem,
              status: 'Not Started',
              notes: ''
            };
          });
          
          setProblems(mergedProblems);
          
          // Save the merged progress back to user's data to ensure it stays in sync
          saveUserProblemProgress(currentUser.uid, mergedProblems);
        } else {
          // User has no saved progress, use master list with default status
          const newUserProblems = firebaseProblems.map(problem => ({
            ...problem,
            status: 'Not Started',
            notes: ''
          }));
          
          setProblems(newUserProblems);
          
          // Save initial problem set to user's progress
          saveUserProblemProgress(currentUser.uid, newUserProblems);
        }
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      setProblems([]);
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchProblems();
    // Only fetch problems when component mounts or currentUser changes
  }, [currentUser]);
  
  // Debug function to log difficulty distribution
  useEffect(() => {
    if (problems.length > 0) {
      const diffStats = {
        'very-easy': problems.filter(p => p.difficultyClass === 'very-easy').length,
        'easy': problems.filter(p => p.difficultyClass === 'easy').length,
        'medium': problems.filter(p => p.difficultyClass === 'medium').length,
        'hard': problems.filter(p => p.difficultyClass === 'hard').length,
        'other': problems.filter(p => !['very-easy', 'easy', 'medium', 'hard'].includes(p.difficultyClass)).length
      };
      console.log("[HomePage] Problem difficulty distribution:", diffStats);
      
      // Log any problems with missing or invalid difficulty class
      if (diffStats.other > 0) {
        const invalidProblems = problems.filter(p => !['very-easy', 'easy', 'medium', 'hard'].includes(p.difficultyClass));
        console.warn("[HomePage] Problems with invalid difficulty class:", invalidProblems);
      }
    }
  }, [problems]);
  
  // Save progress when problems state changes and user is logged in
  useEffect(() => {
    if (!isLoading && currentUser && problems.length > 0) {
      saveUserProblemProgress(currentUser.uid, problems);
    }
  }, [problems, currentUser, isLoading]);
  
  // Handle problem update
  const handleUpdateProblem = (updatedProblem) => {
    setProblems(prevProblems => 
      prevProblems.map(problem => 
        problem.id === updatedProblem.id ? updatedProblem : problem
      )
    );
  };
  
  // Landing page for non-logged-in users
  const renderLandingPage = () => {
    return (
      <div className="landing-page">
        {/* Hero Section */}
        <div className="hero-section p-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bold mb-4">Master Your DSA Journey</h1>
              <p className="lead mb-4">Track, organize, and conquer your Data Structures and Algorithms challenges all in one place. Boost your problem-solving skills and prepare for technical interviews with confidence.</p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/login" className="btn btn-primary px-4 py-3">
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Get Started For Free
                </Link>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="hero-image-container">
                <div className="text-center py-4">
                  <FontAwesomeIcon icon={faLaptopCode} className="fa-5x mb-4 text-primary" />
                  <h3 className="fw-bold text-dark">Track Your Progress</h3>
                  <p className="mb-0 text-muted">Join thousands of developers improving their DSA skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section mb-5">
          <h2 className="text-center fw-bold mb-5">Why Use DSA Tracker?</h2>
          <div className="row g-4">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <FontAwesomeIcon icon={faChartLine} className="fa-2x" />
                  </div>
                  <h3 className="card-title">Track Progress</h3>
                  <p className="card-text">Monitor your improvement over time with visual statistics and completion rates.</p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Visual progress tracking
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Completion statistics
                    </li>
                    <li>
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Problem status management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <FontAwesomeIcon icon={faClipboardCheck} className="fa-2x" />
                  </div>
                  <h3 className="card-title">Organize Problems</h3>
                  <p className="card-text">Keep your DSA problems organized by difficulty, category, and status.</p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Categorized problem sets
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Custom notes for each problem
                    </li>
                    <li>
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Link to original problem sources
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <FontAwesomeIcon icon={faFilter} className="fa-2x" />
                  </div>
                  <h3 className="card-title">Smart Filtering</h3>
                  <p className="card-text">Find exactly what you need with powerful filtering and searching capabilities.</p>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Filter by difficulty level
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Search by problem name
                    </li>
                    <li>
                      <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                      Group by solution status
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2 className="fw-bold mb-4">Ready to Boost Your DSA Skills?</h2>
          <p className="lead mb-4">Join thousands of developers who have improved their problem-solving abilities using DSA Tracker.</p>
          <Link to="/login" className="btn btn-primary btn-lg px-5 py-3">
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Sign In Now
          </Link>
        </div>
      </div>
    );
  };
  
  // Problem list for logged-in users
  const renderProblemList = () => {
    return (
      <div>
        {problems.length > 0 ? (
          <>
            <Stats problems={problems} />
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Problem List</h2>
            </div>
            
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading problems...</p>
              </div>
            ) : (
              <ProblemTable 
                problems={problems} 
                onUpdateProblem={handleUpdateProblem} 
              />
            )}
          </>
        ) : (
          <div className="alert alert-info text-center py-5">
            <h4 className="alert-heading">No Problems Available</h4>
            <p className="mb-0">
              {isAdmin ? 
                "As an admin, you can add problems by uploading a CSV file in the Admin Panel." :
                "Please wait for the administrator to upload problem data."}
            </p>
            {isAdmin && (
              <div className="mt-3">
                <Link to="/admin" className="btn btn-primary">
                  <FontAwesomeIcon icon={faUsersCog} className="me-2" />
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      {currentUser ? renderProblemList() : renderLandingPage()}
    </>
  );
};

export default HomePage; 