import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getProblems } from '../utils/firebase';
import { auth } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, userLoading] = useAuthState(auth);
  const [filteredProblems, setFilteredProblems] = useState({});
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch problems 
  const fetchProblems = async () => {
    // Only fetch problems if user is logged in
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Always get the latest data from Firebase
      const problemData = await getProblems();
      
      if (problemData && problemData.length > 0) {
        // Set the problems directly from Firebase
        setProblems(problemData);
        
        // Update the lastUpdated timestamp for future reference
        if (problemData.some(p => p.lastUpdated)) {
          const latestTimestamp = problemData
            .filter(p => p.lastUpdated)
            .map(p => new Date(p.lastUpdated))
            .reduce((latest, current) => current > latest ? current : latest, new Date(0));
          
          setLastUpdated(latestTimestamp.toISOString());
        }
      } else {
        // No problems found
        setProblems([]);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      setProblems([]);
    }
    setLoading(false);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    if (!userLoading) {
      fetchProblems();
    }
    // Remove polling mechanism - only fetch on initial mount
  }, [user, userLoading]);

  // Organize problems by difficulty
  useEffect(() => {
    if (problems.length > 0) {
      // Filter by search term if provided
      const filtered = searchTerm 
        ? problems.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        : problems;
      
      // Group by difficulty and category
      const categorized = {
        'very-easy': [],
        'easy': [],
        'medium': [],
        'hard': []
      };
      
      filtered.forEach(problem => {
        const difficulty = problem.difficultyClass || 'medium';
        if (!categorized[difficulty]) {
          categorized[difficulty] = [];
        }
        categorized[difficulty].push(problem);
      });
      
      // Sort each category by name
      Object.keys(categorized).forEach(key => {
        categorized[key].sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setFilteredProblems(categorized);
    }
  }, [problems, searchTerm]);

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
      console.log("[ProblemList] Problem difficulty distribution:", diffStats);
      
      // Log any problems with missing or invalid difficulty class
      if (diffStats.other > 0) {
        const invalidProblems = problems.filter(p => !['very-easy', 'easy', 'medium', 'hard'].includes(p.difficultyClass));
        console.warn("[ProblemList] Problems with invalid difficulty class:", invalidProblems);
      }
    }
  }, [problems]);

  const difficultyLabels = {
    'all': 'All Problems',
    'very-easy': 'Very Easy (Light Blue)',
    'easy': 'Easy (Green)',
    'medium': 'Medium (Yellow)',
    'hard': 'Hard (Light Red)'
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'review':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getDifficultyProblems = () => {
    if (activeDifficulty === 'all') {
      return Object.values(filteredProblems).flat();
    }
    return filteredProblems[activeDifficulty] || [];
  };

  // Show loading indicator while checking authentication
  if (userLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Checking authentication...</p>
      </div>
    );
  }

  // Redirect non-logged-in users to access denied message
  if (!user) {
    return (
      <div className="container py-5">
        <div className="card border-danger">
          <div className="card-header bg-danger text-white">
            <h3 className="mb-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Access Restricted
            </h3>
          </div>
          <div className="card-body text-center py-5">
            <h4 className="mb-4">You need to be logged in to view problems</h4>
            <p className="mb-4">Please sign in to access the problem list and track your progress.</p>
            <Link to="/login" className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="problem-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>DSA Problems</h2>
        <div className="search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <h4>No problems available</h4>
          <p className="mt-3">
            {user && user.isAdmin ? 
              "As an admin, you can add problems by uploading a CSV file in the Admin Panel." :
              "Please wait for the administrator to upload problem data."}
          </p>
        </div>
      ) : (
        <>
          {/* Difficulty Filter Tabs */}
          <ul className="nav nav-tabs mb-4">
            {Object.keys(difficultyLabels).map(difficulty => (
              <li className="nav-item" key={difficulty}>
                <button
                  className={`nav-link ${activeDifficulty === difficulty ? 'active category-' + difficulty : ''}`}
                  onClick={() => setActiveDifficulty(difficulty)}
                >
                  {difficultyLabels[difficulty]}
                  {difficulty !== 'all' && (
                    <span className="badge rounded-pill ms-2 bg-dark">
                      {filteredProblems[difficulty]?.length || 0}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Stats Summary */}
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Problem Stats</h5>
                <div className="d-flex justify-content-between text-center">
                  <div>
                    <h6>Total Problems</h6>
                    <div className="fs-4 text-dark">{problems.length}</div>
                  </div>
                  <div>
                    <h6>Very Easy</h6>
                    <div className="fs-4 text-primary">{filteredProblems['very-easy']?.length || 0}</div>
                  </div>
                  <div>
                    <h6>Easy</h6>
                    <div className="fs-4 text-success">{filteredProblems['easy']?.length || 0}</div>
                  </div>
                  <div>
                    <h6>Medium</h6>
                    <div className="fs-4 text-warning">{filteredProblems['medium']?.length || 0}</div>
                  </div>
                  <div>
                    <h6>Hard</h6>
                    <div className="fs-4 text-danger">{filteredProblems['hard']?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problems List Organized by Difficulty */}
          <div className="problem-list">
            {activeDifficulty === 'all' ? (
              // Show all categories when "All" is selected
              Object.entries(filteredProblems).map(([difficulty, problems]) => (
                problems.length > 0 && (
                  <div key={difficulty} className={`category-section category-${difficulty}`}>
                    <h3 className="difficulty-header">{difficultyLabels[difficulty]}</h3>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th className="text-dark">Problem</th>
                            <th className="text-dark">Category</th>
                            <th className="text-dark">Status</th>
                            <th className="text-dark">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {problems.map((problem) => (
                            <tr key={problem.id} className={`category-${problem.difficultyClass || 'medium'}`}>
                              <td className="fw-bold">{problem.name}</td>
                              <td>{problem.category}</td>
                              <td>
                                <span className={`badge ${getStatusClass(problem.status)}`}>
                                  {problem.status || 'Not Started'}
                                </span>
                              </td>
                              <td>
                                {problem.link ? (
                                  <a 
                                    href={problem.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    Solve
                                  </a>
                                ) : (
                                  <span className="text-muted">No link available</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))
            ) : (
              // Show only the selected difficulty category
              <div className={`category-section category-${activeDifficulty}`}>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="text-dark">Problem</th>
                        <th className="text-dark">Category</th>
                        <th className="text-dark">Status</th>
                        <th className="text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDifficultyProblems().map((problem) => (
                        <tr key={problem.id} className={`category-${problem.difficultyClass || 'medium'}`}>
                          <td className="fw-bold">{problem.name}</td>
                          <td>{problem.category}</td>
                          <td>
                            <span className={`badge ${getStatusClass(problem.status)}`}>
                              {problem.status || 'Not Started'}
                            </span>
                          </td>
                          <td>
                            {problem.link ? (
                              <a 
                                href={problem.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-primary"
                              >
                                Solve
                              </a>
                            ) : (
                              <span className="text-muted">No link available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProblemList; 