import React, { useState, useEffect } from 'react';
import ProblemRow from './ProblemRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const ProblemTable = ({ problems, onUpdateProblem }) => {
  const [filteredProblems, setFilteredProblems] = useState(problems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // Get unique categories for filter dropdown
  const categories = [...new Set(problems.map(p => p.category))];

  // Difficulty mapping for display
  const difficultyLabels = {
    'very-easy': 'Very Easy',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
  };
  
  // Effect to filter problems when any filter changes
  useEffect(() => {
    let result = [...problems];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term) ||
        p.notes.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Apply difficulty filter
    if (difficultyFilter) {
      result = result.filter(p => p.difficultyClass === difficultyFilter);
    }
    
    setFilteredProblems(result);
  }, [problems, searchTerm, categoryFilter, statusFilter, difficultyFilter]);
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setDifficultyFilter('');
  };
  
  return (
    <div>
      <div className="search-filter-container">
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <select
            className="form-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="very-easy">Very Easy</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        {(searchTerm || categoryFilter || statusFilter || difficultyFilter) && (
          <button 
            className="btn btn-outline-secondary"
            onClick={clearFilters}
          >
            <FontAwesomeIcon icon={faTimes} /> Clear Filters
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="d-none d-md-table-cell">Category</th>
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Link</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map(problem => (
                <ProblemRow 
                  key={problem.id} 
                  problem={problem}
                  onUpdate={onUpdateProblem}
                  showDifficultyColumn={true}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No problems found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-end text-muted">
        Showing {filteredProblems.length} of {problems.length} problems
      </div>
    </div>
  );
};

export default ProblemTable; 