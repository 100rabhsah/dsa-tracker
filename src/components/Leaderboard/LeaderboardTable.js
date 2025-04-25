import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const LeaderboardTable = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(); // getLeaderboard now returns all users with ranks
        setLeaderboardData(data);
        setFilteredData(data);
      } catch (err) {
        setError('Failed to load leaderboard. Please try again.');
        console.error(err);
      }
      setLoading(false);
    };
    
    fetchLeaderboard();
    
    // Refresh leaderboard every 5 minutes
    const intervalId = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(leaderboardData);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = leaderboardData.filter(user => 
        user.displayName.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, leaderboardData]);
  
  const getLeaderIcon = (rank) => {
    switch (rank) {
      case 1: return <FontAwesomeIcon icon={faTrophy} className="text-warning" />;
      case 2: return <FontAwesomeIcon icon={faMedal} className="text-secondary" />;
      case 3: return <FontAwesomeIcon icon={faAward} className="text-danger" />;
      default: return rank;
    }
  };
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for last active
  const formatLastActive = (dateObj) => {
    if (!dateObj) return 'Never';
    
    const now = new Date();
    const diff = now - dateObj;
    
    // Less than a day
    if (diff < 86400000) {
      return 'Today';
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // More than a week, show date
    return dateObj.toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading leaderboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }
  
  if (leaderboardData.length === 0) {
    return (
      <div className="alert alert-info">
        No users have solved any problems yet. Be the first one to appear on the leaderboard!
      </div>
    );
  }
  
  return (
    <>
      <div className="d-flex mb-3 justify-content-between align-items-center">
        <h3>DSA Problem Solving Leaderboard</h3>
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="card mb-3">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Problem Solvers Ranking</h5>
          <span className="small">Total Users: {filteredData.length}</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>Rank</th>
                  <th style={{ width: '30%' }}>User</th>
                  <th style={{ width: '15%' }}>Completed</th>
                  <th style={{ width: '15%' }}>Completion %</th>
                  <th style={{ width: '15%' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.uid} className={user.rank <= 3 ? 'table-active' : ''}>
                    <td className="text-center">
                      {getLeaderIcon(user.rank)}
                    </td>
                    <td className="d-flex align-items-center">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName} 
                          className="rounded-circle me-2" 
                          style={{ width: '30px', height: '30px' }} 
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-secondary me-2 text-white d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px', fontSize: '12px' }}
                        >
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span>{user.displayName}</span>
                    </td>
                    <td>
                      {user.completedProblems} 
                      {user.completedProblems > 0 && 
                        <span className="badge rounded-pill bg-success ms-2">
                          solved
                        </span>
                      }
                    </td>
                    <td>
                      <div className="progress" style={{height: '20px'}}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{width: `${user.totalProblems > 0 ? Math.round((user.completedProblems / user.totalProblems) * 100) : 0}%`}}
                          aria-valuenow={user.totalProblems > 0 ? Math.round((user.completedProblems / user.totalProblems) * 100) : 0} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {user.totalProblems > 0 ? Math.round((user.completedProblems / user.totalProblems) * 100) : 0}%
                        </div>
                      </div>
                    </td>
                    <td>{formatLastActive(user.lastActive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            </li>
            
            {/* Display page numbers - improved for large datasets */}
            {(() => {
              const pageNumbers = [];
              const maxPageItems = 7; // Max number of page items to show
              
              // Always show first page
              pageNumbers.push(
                <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(1)}>1</button>
                </li>
              );
              
              // Calculate start and end of page buttons
              let startPage = Math.max(2, currentPage - 2);
              let endPage = Math.min(totalPages - 1, currentPage + 2);
              
              // Add ellipsis after first page if needed
              if (startPage > 2) {
                pageNumbers.push(
                  <li key="ellipsis1" className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              
              // Add page numbers
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i)}>{i}</button>
                  </li>
                );
              }
              
              // Add ellipsis before last page if needed
              if (endPage < totalPages - 1) {
                pageNumbers.push(
                  <li key="ellipsis2" className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              
              // Always show last page if there is more than one page
              if (totalPages > 1) {
                pageNumbers.push(
                  <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(totalPages)}>{totalPages}</button>
                  </li>
                );
              }
              
              return pageNumbers;
            })()}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </li>
          </ul>
        </nav>
      )}
      
      <div className="alert alert-info mt-4">
        <h5>How Rankings Work</h5>
        <p className="mb-0">
          Users are ranked by the number of problems they have completed. Users with the same number of completed problems share the same rank.
        </p>
      </div>
    </>
  );
};

export default LeaderboardTable; 